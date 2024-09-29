import {
  신분_라벨,
  연간_벌이_라벨,
  자산_라벨,
  종교_라벨,
  체형_라벨,
  학력_라벨,
} from "@ieum/constants";
import type { BasicMemberV2 } from "@ieum/prisma";
import { getBmiLabel } from "@ieum/utils";

interface Props {
  member: BasicMemberV2;
}

export function SimpleSelfFields({ member }: Props) {
  return (
    <div className="flex w-1/2 flex-col gap-0.5">
      <div>{member.birthYear}년생</div>
      <div>{member.residence}</div>
      <div>{member.height}cm</div>
      <div>{member.weight}kg</div>
      <div>
        BMI:{" "}
        {member.bmi != null
          ? `${member.bmi.toFixed(2)} (${getBmiLabel(member.bmi)})`
          : null}
      </div>
      <div>학력: {학력_라벨[member.educationLevel]}</div>
      <div>학교: {member.graduatedUniversity}</div>
      {member.occupationStatus != null ? (
        <div>신분: {신분_라벨[member.occupationStatus]}</div>
      ) : null}
      <div>직장: {member.workplace}</div>
      <div>직무: {member.job}</div>
      {member.currentSchool != null ? (
        <div>현재 학교: {member.currentSchool}</div>
      ) : null}
      <div>MBTI: {member.mbti}</div>
      <div>흡연: {member.isSmoker ? "예" : "아니요"}</div>
      <div>종교: {종교_라벨[member.religion]}</div>
      <div>
        연봉:{" "}
        {member.annualIncome != null
          ? 연간_벌이_라벨[member.annualIncome]
          : null}
      </div>
      <div>
        자산:{" "}
        {member.assetsValue != null ? 자산_라벨[member.assetsValue] : null}
      </div>
      <div>문신: {member.hasTattoo ? "예" : "아니요"}</div>
    </div>
  );
}
