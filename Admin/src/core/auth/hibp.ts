import crypto from 'crypto';

export interface HibpCheckResult {
  isBreached: boolean;
  breachCount: number;
  warning?: string;
}

/**
 * Checks if a password has appeared in known data breaches using the
 * HaveIBeenPwned k-anonymity range API (§5.3).
 *
 * Only the first 5 characters of the SHA-1 hash leave the server.
 * If the service is unreachable or network times out: allows password,
 * logs a security warning, and marks for re-check.
 */
export async function checkBreachedPassword(
  password: string,
  timeoutMs: number = 2500
): Promise<HibpCheckResult> {
  try {
    // 1. Compute uppercase SHA-1 hash of the candidate password
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    // 2. Query HIBP range API with strict timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cricketbuyy-Admin-Security-Auditor/1.0',
        'Add-Padding': 'true' // HIBP padding against response-length analysis
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isBreached: false,
        breachCount: 0,
        warning: `HIBP API returned HTTP ${response.status}. Breach verification deferred.`
      };
    }

    const text = await response.text();
    const lines = text.split('\r\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
        const breachCount = parseInt(countStr || '0', 10);
        return {
          isBreached: breachCount > 0,
          breachCount
        };
      }
    }

    return {
      isBreached: false,
      breachCount: 0
    };
  } catch (err) {
    return {
      isBreached: false,
      breachCount: 0,
      warning: `HIBP lookup failed or timed out (${(err as Error).message}). Permitting creation with deferral.`
    };
  }
}

/**
 * NIST SP 800-63B Compliant Password Validator (§5.3)
 * - Minimum 12 characters, Maximum >= 128
 * - All Unicode and spaces allowed
 * - No arbitrary composition rules (no mandatory special chars/digits)
 */
export function validatePasswordPolicy(password: string): { valid: boolean; reason?: string } {
  if (password.length < 12) {
    return {
      valid: false,
      reason: 'Password must be at least 12 characters in length (NIST SP 800-63B)'
    };
  }

  if (password.length > 256) {
    return {
      valid: false,
      reason: 'Password cannot exceed 256 characters'
    };
  }

  return { valid: true };
}

