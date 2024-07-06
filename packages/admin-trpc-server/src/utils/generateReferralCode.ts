import { customAlphabet } from "nanoid";

export const generateReferralCode = customAlphabet(
  "abcdefghjkmnpqrstuvwxyz2345679",
  5,
);
