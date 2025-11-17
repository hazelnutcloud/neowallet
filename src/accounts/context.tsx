/**
 * Accounts context for SolidJS
 * Provides reactive state management for accounts
 */

import { createContext, useContext, createSignal, createEffect, onMount, type ParentProps } from "solid-js";
import type { DecryptedAccount } from "./types";
import { accountManager } from "./manager";

interface AccountsContextValue {
  accounts: () => DecryptedAccount[];
  selectedAccount: () => DecryptedAccount | undefined;
  isUnlocked: () => boolean;
  selectAccount: (id: string) => void;
  refresh: () => Promise<void>;
  unlock: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextValue>();

export function AccountsProvider(props: ParentProps) {
  const [accounts, setAccounts] = createSignal<DecryptedAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = createSignal<string | undefined>();
  const [isUnlocked, setIsUnlocked] = createSignal(false);

  // Initialize account manager
  onMount(async () => {
    await accountManager.initialize();
    // Try to unlock (will prompt for OS auth)
    try {
      await accountManager.unlock();
      setIsUnlocked(true);
      setAccounts(accountManager.getAccounts());

      // Select first account by default
      const accts = accountManager.getAccounts();
      if (accts.length > 0 && accts[0]) {
        setSelectedAccountId(accts[0].id);
      }
    } catch (error) {
      console.error("Failed to unlock accounts:", error);
    }
  });

  const refresh = async () => {
    if (accountManager.getIsUnlocked()) {
      setAccounts(accountManager.getAccounts());
    }
  };

  const unlock = async () => {
    await accountManager.unlock();
    setIsUnlocked(true);
    await refresh();
  };

  const selectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  const selectedAccount = () => {
    const id = selectedAccountId();
    if (!id) return undefined;
    return accounts().find((acc) => acc.id === id);
  };

  const value: AccountsContextValue = {
    accounts,
    selectedAccount,
    isUnlocked,
    selectAccount,
    refresh,
    unlock,
  };

  return (
    <AccountsContext.Provider value={value}>
      {props.children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountsProvider");
  }
  return context;
}
