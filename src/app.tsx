import { useKeyboard, useRenderer } from "@opentui/solid";
import { useTheme } from "./theme";

export function App() {
  const renderer = useRenderer();
  const theme = useTheme();

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
        <box flexGrow={3} padding={1}>
          <text>main</text>
        </box>
        <box
          flexGrow={1}
          padding={1}
          border={["left"]}
          borderColor={theme.base100}
        >
          <text>right sidebar</text>
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
