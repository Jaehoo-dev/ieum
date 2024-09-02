import {
  독서량_라벨,
  신분_라벨,
  쌍꺼풀_라벨,
  연간_벌이_라벨,
  연락_빈도_라벨,
  연락_수단_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  체형_라벨,
  학력_라벨,
} from "@ieum/constants";
import type { BasicMemberV2 } from "@ieum/prisma";
import { getBmiLabel } from "@ieum/utils";

interface Props {
  member: BasicMemberV2;
}

export function DetailedSelfFields({ member }: Props) {
  return (
    <div className="flex w-1/2 flex-col gap-0.5">
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
      {member.eyelid != null ? (
        <div>
          쌍꺼풀: <span>{쌍꺼풀_라벨[member.eyelid]}</span>
          <span>{member.customEyelid}</span>
        </div>
      ) : null}
      <div>자신 있는 부위: {member.confidentFacialBodyPart}</div>
      <div>학력: {학력_라벨[member.educationLevel]}</div>
      <div>졸업한 대학: {member.graduatedUniversity}</div>
      {member.occupationStatus != null ? (
        <div>신분: {신분_라벨[member.occupationStatus]}</div>
      ) : null}
      <div>직장: {member.workplace}</div>
      <div>직무: {member.job}</div>
      {member.currentSchool != null ? (
        <div>현재 학교: {member.currentSchool}</div>
      ) : null}
      <div>MBTI: {member.mbti}</div>
      <div>흡연 여부: {member.isSmoker ? "예" : "아니요"}</div>
      <div>음주 여부: {member.isDrinker ? "예" : "아니요"}</div>
      <div>음주 정도: {member.alcoholConsumption}</div>
      <div>주량: {member.alcoholTolerance}</div>
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
      <div>자산 관리 방법: {member.assetManagementApproach}</div>
      <div>취미/관심사: {member.hobby}</div>
      <div>책 취향: {member.bookTaste}</div>
      <div>여가 활동: {member.leisureActivity}</div>
      <div>형제 관계: {member.siblings}</div>
      <div>특징: {member.characteristics}</div>
      <div>10년 뒤 모습: {member.tenYearFuture}</div>
      <div>인생관: {member.lifePhilosophy}</div>
      <div>직업관: {member.workPhilosophy}</div>
      <div>문신 유무: {member.hasTattoo ? "예" : "아니요"}</div>
      <div>
        운동: {주간_운동량_라벨[member.exercisePerWeek]} {member.exerciseType}
      </div>
      <div>자차 유무: {member.hasCar ? "예" : "아니요"}</div>
      <div>
        게임: {member.doesGame ? "예" : "아니요"} {member.gameType}
      </div>
      <div>반려동물 유무: {member.hasPet ? "예" : "아니요"}</div>
      <div>데이트: {member.datingStyle}</div>
      <div>연락: {member.contactStyle}</div>
      <div>결혼관: {member.marriagePlan}</div>
      <div>자기소개: {member.selfIntroduction}</div>
    </div>
  );
}
