import { assert } from "../assert";

/**
 * Converts a phone number to global format.
 * @param phoneNumber - A phone number in the format of "01012345678".
 * @returns A phone number in the format of "+821012345678".
 */
export function krToGlobal(phoneNumber: string) {
  assert(phoneNumber.startsWith("010"), "phoneNumber must start with 010");
  assert(phoneNumber.length === 11, "phoneNumber must be 11 digits long");

  return `+82${phoneNumber.slice(1)}`;
}
