import { JsonRpcRequest, type NeoWalletRpcSchema } from "./schema";
import { Type, type } from "arktype";
import * as methods from "./methods";

export async function handleRequest(body: unknown) {
  const parsedBase = JsonRpcRequest(body);

  if (parsedBase instanceof type.errors) {
    throw parsedBase;
  }

  const maybeMethod = methods[parsedBase.method as keyof typeof methods];

  if (!maybeMethod) {
    throw new Error(`Method not found: ${parsedBase.method}`);
  }

  const { handler, paramsValidator, responseValidator } = maybeMethod;

  const validatedParams = paramsValidator(parsedBase.params);

  if (validatedParams instanceof type.errors) {
    throw validatedParams;
  }

  const result = await handler(validatedParams);

  const validatedResponse = responseValidator(result);

  if (validatedResponse instanceof type.errors) {
    throw validatedResponse;
  }

  return validatedResponse;
}

export function defineHandler<
  MethodName extends NeoWalletRpcSchema["Request"]["method"],
  ParamsValidator extends Type<
    Extract<NeoWalletRpcSchema["Request"], { method: MethodName }>["params"]
  >,
  ResponseValidator extends Type<
    Extract<
      NeoWalletRpcSchema,
      { Request: { method: MethodName } }
    >["ReturnType"]
  >,
  Handler extends (
    params: ParamsValidator["infer"],
  ) => ResponseValidator["infer"] | Promise<ResponseValidator["infer"]>,
>(params: {
  method: MethodName;
  paramsValidator: ParamsValidator;
  responseValidator: ResponseValidator;
  handler: Handler;
}): {
  handler: Handler;
  method: string;
  paramsValidator: ParamsValidator;
  responseValidator: ResponseValidator;
} {
  return params;
}
