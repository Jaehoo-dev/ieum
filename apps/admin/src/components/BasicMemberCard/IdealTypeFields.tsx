import type { ReactNode } from "react";
import {
  독서량_라벨,
  신분_라벨,
  쌍꺼풀_라벨,
  연간_벌이_라벨,
  음주량_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  지역_라벨,
  체형_라벨,
  학력_라벨,
} from "@ieum/labels";
import type { BasicMember } from "@ieum/prisma";

interface Props {
  member: BasicMember;
}

export function IdealTypeFields({ member }: Props) {
  const {
    idealMinAgeBirthYear,
    idealMaxAgeBirthYear,
    idealRegions,
    idealCustomRegion,
    idealMinHeight,
    idealMaxHeight,
    idealBodyShapes,
    idealEyelids,
    idealFacialBodyPart,
    idealEducationLevel,
    idealSchoolLevel,
    idealOccupationStatuses,
    idealNonPreferredWorkplace,
    idealNonPreferredJob,
    idealPreferredMbtis,
    idealNonPreferredMbtis,
    idealIsSmokerOk,
    idealDrinkingFrequency,
    idealPreferredReligions,
    idealNonPreferredReligions,
    idealMinAnnualIncome,
    idealMinAssetsValue,
    idealHobby,
    idealBooksReadPerYear,
    idealCharacteristics,
    idealLifePhilosophy,
    idealIsTattooOk,
    idealExercisePerWeek,
    idealShouldHaveCar,
    idealIsGamingOk,
    idealIsPetOk,
    nonNegotiableConditions,
    idealTypeDescription,
  } = member;

  return (
    <div className="flex w-1/2 flex-col gap-1">
      {idealMinAgeBirthYear != null || idealMaxAgeBirthYear != null ? (
        <Field
          label="나이"
          nonNegotiable={nonNegotiableConditions.includes("AGE")}
        >
          {idealMinAgeBirthYear} ~ {idealMaxAgeBirthYear}
        </Field>
      ) : null}
      {idealRegions.length > 0 || idealCustomRegion != null ? (
        <Field
          label="지역"
          nonNegotiable={nonNegotiableConditions.includes("REGION")}
        >
          {`${idealRegions
            .map((region) => {
              return 지역_라벨[region];
            })
            .join(", ")}${
            idealCustomRegion != null ? `, ${idealCustomRegion}` : ""
          }`}
        </Field>
      ) : null}
      {idealMinHeight != null || idealMaxHeight != null ? (
        <Field
          label="키"
          nonNegotiable={nonNegotiableConditions.includes("HEIGHT")}
        >
          {idealMinHeight} ~ {idealMaxHeight}
        </Field>
      ) : null}
      {idealBodyShapes.length > 0 ? (
        <Field
          label="체형"
          nonNegotiable={nonNegotiableConditions.includes("BODY_SHAPES")}
        >
          {idealBodyShapes
            .map((bodyShape) => {
              return 체형_라벨[bodyShape];
            })
            .join(", ")}
        </Field>
      ) : null}
      {idealEyelids.length > 0 ? (
        <Field
          label="쌍꺼풀"
          nonNegotiable={nonNegotiableConditions.includes("EYELID")}
        >
          {idealEyelids
            .map((eyelid) => {
              return 쌍꺼풀_라벨[eyelid];
            })
            .join(", ")}
        </Field>
      ) : null}
      {idealFacialBodyPart != null ? (
        <Field
          label="얼굴/신체 특징"
          nonNegotiable={nonNegotiableConditions.includes("FACIAL_BODY_PART")}
        >
          {idealFacialBodyPart}
        </Field>
      ) : null}
      {idealEducationLevel != null ? (
        <Field
          label="최소 학력"
          nonNegotiable={nonNegotiableConditions.includes("EDUCATION_LEVEL")}
        >
          {학력_라벨[idealEducationLevel]}
        </Field>
      ) : null}
      {idealSchoolLevel != null ? (
        <Field
          label="최소 학벌"
          nonNegotiable={nonNegotiableConditions.includes("SCHOOL_LEVEL")}
        >
          {idealSchoolLevel}
        </Field>
      ) : null}
      {idealOccupationStatuses.length > 0 ? (
        <Field
          label="신분"
          nonNegotiable={nonNegotiableConditions.includes("OCCUPATION_STATUS")}
        >
          {idealOccupationStatuses
            .map((status) => {
              return 신분_라벨[status];
            })
            .join(", ")}
        </Field>
      ) : null}
      {idealNonPreferredWorkplace != null ? (
        <Field label="기피 직장/학교" nonNegotiable={true}>
          {idealNonPreferredWorkplace}
        </Field>
      ) : null}
      {idealNonPreferredJob != null ? (
        <Field
          label="기피 직무"
          nonNegotiable={nonNegotiableConditions.includes("NON_PREFERRED_JOB")}
        >
          {idealNonPreferredJob}
        </Field>
      ) : null}
      {idealPreferredMbtis.length > 0 ? (
        <Field
          label="선호 MBTI"
          nonNegotiable={nonNegotiableConditions.includes("PREFERRED_MBTIS")}
        >
          {idealPreferredMbtis
            .map((mbti) => {
              return mbti;
            })
            .join(", ")}
        </Field>
      ) : null}
      {idealNonPreferredMbtis.length > 0 ? (
        <Field
          label="기피 MBTI"
          nonNegotiable={nonNegotiableConditions.includes(
            "NON_PREFERRED_MBTIS",
          )}
        >
          {idealNonPreferredMbtis
            .map((mbti) => {
              return mbti;
            })
            .join(", ")}
        </Field>
      ) : null}
      <Field
        label="흡연 허용"
        nonNegotiable={nonNegotiableConditions.includes("IS_SMOKER_OK")}
      >
        {idealIsSmokerOk ? "예" : "아니요"}
      </Field>
      {idealDrinkingFrequency != null ? (
        <Field
          label="음주 빈도"
          nonNegotiable={nonNegotiableConditions.includes("DRINKING_FREQUENCY")}
        >
          {음주량_라벨[idealDrinkingFrequency]}
        </Field>
      ) : null}
      {idealPreferredReligions.length > 0 ? (
        <Field
          label="선호 종교"
          nonNegotiable={nonNegotiableConditions.includes(
            "PREFERRED_RELIGIONS",
          )}
        >
          {idealPreferredReligions
            .map((religion) => {
              return 종교_라벨[religion];
            })
            .join(", ")}
        </Field>
      ) : null}
      {idealNonPreferredReligions.length > 0 ? (
        <Field
          label="기피 종교"
          nonNegotiable={nonNegotiableConditions.includes(
            "NON_PREFERRED_RELIGIONS",
          )}
        >
          {idealNonPreferredReligions
            .map((religion) => {
              return 종교_라벨[religion];
            })
            .join(", ")}
        </Field>
      ) : null}
      {idealMinAnnualIncome != null ? (
        <Field
          label="최소 연봉"
          nonNegotiable={nonNegotiableConditions.includes("MIN_ANNUAL_INCOME")}
        >
          {연간_벌이_라벨[idealMinAnnualIncome]}
        </Field>
      ) : null}
      {idealMinAssetsValue != null ? (
        <Field
          label="최소 자산"
          nonNegotiable={nonNegotiableConditions.includes("MIN_ASSETS_VALUE")}
        >
          {자산_라벨[idealMinAssetsValue]}
        </Field>
      ) : null}
      {idealHobby != null ? (
        <Field
          label="취미/관심사"
          nonNegotiable={nonNegotiableConditions.includes("HOBBY")}
        >
          {idealHobby}
        </Field>
      ) : null}
      {idealBooksReadPerYear != null ? (
        <Field
          label="독서량"
          nonNegotiable={nonNegotiableConditions.includes(
            "BOOKS_READ_PER_YEAR",
          )}
        >
          {독서량_라벨[idealBooksReadPerYear]}
        </Field>
      ) : null}
      {idealCharacteristics != null ? (
        <Field
          label="특징"
          nonNegotiable={nonNegotiableConditions.includes("CHARACTERISTICS")}
        >
          {idealCharacteristics}
        </Field>
      ) : null}
      {idealLifePhilosophy != null ? (
        <Field label="인생관">{idealLifePhilosophy}</Field>
      ) : null}
      <Field
        label="문신 허용"
        nonNegotiable={nonNegotiableConditions.includes("IS_TATTOO_OK")}
      >
        {idealIsTattooOk ? "예" : "아니요"}
      </Field>
      {idealExercisePerWeek != null ? (
        <Field
          label="운동"
          nonNegotiable={nonNegotiableConditions.includes("EXERCISE_PER_WEEK")}
        >
          {주간_운동량_라벨[idealExercisePerWeek]}
        </Field>
      ) : null}
      <Field
        label="자차 기대"
        nonNegotiable={nonNegotiableConditions.includes("SHOULD_HAVE_CAR")}
      >
        {idealShouldHaveCar ? "예" : "아니요"}
      </Field>
      <Field
        label="게임 허용"
        nonNegotiable={nonNegotiableConditions.includes("IS_GAMING_OK")}
      >
        {idealIsGamingOk ? "예" : "아니요"}
      </Field>
      <Field
        label="반려동물 허용"
        nonNegotiable={nonNegotiableConditions.includes("IS_PET_OK")}
      >
        {idealIsPetOk ? "예" : "아니요"}
      </Field>
      {idealTypeDescription != null ? (
        <Field label="이성상">{idealTypeDescription}</Field>
      ) : null}
    </div>
  );
}

interface FieldProps {
  label: ReactNode;
  nonNegotiable?: boolean;
  children: ReactNode;
}

function Field({ label, nonNegotiable = false, children }: FieldProps) {
  return (
    <div className={nonNegotiable ? "text-red-500" : undefined}>
      <span>{label}: </span>
      {children}
    </div>
  );
}
