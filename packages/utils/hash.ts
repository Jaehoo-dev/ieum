import { createHmac } from "crypto";

export function hash(value: string, secretKey: string) {
  return createHmac("sha256", secretKey).update(value).digest("hex");
}
