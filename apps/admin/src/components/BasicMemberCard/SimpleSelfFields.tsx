import {
  신분_라벨,
  연간_벌이_라벨,
  자산_라벨,
  종교_라벨,
  체형_라벨,
  학력_라벨,
} from "@ieum/labels";
import type { BasicMember } from "@ieum/prisma";
import { getBmiLabel } from "@ieum/utils";

interface Props {
  member: BasicMember;
}

export function SimpleSelfFields({ member }: Props) {
  return (
    <div className="flex w-1/2 flex-col gap-1">
      <div>출생연도: {member.birthYear}</div>
      <div>거주지: {member.residence}</div>
      <div>키: {member.height}cm</div>
      <div>몸무게: {member.weight}kg</div>
      <div>
        BMI:{" "}
        {member.bmi != null
          ? `${member.bmi.toFixed(2)} (${getBmiLabel(member.bmi)})`
          : null}
      </div>
      <div>체형: {체형_라벨[member.bodyShape]}</div>
      <div>학력: {학력_라벨[member.educationLevel]}</div>
      <div>졸업한 대학: {member.graduatedUniversity}</div>
      <div>신분: {신분_라벨[member.occupationStatus]}</div>
      <div>직장: {member.workplace}</div>
      <div>직무: {member.job}</div>
      {member.currentSchool != null ? (
        <div>현재 학교: {member.currentSchool}</div>
      ) : null}
      <div>MBTI: {member.mbti}</div>
      <div>흡연 여부: {member.isSmoker ? "예" : "아니요"}</div>
      <div>종교: {종교_라벨[member.religion]}</div>
      <div>
        연봉 구간:{" "}
        {member.annualIncome != null
          ? 연간_벌이_라벨[member.annualIncome]
          : null}
      </div>
      <div>
        자산 구간:{" "}
        {member.assetsValue != null ? 자산_라벨[member.assetsValue] : null}
      </div>
      <div>문신 유무: {member.hasTattoo ? "예" : "아니요"}</div>
      <div>자기소개: {member.selfIntroduction}</div>
    </div>
  );
}
