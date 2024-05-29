// +821012345678 -> 01012345678

import { assert } from "../assert";

/**
 * Formats a phone number to basic Korean format.
 * @param phoneNumber - A phone number in the format of "+821012345678" or "+8201012345678".
 * @returns A phone number in the format of "01012345678".
 */
export function globalKrToBasicKr(phoneNumber: string) {
  assert(phoneNumber.startsWith("+82"), "phoneNumber must start with +82");

  if (phoneNumber.startsWith("+8210")) {
    return `0${phoneNumber.slice(3)}`;
  }

  if (phoneNumber.startsWith("+82010")) {
    return phoneNumber.slice(3);
  }

  throw new Error("phoneNumber format is not valid");
}
