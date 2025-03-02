import { ActionContext } from "deco/types.ts";
import { allowCorsFor } from "deco/utils/http.ts";
import { encryptToHex } from "../../utils/crypto.ts";

export interface Props {
  value: string;
}

export interface SignedMessage {
  value: string;
}

export default async function encrypt(
  { value }: Props,
  req: Request,
  ctx: ActionContext,
): Promise<SignedMessage> {
  try {
    Object.entries(allowCorsFor(req)).map(([name, value]) => {
      ctx.response.headers.set(name, value);
    });
    return { value: await encryptToHex(value) };
  } catch (err) {
    console.log(err);
    throw err;
  }
}
