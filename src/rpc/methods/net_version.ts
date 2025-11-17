import { type } from "arktype";
import { defineHandler } from "../handler";

export default defineHandler({
  method: "net_version",
  paramsValidator: type([]),
  responseValidator: type.number,
  handler: () => 1,
});
