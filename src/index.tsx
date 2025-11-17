import { render } from "@opentui/solid";
import { App } from "./app";
import { ConsolePosition } from "@opentui/core";
import { ThemeContextProvider } from "./theme";
import { AccountsProvider } from "./accounts/context";

render(
  () => (
    <ThemeContextProvider>
      <AccountsProvider>
        <App />
      </AccountsProvider>
    </ThemeContextProvider>
  ),
  {
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      sizePercent: 40,
      maxStoredLogs: 1000,
    },
  },
);
