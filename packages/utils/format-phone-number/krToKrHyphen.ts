import { assert } from "../assert";

export function krToKrHyphen(phoneNumber: string) {
  console.log(phoneNumber);

  assert(phoneNumber.startsWith("010"), "phoneNumber must start with 010");
  assert(phoneNumber.length === 11, "phoneNumber must be 11 digits long");

  return `010-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
}
