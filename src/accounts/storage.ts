/**
 * File system storage for encrypted accounts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import {
  NEOWALLET_DIR,
  ACCOUNTS_FILE_PATH,
  ACCOUNTS_FILE_VERSION,
} from "./constants";
import type { AccountsFile, EncryptedAccount } from "./types";

/**
 * Ensure the neowallet directory exists
 */
function ensureNeowalletDir(): void {
  if (!existsSync(NEOWALLET_DIR)) {
    mkdirSync(NEOWALLET_DIR, { recursive: true });
  }
}

/**
 * Check if accounts file exists
 */
export function accountsFileExists(): boolean {
  return existsSync(ACCOUNTS_FILE_PATH);
}

/**
 * Read accounts file from disk
 * Returns empty structure if file doesn't exist
 */
export function readAccountsFile(): AccountsFile {
  if (!accountsFileExists()) {
    return {
      version: ACCOUNTS_FILE_VERSION,
      accounts: [],
    };
  }

  try {
    const data = readFileSync(ACCOUNTS_FILE_PATH, "utf-8");
    return JSON.parse(data) as AccountsFile;
  } catch (error) {
    console.error("Error reading accounts file:", error);
    return {
      version: ACCOUNTS_FILE_VERSION,
      accounts: [],
    };
  }
}

/**
 * Write accounts file to disk
 */
export function writeAccountsFile(accountsFile: AccountsFile): void {
  ensureNeowalletDir();
  const data = JSON.stringify(accountsFile, null, 2);
  writeFileSync(ACCOUNTS_FILE_PATH, data, "utf-8");
}

/**
 * Add an account to the accounts file
 */
export function addAccountToFile(account: EncryptedAccount): void {
  const accountsFile = readAccountsFile();
  accountsFile.accounts.push(account);
  writeAccountsFile(accountsFile);
}

/**
 * Update an account in the accounts file
 */
export function updateAccountInFile(account: EncryptedAccount): void {
  const accountsFile = readAccountsFile();
  const index = accountsFile.accounts.findIndex((a) => a.id === account.id);
  if (index !== -1) {
    accountsFile.accounts[index] = account;
    writeAccountsFile(accountsFile);
  }
}

/**
 * Remove an account from the accounts file
 */
export function removeAccountFromFile(accountId: string): void {
  const accountsFile = readAccountsFile();
  accountsFile.accounts = accountsFile.accounts.filter(
    (a) => a.id !== accountId
  );
  writeAccountsFile(accountsFile);
}

/**
 * Get all accounts from file
 */
export function getAllAccountsFromFile(): EncryptedAccount[] {
  return readAccountsFile().accounts;
}
