import { JsonRpcRequest, type NeoWalletRpcSchema } from "./schema";
import { Type, type } from "arktype";
import * as methods from "./methods";
import { RpcRequest, RpcResponse } from "ox";

export async function handleRequest(body: unknown) {
  const validatedBase = JsonRpcRequest(body);

  if (validatedBase instanceof type.errors) {
    return validatedBase;
  }

  const rpcRequest = RpcRequest.from(validatedBase);

  const maybeMethod = methods[rpcRequest.method as keyof typeof methods];

  if (!maybeMethod) {
    return RpcResponse.from(
      {
        error: new RpcResponse.MethodNotFoundError(),
      },
      {
        request: rpcRequest,
      },
    );
  }

  const { handler, paramsValidator, responseValidator } = maybeMethod;

  const validatedParams = paramsValidator(rpcRequest.params);

  if (validatedParams instanceof type.errors) {
    return RpcResponse.from(
      {
        error: new RpcResponse.InvalidParamsError({
          data: validatedParams.summary,
        }),
      },
      {
        request: rpcRequest,
      },
    );
  }

  const result = await handler(validatedParams);

  const validatedResult = responseValidator(result);

  if (validatedResult instanceof type.errors) {
    console.error(
      `Invalid response for ${rpcRequest}: ${validatedResult.summary}`,
    );
    return RpcResponse.from(
      {
        error: new RpcResponse.InternalError(),
      },
      {
        request: rpcRequest,
      },
    );
  }

  const rpcResponse = RpcResponse.from(
    { result: validatedResult },
    { request: rpcRequest },
  );

  return rpcResponse;
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
