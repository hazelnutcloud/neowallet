import { type } from "arktype";
import { defineHandler } from "../handler";
import { Hex } from "../types";

export default defineHandler({
  method: "eth_subscribe",
  paramsValidator: type([type.string]),
  responseValidator: Hex,
  handler: () => "0xdeadbeef" as const,
});
