import { useKeyboard, useRenderer } from "@opentui/solid";
import { useTheme } from "./theme";
import { AccountsList } from "./components/AccountsList";
import { useAccounts } from "./accounts/context";

export function App() {
  const renderer = useRenderer();
  const theme = useTheme();
  const { selectedAccount } = useAccounts();

  useKeyboard((key) => {
    switch (key.name) {
      case "`": {
        renderer.console.toggle();
      }
    }
  });

  return (
    <box
      width="100%"
      height="100%"
      alignItems="stretch"
      justifyContent="center"
      flexDirection="column"
      backgroundColor={theme.base200}
    >
      <box flexGrow={1} alignItems="stretch" flexDirection="row">
        <box
          flexGrow={1}
          padding={1}
          border={["right"]}
          borderColor={theme.base100}
        >
          <text>left sidebar</text>
        </box>
        <box flexGrow={3} padding={1} flexDirection="column">
          <text fg={theme.baseContent}>
            Selected Account
          </text>
          {selectedAccount() ? (
            <box flexDirection="column" gap={1} marginTop={1}>
              <text>Name: {selectedAccount()!.name}</text>
              <text>Address: {selectedAccount()!.address}</text>
              <text>Source: {selectedAccount()!.source}</text>
            </box>
          ) : (
            <text fg={theme.base100}>No account selected</text>
          )}
        </box>
        <box
          flexGrow={1}
          padding={1}
          border={["left"]}
          borderColor={theme.base100}
          flexDirection="column"
        >
          <AccountsList />
        </box>
      </box>
      <box backgroundColor={theme.base300} gap={1} flexDirection="row">
        <text bg={theme.baseContent} fg={theme.base200}>
          neowallet v0.0.1
        </text>
        <box flexGrow={1}></box>
        <text fg={theme.success}>●</text>
        <text fg={theme.baseContent}>localhost:1248</text>
      </box>
    </box>
  );
}
