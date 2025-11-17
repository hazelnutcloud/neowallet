export async function startServer() {
  const server = Bun.serve({
    port: 1248,
    websocket: {
      message(ws, message) {

      },
    },
    fetch(req) {},
  });
}
