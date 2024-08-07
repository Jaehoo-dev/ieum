import {
  종교_라벨,
  지역_라벨,
  체형_라벨,
  최소_연간_벌이_라벨,
} from "@ieum/constants";
import {
  AnnualIncome,
  BodyShape,
  EducationLevel,
  MBTI,
  Region,
  Religion,
} from "@ieum/prisma";
import { Controller, useFormContext } from "react-hook-form";

import { handleNullableStringNumber, RegisterForm } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";
import { Buttons } from "../Buttons";
import { MultiSelect } from "../MultiSelect";
import { Range } from "../Range";
import { TextareaInput } from "../TextareaInput";
import { TextInput } from "../TextInput";
import { UniSelect } from "../UniSelect";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function IdealTypeSurvey({ onBack, onNext }: Props) {
  const {
    getValues,
    watch,
    setValue,
    formState: { errors },
    register,
    control,
    trigger,
  } = useFormContext<RegisterForm>();
  const 선호학력이_학사이상인사 =
    watch("idealEducationLevel") === EducationLevel.BACHELOR_DEGREE ||
    watch("idealEducationLevel") === EducationLevel.MASTER_DEGREE ||
    watch("idealEducationLevel") === EducationLevel.DOCTORATE_DEGREE;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <BackTextButton onClick={onBack} />
      <div className="flex flex-col gap-8">
        <Range
          label="선호하시는 나이를 출생연도로 입력해주세요."
          description="예) ~ 1988, 1994 ~ 1990"
          error={
            errors.idealMinAgeBirthYear != null ||
            errors.idealMaxAgeBirthYear != null
          }
          errorText={
            errors.idealMinAgeBirthYear?.message ||
            errors.idealMaxAgeBirthYear?.message
          }
          from={{
            ...register("idealMinAgeBirthYear", {
              setValueAs: handleNullableStringNumber,
              validate: (value) => {
                const idealMaxAgeBirthYear = getValues("idealMaxAgeBirthYear");

                const isValid =
                  value == null ||
                  (value >= 1970 &&
                    value <= 2005 &&
                    (idealMaxAgeBirthYear == null ||
                      value >= idealMaxAgeBirthYear));

                if (isValid) {
                  return true;
                }

                return "출생연도를 확인해주세요. 왼쪽이 최소 나이 오른쪽이 최대 나이입니다.";
              },
            }),
          }}
          to={{
            ...register("idealMaxAgeBirthYear", {
              setValueAs: handleNullableStringNumber,
              validate: (value) => {
                const idealMinAgeBirthYear = getValues("idealMinAgeBirthYear");

                const isValid =
                  value == null ||
                  (value >= 1975 &&
                    value <= 2005 &&
                    (idealMinAgeBirthYear == null ||
                      value <= idealMinAgeBirthYear));

                if (isValid) {
                  return true;
                }

                return "출생연도를 확인해주세요. 왼쪽이 최소 나이 오른쪽이 최대 나이입니다.";
              },
            }),
          }}
        />
        <Controller
          control={control}
          name="idealRegions"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="상대방이 어디에 거주하길 바라세요?"
                description="여러 개 선택 가능"
                options={Object.values(Region)
                  .filter((value) => {
                    return value !== Region.OTHER;
                  })
                  .map((region) => {
                    return {
                      label: 지역_라벨[region],
                      value: region,
                    };
                  })}
                selectedValues={value}
                onChange={onChange}
              />
            );
          }}
        />
        <Range
          label="상대방 키가 어느 정도이길 바라세요?"
          description="예) 160 ~ 170, 170 ~"
          error={errors.idealMinHeight != null || errors.idealMaxHeight != null}
          errorText={
            errors.idealMinHeight?.message || errors.idealMaxHeight?.message
          }
          from={{
            ...register("idealMinHeight", {
              setValueAs: handleNullableStringNumber,
              validate: (value) => {
                const idealMaxHeight = getValues("idealMaxHeight");

                const isValid =
                  value == null ||
                  (value >= 140 &&
                    value <= 200 &&
                    (idealMaxHeight == null || value <= idealMaxHeight));

                if (isValid) {
                  return true;
                }

                return "키를 확인해주세요.";
              },
            }),
          }}
          to={{
            ...register("idealMaxHeight", {
              setValueAs: handleNullableStringNumber,
              validate: (value) => {
                const idealMinHeight = getValues("idealMinHeight");

                const isValid =
                  value == null ||
                  (value >= 140 &&
                    value <= 200 &&
                    (idealMinHeight == null || value >= idealMinHeight));

                if (isValid) {
                  return true;
                }

                return "키를 확인해주세요.";
              },
            }),
          }}
        />
        <Controller
          control={control}
          name="idealBodyShapes"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="선호하시는 체형이 있으세요?"
                description="여러 개 선택 가능"
                options={Object.values(BodyShape).map((bodyShape) => {
                  return {
                    label: 체형_라벨[bodyShape],
                    value: bodyShape,
                  };
                })}
                selectedValues={value}
                onChange={onChange}
              />
            );
          }}
        />
        <TextInput
          label="이성을 볼 때 특별히 선호하는 얼굴이나 신체 특징이 있다면 알려주세요."
          error={errors.idealFacialBodyPart != null}
          errorText={errors.idealFacialBodyPart?.message}
          {...register("idealFacialBodyPart")}
        />
        <Controller
          control={control}
          name="idealEducationLevel"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="상대방 학력이 어느 정도이길 바라세요?"
                options={[
                  {
                    label: "고등학교 졸업 이상",
                    value: EducationLevel.HIGH_SCHOOL_GRADUATE,
                  },
                  {
                    label: "전문학사 이상",
                    value: EducationLevel.ASSOCIATE_DEGREE,
                  },
                  { label: "학사 이상", value: EducationLevel.BACHELOR_DEGREE },
                  { label: "석사 이상", value: EducationLevel.MASTER_DEGREE },
                ]}
                value={value}
                onChange={(value) => {
                  onChange(value);

                  const 학사이상인가 =
                    value === EducationLevel.BACHELOR_DEGREE ||
                    value === EducationLevel.MASTER_DEGREE ||
                    value === EducationLevel.DOCTORATE_DEGREE;

                  if (!학사이상인가) {
                    setValue("idealSchoolLevel", null);
                  }
                }}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
        />
        {선호학력이_학사이상인사 ? (
          <TextInput
            label="이성을 볼 때 선호하는 학벌 수준이 있다면 알려주세요."
            error={errors.idealSchoolLevel != null}
            errorText={errors.idealSchoolLevel?.message}
            {...register("idealSchoolLevel")}
          />
        ) : null}
        <TextInput
          label="아는 사람이 있어서 피하고 싶은 직장이나 학교가 있다면 알려주세요."
          error={errors.idealNonPreferredWorkplace != null}
          errorText={errors.idealNonPreferredWorkplace?.message}
          {...register("idealNonPreferredWorkplace")}
        />
        <TextInput
          label="혹시 선호하지 않는 직무가 있다면 적어주세요."
          error={errors.idealNonPreferredJob != null}
          errorText={errors.idealNonPreferredJob?.message}
          {...register("idealNonPreferredJob")}
        />
        <Controller
          control={control}
          name="idealMinAnnualIncome"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="상대방 연봉이 어느 정도이길 바라세요?"
                options={Object.values(AnnualIncome)
                  .filter((value) => {
                    return value !== AnnualIncome.LT_30M;
                  })
                  .map((annualIncome) => {
                    return {
                      label: 최소_연간_벌이_라벨[annualIncome],
                      value: annualIncome,
                    };
                  })}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="idealPreferredMbtis"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="선호하는 MBTI가 있다면 골라주세요."
                description="여러 개 선택 가능"
                options={Object.values(MBTI).map((mbti) => {
                  return {
                    label: mbti,
                    value: mbti,
                  };
                })}
                selectedValues={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={4}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="idealNonPreferredMbtis"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="잘 맞지 않는다 생각하시는 MBTI는요?"
                description="여러 개 선택 가능"
                options={Object.values(MBTI).map((mbti) => {
                  return {
                    label: mbti,
                    value: mbti,
                  };
                })}
                selectedValues={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={4}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="idealCharacteristics"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="기대하시는 상대방 특징을 최대 5개까지 골라주세요."
                options={[
                  { label: "친절한", value: "친절한" },
                  { label: "성실한", value: "성실한" },
                  { label: "정직한", value: "정직한" },
                  { label: "리더십 강한", value: "리더십 강한" },
                  { label: "엉뚱한", value: "엉뚱한" },
                  { label: "차분한", value: "차분한" },
                  { label: "지적인", value: "지적인" },
                  { label: "리액션 좋은", value: "리액션 좋은" },
                  { label: "화려한", value: "화려한" },
                  { label: "협조적인", value: "협조적인" },
                  { label: "카리스마 있는", value: "카리스마 있는" },
                  { label: "사려 깊은", value: "사려 깊은" },
                  { label: "집중력이 강한", value: "집중력이 강한" },
                  { label: "믿음직한", value: "믿음직한" },
                  { label: "애교 많은", value: "애교 많은" },
                  { label: "활발한", value: "활발한" },
                  { label: "단순한", value: "단순한" },
                  { label: "낙천적인", value: "낙천적인" },
                  { label: "용감한", value: "용감한" },
                  { label: "귀여운", value: "귀여운" },
                  { label: "열정 넘치는", value: "열정 넘치는" },
                  { label: "무던한", value: "무던한" },
                  { label: "자부심 강한", value: "자부심 강한" },
                  { label: "예의바른", value: "예의바른" },
                  { label: "예술적인", value: "예술적인" },
                  { label: "다정한", value: "다정한" },
                  { label: "관대한", value: "관대한" },
                  { label: "신중한", value: "신중한" },
                  { label: "도도한", value: "도도한" },
                  { label: "털털한", value: "털털한" },
                  { label: "조용한", value: "조용한" },
                  { label: "유머 감각이 뛰어난", value: "유머 감각이 뛰어난" },
                  { label: "자유로운", value: "자유로운" },
                  { label: "듬직한", value: "듬직한" },
                  { label: "섹시한", value: "섹시한" },
                  { label: "우아한", value: "우아한" },
                  { label: "자비로운", value: "자비로운" },
                  { label: "다재다능한", value: "다재다능한" },
                  { label: "호기심 많은", value: "호기심 많은" },
                  { label: "진중한", value: "진중한" },
                  { label: "융통성 있는", value: "융통성 있는" },
                ]}
                selectedValues={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
                max={5}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="idealPreferredReligions"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="선호하시는 상대방 종교가 있으세요?"
                description="여러 개 선택 가능"
                options={Object.values(Religion).map((religion) => {
                  return {
                    label: 종교_라벨[religion],
                    value: religion,
                  };
                })}
                selectedValues={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="idealNonPreferredReligions"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label="기피하는 상대방 종교는요?"
                description="여러 개 선택 가능"
                options={Object.values(Religion)
                  .filter((religion) => {
                    return religion !== Religion.NONE;
                  })
                  .map((religion) => {
                    return {
                      label: 종교_라벨[religion],
                      value: religion,
                    };
                  })}
                selectedValues={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="idealIsSmokerOk"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="상대방이 담배를 피워도 괜찮으신가요?"
                options={[
                  { label: "피워도 괜찮아요", value: true },
                  { label: "안 피우면 좋겠어요", value: false },
                ]}
                value={value}
                onChange={onChange}
                required={true}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value === null) {
                return "답변을 선택해주세요.";
              }
            },
          }}
        />
        <Controller
          control={control}
          name="idealIsTattooOk"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="상대방의 문신 어떻게 생각하세요?"
                options={[
                  { label: "있어도 좋아요", value: true },
                  { label: "저랑 잘 맞지 않을 것 같아요", value: false },
                ]}
                value={value}
                onChange={onChange}
                required={true}
                error={error != null}
                errorText={error?.message}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value === null) {
                return "답변을 선택해주세요.";
              }
            },
          }}
        />
        <TextareaInput
          label="마지막으로 어떤 이성을 만나고 싶으신지, 이성상을 적어주세요."
          description="프로필에 기재하니 성의 있게 써주세요 :)"
          required={true}
          error={errors.idealTypeDescription != null}
          errorText={errors.idealTypeDescription?.message}
          {...register("idealTypeDescription", {
            required: "이성상을 적어주세요.",
          })}
        />
      </div>
      <div className="mt-4">
        <Buttons
          onBackClick={onBack}
          onNextClick={async () => {
            const isValid = await trigger(
              [
                "idealMinAgeBirthYear",
                "idealMaxAgeBirthYear",
                "idealRegions",
                "idealMinHeight",
                "idealMaxHeight",
                "idealBodyShapes",
                "idealCharacteristics",
                "idealEducationLevel",
                "idealSchoolLevel",
                "idealNonPreferredWorkplace",
                "idealNonPreferredJob",
                "idealMinAnnualIncome",
                "idealPreferredMbtis",
                "idealNonPreferredMbtis",
                "idealPreferredReligions",
                "idealNonPreferredReligions",
                "idealIsSmokerOk",
                "idealIsTattooOk",
                "idealTypeDescription",
              ],
              {
                shouldFocus: true,
              },
            );

            if (isValid) {
              onNext();
            }
          }}
        />
      </div>
    </div>
  );
}
