/**
 * Constants for the accounts module
 */

import { homedir } from "os";
import { join } from "path";

// Storage locations
export const NEOWALLET_DIR = join(homedir(), ".neowallet");
export const ACCOUNTS_FILE_PATH = join(NEOWALLET_DIR, "accounts.json");

// Keystore identifiers for OS keystore
export const KEYSTORE_SERVICE = "neowallet";
export const KEYSTORE_MASTER_KEY_ACCOUNT = "master-encryption-key";

// Default values
export const DEFAULT_ACCOUNT_NAME_PREFIX = "Account";
export const ACCOUNTS_FILE_VERSION = 1;
