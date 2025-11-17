/**
 * Accounts List Component
 * Displays accounts in the right sidebar with keyboard navigation
 */

import { For, Show, createSignal, createEffect, createMemo } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { useTheme } from "../theme";
import { useAccounts } from "../accounts/context";

export function AccountsList() {
  const theme = useTheme();
  const { accounts, selectedAccount, selectAccount, isUnlocked } = useAccounts();

  const [focusedIndex, setFocusedIndex] = createSignal(0);

  // Handle keyboard input using OpenTUI's useKeyboard hook
  useKeyboard((key) => {
    if (!isUnlocked() || accounts().length === 0) return;

    // Navigate with j/k (vim style) or arrow keys
    if (key.name === 'j' || key.name === 'down') {
      setFocusedIndex((prev) => Math.min(prev + 1, accounts().length - 1));
    } else if (key.name === 'k' || key.name === 'up') {
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (key.name === 'return' || key.name === 'enter') {
      // Select the focused account
      const account = accounts()[focusedIndex()];
      if (account) {
        selectAccount(account.id);
      }
    }
  });

  // Update focused index when selected account changes
  createEffect(() => {
    const selected = selectedAccount();
    if (selected) {
      const index = accounts().findIndex(acc => acc.id === selected.id);
      if (index !== -1) {
        setFocusedIndex(index);
      }
    }
  });

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get source badge text
  const getSourceBadge = (source: string) => {
    switch (source) {
      case "imported":
        return "↓";
      case "generated":
        return "★";
      case "frame":
        return "F";
      default:
        return "";
    }
  };

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      gap={1}
      alignItems="stretch"
    >
      {/* Header */}
      <box flexDirection="row" justifyContent="space-between" alignItems="center">
        <text fg={theme.baseContent}>
          Accounts
        </text>
        <text fg={theme.base100}>
          {accounts().length}
        </text>
      </box>

      <Show
        when={isUnlocked()}
        fallback={
          <box flexGrow={1} justifyContent="center" alignItems="center">
            <text fg={theme.base100}>Locked</text>
          </box>
        }
      >
        <Show
          when={accounts().length > 0}
          fallback={
            <box flexGrow={1} justifyContent="center" alignItems="center">
              <text fg={theme.base100}>No accounts</text>
            </box>
          }
        >
          {/* Accounts list - using manual rendering for reactivity */}
          <box flexDirection="column" gap={1} alignItems="stretch">
            {createMemo(() => {
              const currentFocus = focusedIndex();
              const currentSelected = selectedAccount();

              return accounts().map((account, i) => {
                const isSelected = currentSelected?.id === account.id;
                const isFocused = currentFocus === i;

                return (
                  <box
                    flexDirection="column"
                    padding={1}
                    backgroundColor={isSelected ? theme.base300 : isFocused ? theme.base200 : "transparent"}
                  >
                    {/* Account name and source badge */}
                    <box flexDirection="row" justifyContent="space-between" alignItems="center">
                      <text
                        fg={isSelected ? theme.primary : isFocused ? theme.baseContent : theme.baseContent}
                      >
                        {isFocused ? '> ' : '  '}{account.name}
                      </text>
                      <text fg={theme.base100}>
                        {getSourceBadge(account.source)}
                      </text>
                    </box>

                    {/* Address */}
                    <text fg={theme.base100}>
                      {'  '}{truncateAddress(account.address)}
                    </text>
                  </box>
                );
              });
            })}
          </box>
        </Show>
      </Show>
    </box>
  );
}
