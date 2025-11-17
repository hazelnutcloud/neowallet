/**
 * Cryptographic utilities for encrypting/decrypting private keys
 * Uses AES-256-GCM encryption
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive encryption key from master password using scrypt
 */
async function deriveKey(
  password: string,
  salt: Buffer
): Promise<Buffer> {
  return (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
}

/**
 * Encrypt a private key with master password
 * Returns base64 encoded encrypted data with salt and IV prepended
 */
export async function encryptPrivateKey(
  privateKey: string,
  masterPassword: string
): Promise<string> {
  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive key from password
  const key = await deriveKey(masterPassword, salt);

  // Create cipher and encrypt
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + encrypted data
  const result = Buffer.concat([salt, iv, authTag, encrypted]);

  return result.toString("base64");
}

/**
 * Decrypt a private key with master password
 * Takes base64 encoded encrypted data
 */
export async function decryptPrivateKey(
  encryptedData: string,
  masterPassword: string
): Promise<string> {
  // Decode from base64
  const data = Buffer.from(encryptedData, "base64");

  // Extract components
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive key from password
  const key = await deriveKey(masterPassword, salt);

  // Create decipher and decrypt
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
