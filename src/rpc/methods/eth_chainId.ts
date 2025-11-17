import { type } from "arktype";
import { defineHandler } from "../handler";
import { Hex } from "../types";

export default defineHandler({
  method: "eth_chainId",
  paramsValidator: type([]),
  responseValidator: Hex,
  handler: () => {
    return "0x1" as const;
  },
});
