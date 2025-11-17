import { type } from "arktype";
import { RpcSchema } from "ox";

const schema = RpcSchema.from<RpcSchema.Default>();

export type NeoWalletRpcSchema = typeof schema;

export const JsonRpcRequest = type({
  id: "number",
  jsonrpc: "'2.0'",
  method: "string",
  params: "unknown[]",
});
