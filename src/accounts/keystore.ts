/**
 * OS Keystore integration using keytar
 * Handles storing and retrieving the master encryption password
 */

import keytar from "keytar";
import { randomBytes } from "crypto";
import { KEYSTORE_SERVICE, KEYSTORE_MASTER_KEY_ACCOUNT } from "./constants";

/**
 * Generate a random master password (256-bit)
 */
export function generateMasterPassword(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Store master password in OS keystore
 * Will prompt for OS authentication (Touch ID/system password)
 */
export async function storeMasterPassword(password: string): Promise<void> {
  await keytar.setPassword(
    KEYSTORE_SERVICE,
    KEYSTORE_MASTER_KEY_ACCOUNT,
    password
  );
}

/**
 * Retrieve master password from OS keystore
 * Will prompt for OS authentication (Touch ID/system password)
 * Returns null if not found
 */
export async function getMasterPassword(): Promise<string | null> {
  return await keytar.getPassword(
    KEYSTORE_SERVICE,
    KEYSTORE_MASTER_KEY_ACCOUNT
  );
}

/**
 * Check if master password exists in keystore
 */
export async function hasMasterPassword(): Promise<boolean> {
  const password = await getMasterPassword();
  return password !== null;
}

/**
 * Delete master password from OS keystore
 * Use with caution - will make encrypted accounts unrecoverable
 */
export async function deleteMasterPassword(): Promise<boolean> {
  return await keytar.deletePassword(
    KEYSTORE_SERVICE,
    KEYSTORE_MASTER_KEY_ACCOUNT
  );
}
