import { type } from "arktype";

export const Address = type("/^0x[a-fA-F0-9]{40}$/");
export const Hex = type("/^0x[a-fA-F0-9]+$/");
