/**
 * Test script for accounts module
 * Run with: bun run test-accounts.ts
 */

import { accountManager } from "./src/accounts";

async function testAccounts() {
  console.log("=== Testing Accounts Module ===\n");

  try {
    // Step 1: Initialize (creates master password on first run)
    console.log("1. Initializing account manager...");
    await accountManager.initialize();
    console.log("✓ Initialized\n");

    // Step 2: Unlock accounts (will trigger OS auth prompt)
    console.log("2. Unlocking accounts (you may see OS auth prompt)...");
    await accountManager.unlock();
    console.log("✓ Unlocked\n");

    // Step 3: Check current accounts
    console.log("3. Current accounts:");
    let accounts = accountManager.getAccounts();
    console.log(`   Found ${accounts.length} accounts`);
    accounts.forEach((acc) => {
      console.log(`   - ${acc.name}: ${acc.address}`);
    });
    console.log();

    // Step 4: Generate a new account
    console.log("4. Generating new account...");
    const generatedAccount = await accountManager.generateAccount("Test Generated");
    console.log(`✓ Generated: ${generatedAccount.address}`);
    if (generatedAccount.privateKey) {
      console.log(`   Private key (first 10 chars): ${generatedAccount.privateKey.substring(0, 10)}...`);
    }
    console.log();

    // Step 5: Import an account
    console.log("5. Importing account from private key...");
    const testPrivateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const importedAccount = await accountManager.importAccount(
      testPrivateKey as `0x${string}`,
      "Test Imported"
    );
    console.log(`✓ Imported: ${importedAccount.address}`);
    console.log();

    // Step 6: List all accounts
    console.log("6. All accounts after creation:");
    accounts = accountManager.getAccounts();
    accounts.forEach((acc, idx) => {
      console.log(`   ${idx + 1}. ${acc.name}`);
      console.log(`      Address: ${acc.address}`);
      console.log(`      ID: ${acc.id}`);
      console.log(`      Created: ${new Date(acc.createdAt).toISOString()}`);
    });
    console.log();

    // Step 7: Get account by address
    console.log("7. Getting account by address...");
    const foundAccount = accountManager.getAccountByAddress(generatedAccount.address);
    if (foundAccount) {
      console.log(`✓ Found account: ${foundAccount.name}`);
    }
    console.log();

    // Step 8: Rename account
    console.log("8. Renaming account...");
    await accountManager.renameAccount(generatedAccount.id, "Renamed Account");
    const renamedAccount = accountManager.getAccount(generatedAccount.id);
    console.log(`✓ Renamed to: ${renamedAccount?.name}`);
    console.log();

    // Step 9: Lock accounts
    console.log("9. Locking accounts...");
    accountManager.lock();
    console.log("✓ Locked");
    console.log(`   Accounts accessible: ${accountManager.getAccounts().length}`);
    console.log();

    // Step 10: Unlock again (will trigger OS auth again)
    console.log("10. Unlocking again...");
    await accountManager.unlock();
    console.log("✓ Unlocked");
    console.log(`    Accounts accessible: ${accountManager.getAccounts().length}`);
    console.log();

    // Step 11: Delete an account
    console.log("11. Deleting imported account...");
    await accountManager.deleteAccount(importedAccount.id);
    console.log("✓ Deleted");
    console.log(`    Remaining accounts: ${accountManager.getAccounts().length}`);
    console.log();

    console.log("=== All Tests Passed! ===");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

testAccounts();
