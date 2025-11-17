import { handleRequest } from "./handler";
import { type } from "arktype";

export async function startServer() {
  const server = Bun.serve({
    port: 1248,
    websocket: {
      async message(ws, message) {
        if (typeof message !== "string") {
          ws.send("Invalid message format");
          return;
        }

        const jsonBody = JSON.parse(message);

        const response = await handleRequest(jsonBody);

        if (response instanceof type.errors) {
          ws.send(`Invalid request: ${response.summary}`);
          return;
        }

        ws.send(JSON.stringify(response));
      },
    },
    async fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }

      const jsonBody = await req.json();

      const response = await handleRequest(jsonBody);

      if (response instanceof type.errors) {
        return new Response(`Invalid request: ${response.summary}`, {
          status: 400,
        });
      }

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  console.log(`Server started on http://${server.hostname}:${server.port}`);
}
