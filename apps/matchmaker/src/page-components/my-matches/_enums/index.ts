import { 매치_유형, 확성기_매치_참가자_유형 } from "@ieum/constants";

export const 조회용_매치_유형 = {
  BASIC: 매치_유형.기본,
  MEGAPHONE_RECEIVER: 확성기_매치_참가자_유형.RECEIVER,
  MEGAPHONE_SENDER: 확성기_매치_참가자_유형.SENDER,
} as const;

export type 조회용_매치_유형 =
  (typeof 조회용_매치_유형)[keyof typeof 조회용_매치_유형];
