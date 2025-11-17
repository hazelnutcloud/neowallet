import { handleRequest } from "./handler";
import { type } from "arktype";

export function startServer() {
  const server = Bun.serve({
    port: 1248,
    websocket: {
      async message(ws, message) {
        console.log("Received request:", message);

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

      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
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
