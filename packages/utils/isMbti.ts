import { MBTI } from "@ieum/prisma";

export function isMbti(value: string): value is MBTI {
  return Object.values(MBTI).includes(value as MBTI);
}
