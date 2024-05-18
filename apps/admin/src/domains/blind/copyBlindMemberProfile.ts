import { 종교_라벨, 체형_라벨 } from "@ieum/labels";
import type { BlindMember } from "@ieum/prisma";

export function copyBlindMemberProfile(member: BlindMember) {
  return navigator.clipboard.writeText(
    `닉네임: ${member.nickname}
나이: ${member.birthYear}년생
거주지: ${member.residence}
키: ${member.height}cm
체형: ${
      체형_라벨[member.bodyShape]
    } (해당 회원님이 고르신 체형으로, 각자의 기준에 따라 편차가 있을 수 있습니다.)
MBTI: ${member.mbti}
직무: ${member.job}
흡연 여부: ${member.isSmoker ? "예" : "아니요"}
종교: ${종교_라벨[member.religion]}`,
  );
}
