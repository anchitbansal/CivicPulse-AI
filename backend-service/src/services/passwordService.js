import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash?.startsWith('scrypt$')) return false;
  const [, salt, keyHex] = storedHash.split('$');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  const expected = Buffer.from(keyHex, 'hex');
  return expected.length === derivedKey.length && crypto.timingSafeEqual(expected, derivedKey);
}
