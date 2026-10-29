import crypto from 'crypto';

// Base32 RFC 4648 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(byteLength: number = 20): string {
  const bytes = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === undefined) continue;
    value = (value << 8) | b;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (!char) continue;
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpToken(
  secret: string,
  timeMs: number = Date.now(),
  stepSec: number = 30,
  digits: number = 6
): string {
  const key = base32ToBuffer(secret);
  const counter = Math.floor(timeMs / 1000 / stepSec);

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuf);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const lastByte = digest[digest.length - 1];
  if (lastByte === undefined) throw new Error('Digest error');
  const offset = lastByte & 0xf;

  const b0 = digest[offset];
  const b1 = digest[offset + 1];
  const b2 = digest[offset + 2];
  const b3 = digest[offset + 3];

  if (b0 === undefined || b1 === undefined || b2 === undefined || b3 === undefined) {
    throw new Error('Offset out of bounds');
  }

  const binary =
    ((b0 & 0x7f) << 24) |
    ((b1 & 0xff) << 16) |
    ((b2 & 0xff) << 8) |
    (b3 & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Validates a TOTP token with ±1 step window tolerance (±30 seconds)
 */
export function verifyTotpToken(
  token: string,
  secret: string,
  timeMs: number = Date.now(),
  stepSec: number = 30,
  window: number = 1
): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false;
  }

  try {
    for (let i = -window; i <= window; i++) {
      const checkTime = timeMs + i * stepSec * 1000;
      const expectedToken = generateTotpToken(secret, checkTime, stepSec, 6);
      if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export function getTotpUri(email: string, secret: string, issuer: string = 'Cricketbuyy Admin'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

