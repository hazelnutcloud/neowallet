/**
 * Account Manager
 * Main API for managing accounts (create, import, unlock, lock)
 */

import { randomBytes } from "crypto";
import { privateKeyToAddress } from "viem/accounts";

import type {
  EncryptedAccount,
  DecryptedAccount,
  CreateAccountOptions,
} from "./types";
import { AccountSource } from "./types";
import {
  generateMasterPassword,
  storeMasterPassword,
  getMasterPassword,
  hasMasterPassword,
} from "./keystore";
import { encryptPrivateKey, decryptPrivateKey } from "./crypto";
import {
  addAccountToFile,
  getAllAccountsFromFile,
  updateAccountInFile,
  removeAccountFromFile,
} from "./storage";
import { DEFAULT_ACCOUNT_NAME_PREFIX } from "./constants";

/**
 * Account Manager class
 * Handles all account operations
 */
export class AccountManager {
  private decryptedAccounts: Map<string, DecryptedAccount> = new Map();
  private isUnlocked: boolean = false;

  /**
   * Initialize the account manager
   * Sets up master password on first run
   */
  async initialize(): Promise<void> {
    // Check if master password exists
    const hasMaster = await hasMasterPassword();

    if (!hasMaster) {
      // First time setup - generate and store master password
      const masterPassword = generateMasterPassword();
      await storeMasterPassword(masterPassword);
      console.log("Master password generated and stored in OS keystore");
    }
  }

  /**
   * Unlock accounts by retrieving master password from OS keystore
   * This will prompt for OS authentication (Touch ID/system password)
   */
  async unlock(): Promise<void> {
    if (this.isUnlocked) {
      return;
    }

    // Get master password from OS keystore (triggers OS auth)
    const masterPassword = await getMasterPassword();
    if (!masterPassword) {
      throw new Error("Master password not found in keystore");
    }

    // Load and decrypt all accounts
    const encryptedAccounts = getAllAccountsFromFile();
    this.decryptedAccounts.clear();

    for (const encryptedAccount of encryptedAccounts) {
      try {
        // Skip decryption for Frame accounts (they don't have private keys)
        let privateKey: `0x${string}` | undefined;
        if (encryptedAccount.source !== AccountSource.FRAME && encryptedAccount.encryptedPrivateKey) {
          privateKey = (await decryptPrivateKey(
            encryptedAccount.encryptedPrivateKey,
            masterPassword
          )) as `0x${string}`;
        }

        const decryptedAccount: DecryptedAccount = {
          id: encryptedAccount.id,
          name: encryptedAccount.name,
          address: encryptedAccount.address,
          source: encryptedAccount.source,
          privateKey,
          createdAt: encryptedAccount.createdAt,
          updatedAt: encryptedAccount.updatedAt,
        };

        this.decryptedAccounts.set(encryptedAccount.id, decryptedAccount);
      } catch (error) {
        console.error(`Failed to decrypt account ${encryptedAccount.id}:`, error);
      }
    }

    this.isUnlocked = true;
    console.log(`Unlocked ${this.decryptedAccounts.size} accounts`);
  }

  /**
   * Lock accounts by clearing decrypted keys from memory
   */
  lock(): void {
    this.decryptedAccounts.clear();
    this.isUnlocked = false;
    console.log("Accounts locked");
  }

  /**
   * Check if accounts are currently unlocked
   */
  getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Create a new account (import or generate)
   */
  async createAccount(options: CreateAccountOptions): Promise<DecryptedAccount> {
    // Ensure we're unlocked
    if (!this.isUnlocked) {
      await this.unlock();
    }

    // Get master password
    const masterPassword = await getMasterPassword();
    if (!masterPassword) {
      throw new Error("Master password not found");
    }

    // Get or generate private key
    let privateKey: `0x${string}`;
    if (options.source === "imported") {
      if (!options.privateKey) {
        throw new Error("Private key required for imported accounts");
      }
      privateKey = options.privateKey;
    } else {
      // Generate random private key
      privateKey = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
    }

    // Derive address from private key
    const address = privateKeyToAddress(privateKey);

    // Generate account name if not provided
    const accountCount = this.decryptedAccounts.size;
    const name = options.name || `${DEFAULT_ACCOUNT_NAME_PREFIX} ${accountCount + 1}`;

    // Encrypt private key
    const encryptedPrivateKey = await encryptPrivateKey(privateKey, masterPassword);

    // Create account objects
    const now = Date.now();
    const id = randomBytes(16).toString("hex");

    const encryptedAccount: EncryptedAccount = {
      id,
      name,
      address,
      source: options.source,
      encryptedPrivateKey,
      createdAt: now,
      updatedAt: now,
    };

    const decryptedAccount: DecryptedAccount = {
      id,
      name,
      address,
      source: options.source,
      privateKey,
      createdAt: now,
      updatedAt: now,
    };

    // Save to file
    addAccountToFile(encryptedAccount);

    // Add to memory
    this.decryptedAccounts.set(id, decryptedAccount);

    console.log(`Created ${options.source} account: ${address}`);
    return decryptedAccount;
  }

  /**
   * Import an account from a private key
   */
  async importAccount(privateKey: `0x${string}`, name?: string): Promise<DecryptedAccount> {
    return this.createAccount({
      source: AccountSource.IMPORTED,
      privateKey,
      name,
    });
  }

  /**
   * Generate a new random account
   */
  async generateAccount(name?: string): Promise<DecryptedAccount> {
    return this.createAccount({
      source: AccountSource.GENERATED,
      name,
    });
  }

  /**
   * Get all decrypted accounts
   */
  getAccounts(): DecryptedAccount[] {
    if (!this.isUnlocked) {
      return [];
    }
    return Array.from(this.decryptedAccounts.values());
  }

  /**
   * Get a specific account by ID
   */
  getAccount(id: string): DecryptedAccount | undefined {
    if (!this.isUnlocked) {
      return undefined;
    }
    return this.decryptedAccounts.get(id);
  }

  /**
   * Get account by address
   */
  getAccountByAddress(address: string): DecryptedAccount | undefined {
    if (!this.isUnlocked) {
      return undefined;
    }
    return Array.from(this.decryptedAccounts.values()).find(
      (account) => account.address.toLowerCase() === address.toLowerCase()
    );
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<void> {
    // Remove from file
    removeAccountFromFile(id);

    // Remove from memory
    this.decryptedAccounts.delete(id);

    console.log(`Deleted account: ${id}`);
  }

  /**
   * Rename an account
   */
  async renameAccount(id: string, newName: string): Promise<void> {
    if (!this.isUnlocked) {
      throw new Error("Accounts are locked");
    }

    const account = this.decryptedAccounts.get(id);
    if (!account) {
      throw new Error("Account not found");
    }

    // Update in memory
    account.name = newName;
    account.updatedAt = Date.now();

    // Get master password and re-encrypt (only for accounts with private keys)
    let encryptedPrivateKey: string | undefined;
    if (account.source !== AccountSource.FRAME && account.privateKey) {
      const masterPassword = await getMasterPassword();
      if (!masterPassword) {
        throw new Error("Master password not found");
      }

      encryptedPrivateKey = await encryptPrivateKey(
        account.privateKey,
        masterPassword
      );
    }

    // Update in file
    const encryptedAccount: EncryptedAccount = {
      id: account.id,
      name: account.name,
      address: account.address,
      source: account.source,
      encryptedPrivateKey,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    updateAccountInFile(encryptedAccount);

    console.log(`Renamed account ${id} to: ${newName}`);
  }
}

// Export singleton instance
export const accountManager = new AccountManager();
