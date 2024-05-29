import { assert } from "../assert";

/**
 * Formats a phone number to global format.
 * @param phoneNumber - A phone number in the format of "010-1234-5678".
 * @returns A phone number in the format of "+821012345678".
 */
export function krHyphenToGlobal(phoneNumber: string) {
  const chunks = phoneNumber.split("-");

  assert(chunks.length === 3, "phoneNumber must have 3 chunks");
  assert(chunks[0] === "010", "phoneNumber must start with 010");
  assert(
    chunks[1]?.length === 4 && chunks[2]?.length === 4,
    "phoneNumber must be 11 digits long",
  );

  return `+8210${chunks[1]}${chunks[2]}`;
}
