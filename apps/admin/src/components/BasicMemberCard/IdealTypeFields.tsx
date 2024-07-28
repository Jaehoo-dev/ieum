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
} from "@ieum/constants";
import type { BasicMemberIdealTypeV2 } from "@ieum/prisma";

interface Props {
  idealType: BasicMemberIdealTypeV2;
}

export function IdealTypeFields({ idealType }: Props) {
  const {
    minAgeBirthYear,
    maxAgeBirthYear,
    regions,
    customRegion,
    minHeight,
    maxHeight,
    bodyShapes,
    eyelids,
    facialBodyPart,
    educationLevel,
    schoolLevel,
    occupationStatuses,
    nonPreferredWorkplace,
    nonPreferredJob,
    preferredMbtis,
    nonPreferredMbtis,
    isSmokerOk,
    drinkingFrequency,
    preferredReligions,
    nonPreferredReligions,
    minAnnualIncome,
    minAssetsValue,
    hobby,
    booksReadPerYear,
    characteristics,
    lifePhilosophy,
    isTattooOk,
    exercisePerWeek,
    shouldHaveCar,
    isGamingOk,
    isPetOk,
    dealBreakers,
    idealTypeDescription,
  } = idealType;

  return (
    <div className="flex w-1/2 flex-col gap-0.5">
      {minAgeBirthYear != null || maxAgeBirthYear != null ? (
        <Field label="나이" nonNegotiable={dealBreakers.includes("AGE")}>
          {minAgeBirthYear} ~ {maxAgeBirthYear}
        </Field>
      ) : null}
      {regions.length > 0 || customRegion != null ? (
        <Field label="지역" nonNegotiable={dealBreakers.includes("REGION")}>
          {`${regions
            .map((region) => {
              return 지역_라벨[region];
            })
            .join(", ")}${customRegion != null ? `, ${customRegion}` : ""}`}
        </Field>
      ) : null}
      {minHeight != null || maxHeight != null ? (
        <Field label="키" nonNegotiable={dealBreakers.includes("HEIGHT")}>
          {minHeight} ~ {maxHeight}
        </Field>
      ) : null}
      {bodyShapes.length > 0 ? (
        <Field
          label="체형"
          nonNegotiable={dealBreakers.includes("BODY_SHAPES")}
        >
          {bodyShapes
            .map((bodyShape) => {
              return 체형_라벨[bodyShape];
            })
            .join(", ")}
        </Field>
      ) : null}
      {eyelids.length > 0 ? (
        <Field label="쌍꺼풀" nonNegotiable={dealBreakers.includes("EYELID")}>
          {eyelids
            .map((eyelid) => {
              return 쌍꺼풀_라벨[eyelid];
            })
            .join(", ")}
        </Field>
      ) : null}
      {facialBodyPart != null ? (
        <Field
          label="얼굴/신체 특징"
          nonNegotiable={dealBreakers.includes("FACIAL_BODY_PART")}
        >
          {facialBodyPart}
        </Field>
      ) : null}
      {educationLevel != null ? (
        <Field
          label="최소 학력"
          nonNegotiable={dealBreakers.includes("EDUCATION_LEVEL")}
        >
          {학력_라벨[educationLevel]}
        </Field>
      ) : null}
      {schoolLevel != null ? (
        <Field
          label="최소 학벌"
          nonNegotiable={dealBreakers.includes("SCHOOL_LEVEL")}
        >
          {schoolLevel}
        </Field>
      ) : null}
      {occupationStatuses.length > 0 ? (
        <Field
          label="신분"
          nonNegotiable={dealBreakers.includes("OCCUPATION_STATUS")}
        >
          {occupationStatuses
            .map((status) => {
              return 신분_라벨[status];
            })
            .join(", ")}
        </Field>
      ) : null}
      {nonPreferredWorkplace != null ? (
        <Field label="기피 직장/학교" nonNegotiable={true}>
          {nonPreferredWorkplace}
        </Field>
      ) : null}
      {nonPreferredJob != null ? (
        <Field
          label="기피 직무"
          nonNegotiable={dealBreakers.includes("NON_PREFERRED_JOB")}
        >
          {nonPreferredJob}
        </Field>
      ) : null}
      {preferredMbtis.length > 0 ? (
        <Field
          label="선호 MBTI"
          nonNegotiable={dealBreakers.includes("PREFERRED_MBTIS")}
        >
          {preferredMbtis
            .map((mbti) => {
              return mbti;
            })
            .join(", ")}
        </Field>
      ) : null}
      {nonPreferredMbtis.length > 0 ? (
        <Field
          label="기피 MBTI"
          nonNegotiable={dealBreakers.includes("NON_PREFERRED_MBTIS")}
        >
          {nonPreferredMbtis
            .map((mbti) => {
              return mbti;
            })
            .join(", ")}
        </Field>
      ) : null}
      <Field
        label="흡연 허용"
        nonNegotiable={dealBreakers.includes("IS_SMOKER_OK")}
      >
        {isSmokerOk ? "예" : "아니요"}
      </Field>
      {drinkingFrequency != null ? (
        <Field
          label="음주 빈도"
          nonNegotiable={dealBreakers.includes("DRINKING_FREQUENCY")}
        >
          {음주량_라벨[drinkingFrequency]}
        </Field>
      ) : null}
      {preferredReligions.length > 0 ? (
        <Field
          label="선호 종교"
          nonNegotiable={dealBreakers.includes("PREFERRED_RELIGIONS")}
        >
          {preferredReligions
            .map((religion) => {
              return 종교_라벨[religion];
            })
            .join(", ")}
        </Field>
      ) : null}
      {nonPreferredReligions.length > 0 ? (
        <Field
          label="기피 종교"
          nonNegotiable={dealBreakers.includes("NON_PREFERRED_RELIGIONS")}
        >
          {nonPreferredReligions
            .map((religion) => {
              return 종교_라벨[religion];
            })
            .join(", ")}
        </Field>
      ) : null}
      {minAnnualIncome != null ? (
        <Field
          label="최소 연봉"
          nonNegotiable={dealBreakers.includes("MIN_ANNUAL_INCOME")}
        >
          {연간_벌이_라벨[minAnnualIncome]}
        </Field>
      ) : null}
      {minAssetsValue != null ? (
        <Field
          label="최소 자산"
          nonNegotiable={dealBreakers.includes("MIN_ASSETS_VALUE")}
        >
          {자산_라벨[minAssetsValue]}
        </Field>
      ) : null}
      {hobby != null ? (
        <Field
          label="취미/관심사"
          nonNegotiable={dealBreakers.includes("HOBBY")}
        >
          {hobby}
        </Field>
      ) : null}
      {booksReadPerYear != null ? (
        <Field
          label="독서량"
          nonNegotiable={dealBreakers.includes("BOOKS_READ_PER_YEAR")}
        >
          {독서량_라벨[booksReadPerYear]}
        </Field>
      ) : null}
      {characteristics != null ? (
        <Field
          label="특징"
          nonNegotiable={dealBreakers.includes("CHARACTERISTICS")}
        >
          {characteristics}
        </Field>
      ) : null}
      {lifePhilosophy != null ? (
        <Field label="인생관">{lifePhilosophy}</Field>
      ) : null}
      <Field
        label="문신 허용"
        nonNegotiable={dealBreakers.includes("IS_TATTOO_OK")}
      >
        {isTattooOk ? "예" : "아니요"}
      </Field>
      {exercisePerWeek != null ? (
        <Field
          label="운동"
          nonNegotiable={dealBreakers.includes("EXERCISE_PER_WEEK")}
        >
          {주간_운동량_라벨[exercisePerWeek]}
        </Field>
      ) : null}
      {shouldHaveCar != null ? (
        <Field
          label="자차 기대"
          nonNegotiable={dealBreakers.includes("SHOULD_HAVE_CAR")}
        >
          {shouldHaveCar ? "예" : "아니요"}
        </Field>
      ) : null}
      {isGamingOk != null ? (
        <Field
          label="게임 허용"
          nonNegotiable={dealBreakers.includes("IS_GAMING_OK")}
        >
          {isGamingOk ? "예" : "아니요"}
        </Field>
      ) : null}
      {isPetOk != null ? (
        <Field
          label="반려동물 허용"
          nonNegotiable={dealBreakers.includes("IS_PET_OK")}
        >
          {isPetOk ? "예" : "아니요"}
        </Field>
      ) : null}
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
