import { type } from "arktype";
import { Address } from "../types";
import { defineHandler } from "../handler";

export default defineHandler({
  method: "eth_requestAccounts",
  paramsValidator: type.undefined,
  responseValidator: Address.array(),
  handler: async (params) => [],
});
