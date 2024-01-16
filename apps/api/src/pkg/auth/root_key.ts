import { Context } from "hono";
import { UnkeyApiError } from "../errors";
import { keyService } from "../global";

/**
 * rootKeyAuth takes the bearer token from the request and verifies the key
 *
 * if the key doesnt exist, isn't valid or isn't a root key, an error is thrown, which gets handled
 * automatically by hono
 */
export async function rootKeyAuth(c: Context) {
  const authorization = c.req.header("authorization")?.replace("Bearer ", "");
  if (!authorization) {
    throw new UnkeyApiError({ code: "UNAUTHORIZED", message: "key required" });
  }
  const rootKey = await keyService.verifyKey(c, { key: authorization });
  if (rootKey.error) {
    throw new UnkeyApiError({ code: "INTERNAL_SERVER_ERROR", message: rootKey.error.message });
  }
  if (!rootKey.value.valid) {
    throw new UnkeyApiError({ code: "UNAUTHORIZED", message: "the root key is not valid" });
  }
  if (!rootKey.value.isRootKey) {
    throw new UnkeyApiError({ code: "UNAUTHORIZED", message: "root key required" });
  }

  return rootKey.value;
}