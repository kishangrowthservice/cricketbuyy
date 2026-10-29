/**
 * Masks sensitive PII string fields (phone, email, bank account, identity numbers)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '**********';
  const clean = phone.trim();
  if (clean.length <= 4) return '****';
  const visible = clean.slice(-4);
  const maskedPrefix = clean.slice(0, -4).replace(/[0-9]/g, '*');
  return `${maskedPrefix}${visible}`;
}

export function maskFinancialAccount(acc: string): string {
  if (!acc) return '**********';
  const clean = acc.trim();
  if (clean.length <= 4) return '****';
  return `${'*'.repeat(clean.length - 4)}${clean.slice(-4)}`;
}

/**
 * Traverses an object or array and applies field-level masking
 * based on maskedFields array and whether the actor has bypass privileges.
 */
export function applyFieldMask<T>(
  data: T,
  maskedFields: string[] = [],
  allowPii: boolean = false
): T {
  if (allowPii || !data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => applyFieldMask(item, maskedFields, allowPii)) as unknown as T;
  }

  if (typeof data !== 'object') {
    return data;
  }

  const result = { ...(data as Record<string, unknown>) };

  for (const [key, value] of Object.entries(result)) {
    const isExplicitlyMasked = maskedFields.includes(key);

    if (typeof value === 'string') {
      if (key.toLowerCase().includes('email')) {
        result[key] = maskEmail(value);
      } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')) {
        result[key] = maskPhone(value);
      } else if (
        key.toLowerCase().includes('bank') ||
        key.toLowerCase().includes('account') ||
        key.toLowerCase().includes('iban')
      ) {
        result[key] = maskFinancialAccount(value);
      } else if (isExplicitlyMasked) {
        result[key] = '[REDACTED]';
      }
    } else if (isExplicitlyMasked) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = applyFieldMask(value, maskedFields, allowPii);
    }
  }

  return result as T;
}
