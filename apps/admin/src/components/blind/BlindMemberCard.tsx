import { useState } from "react";
import Link from "next/link";
import { 종교_라벨, 지역_라벨, 체형_라벨 } from "@ieum/constants";
import type { BlindMember, Region } from "@ieum/prisma";
import { Gender } from "@ieum/prisma";

import { copyBlindMemberProfile } from "~/domains/blind/copyBlindMemberProfile";

interface Props {
  member: BlindMember;
}

export function BlindMemberCard({ member }: Props) {
  const [folded, setFolded] = useState(false);

  return (
    <div className="w-full max-w-xl rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`${
              member.gender === Gender.MALE ? "text-blue-500" : "text-pink-500"
            } text-lg font-semibold`}
          >
            {member.nickname}
          </span>
          <span>|</span>
          <button
            onClick={async () => {
              await copyBlindMemberProfile(member);
              alert(`${member.nickname}님의 프로필을 복사했어요.`);
            }}
          >
            프로필 복사
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/blind/members/${member.id}/matchmaker`}
            className="text-blue-600 hover:underline"
          >
            매치
          </Link>
          <span>|</span>
          <button
            onClick={() => {
              setFolded(!folded);
            }}
          >
            {folded ? "펼치기" : "접기"}
          </button>
        </div>
      </div>
      {folded ? null : (
        <div className="mt-2 flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <div>출생연도: {member.birthYear}</div>
            <div>거주지: {member.residence}</div>
            <div>키: {member.height}cm</div>
            <div>체형: {체형_라벨[member.bodyShape]}</div>
            <div>MBTI: {member.mbti}</div>
            <div>직장: {member.workplace}</div>
            <div>직무: {member.job}</div>
            <div>흡연 여부: {member.isSmoker ? "예" : "아니요"}</div>
            <div>종교: {종교_라벨[member.religion]}</div>
          </div>
          <div className="min-h-fit border-l border-gray-200" />
          <div className="flex flex-1 flex-col gap-1">
            <div
              className={
                member.nonNegotiableConditions.includes("AGE")
                  ? "text-red-500"
                  : undefined
              }
            >
              나이: {member.idealMinAgeBirthYear} ~{" "}
              {member.idealMaxAgeBirthYear}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes("REGION")
                  ? "text-red-500"
                  : undefined
              }
            >
              지역:{" "}
              {member.idealRegions
                .map((region) => {
                  return 지역_라벨[region as Region];
                })
                .join(", ")}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes("HEIGHT")
                  ? "text-red-500"
                  : undefined
              }
            >
              키: {member.idealMinHeight} ~ {member.idealMaxHeight}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes("PREFERRED_BODY_SHAPES")
                  ? "text-red-500"
                  : undefined
              }
            >
              체형:{" "}
              {member.idealBodyShapes
                .map((bodyShape) => {
                  return 체형_라벨[bodyShape];
                })
                .join(", ")}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes("PREFERRED_MBTIS")
                  ? "text-red-500"
                  : undefined
              }
            >
              선호 MBTI:{" "}
              {member.idealPreferredMbtis
                .map((mbti) => {
                  return mbti;
                })
                .join(", ")}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes("NON_PREFERRED_MBTIS")
                  ? "text-red-500"
                  : undefined
              }
            >
              기피 MBTI:{" "}
              {member.idealNonPreferredMbtis
                .map((mbti) => {
                  return mbti;
                })
                .join(", ")}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes("IS_SMOKER_OK")
                  ? "text-red-500"
                  : undefined
              }
            >
              흡연 괜찮음: {member.idealIsSmokerOk ? "예" : "아니요"}
            </div>
            <div
              className={
                member.nonNegotiableConditions.includes(
                  "NON_PREFERRED_RELIGIONS",
                )
                  ? "text-red-500"
                  : undefined
              }
            >
              기피 종교:{" "}
              {member.idealNonPreferredReligions
                .map((religion) => {
                  return 종교_라벨[religion];
                })
                .join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
