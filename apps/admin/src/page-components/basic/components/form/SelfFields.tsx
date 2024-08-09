import {
  성별_라벨,
  연간_벌이_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  학력_라벨,
} from "@ieum/constants";
import {
  AnnualIncome,
  AssetsValue,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  Religion,
} from "@ieum/prisma";
import { isEmptyStringOrNil, isMbti } from "@ieum/utils";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "~/components/Checkbox";
import { Select } from "~/components/Select";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { BasicMemberForm } from "../../members/BasicMemberForm";

export function SelfFields() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BasicMemberForm>();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">본인</h2>
      <TextInput
        label="이름"
        error={errors.self?.name != null}
        {...register("self.name", {
          required: true,
        })}
      />
      <TextInput
        label="전화번호"
        error={errors.self?.phoneNumber != null}
        {...register("self.phoneNumber", {
          required: true,
          validate: (value) => {
            return (
              !isEmptyStringOrNil(value) &&
              value.startsWith("010") &&
              value.length === 11
            );
          },
        })}
      />
      <Controller
        control={control}
        name="self.gender"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="성별"
              error={errors.self?.gender != null}
              value={value}
              onChange={onChange}
            >
              {Object.values(Gender).map((gender) => {
                return (
                  <option key={gender} value={gender}>
                    {성별_라벨[gender]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <TextInput
        label="출생연도"
        error={errors.self?.birthYear != null}
        {...register("self.birthYear", {
          required: true,
          valueAsNumber: true,
          validate: (value) => {
            return value >= 1980 && value <= 2005;
          },
        })}
      />
      <TextInput
        label="거주지"
        error={errors.self?.residence != null}
        {...register("self.residence", {
          required: true,
        })}
      />
      <TextInput
        label="키"
        error={errors.self?.height != null}
        {...register("self.height", {
          required: true,
          valueAsNumber: true,
          validate: (value) => {
            return value >= 140 && value <= 200;
          },
        })}
      />
      <TextInput
        label="몸무게"
        error={errors.self?.weight != null}
        {...register("self.weight", {
          setValueAs: (value: string | null) => {
            if (isEmptyStringOrNil(value)) {
              return null;
            }

            const valueAsNumber = Number(value);

            return isNaN(valueAsNumber) ? null : valueAsNumber;
          },
          validate: (value) => {
            return value == null || (value >= 30 && value <= 150);
          },
        })}
      />
      <Controller
        control={control}
        name="self.educationLevel"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="학력"
              error={errors.self?.educationLevel != null}
              value={value}
              onChange={onChange}
            >
              {Object.values(EducationLevel).map((educationLevelOption) => {
                return (
                  <option
                    key={educationLevelOption}
                    value={educationLevelOption}
                  >
                    {학력_라벨[educationLevelOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <TextInput
        label="졸업한 대학교"
        error={errors.self?.graduatedUniversity != null}
        {...register("self.graduatedUniversity", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="직장"
        error={errors.self?.workplace != null}
        {...register("self.workplace", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="직무"
        error={errors.self?.job != null}
        {...register("self.job", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="self.mbti"
        rules={{
          validate: (value: string | null) => {
            return value == null || isMbti(value);
          },
        }}
        render={({ field: { onChange, value } }) => {
          return (
            <TextInput
              label="MBTI"
              error={errors.self?.mbti != null}
              value={value ?? ""}
              onChange={({ target: { value } }) => {
                isEmptyStringOrNil(value)
                  ? onChange(null)
                  : onChange(value.toUpperCase());
              }}
            />
          );
        }}
      />
      <div>
        흡연
        <Checkbox label="함" {...register("self.isSmoker")} />
      </div>
      <div>
        음주
        <Checkbox label="함" {...register("self.isDrinker")} />
      </div>
      <TextInput
        label="술을 얼마나 자주, 얼만큼 마시는지"
        {...register("self.alcoholConsumption", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="주량"
        {...register("self.alcoholTolerance", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="self.religion"
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => {
          return (
            <Select label="종교" value={value} onChange={onChange}>
              {Object.values(Religion).map((religion) => {
                return (
                  <option key={religion} value={religion}>
                    {종교_라벨[religion]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <Controller
        control={control}
        name="self.annualIncome"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="연간 벌이"
              value={value ?? 비공개}
              onChange={({ target: { value } }) => {
                onChange(value === 비공개 ? null : value);
              }}
            >
              {[비공개, ...Object.values(AnnualIncome)].map(
                (annualIncomeOption) => {
                  if (annualIncomeOption === 비공개) {
                    return (
                      <option
                        key={annualIncomeOption}
                        value={annualIncomeOption}
                      >
                        비공개
                      </option>
                    );
                  }

                  return (
                    <option key={annualIncomeOption} value={annualIncomeOption}>
                      {연간_벌이_라벨[annualIncomeOption as AnnualIncome]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <Controller
        control={control}
        name="self.assetsValue"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="자산"
              value={value ?? 비공개}
              onChange={({ target: { value } }) => {
                onChange(value === 비공개 ? null : value);
              }}
            >
              {[비공개, ...Object.values(AssetsValue)].map(
                (assetsValueOption) => {
                  if (assetsValueOption === 비공개) {
                    return (
                      <option key={assetsValueOption} value={assetsValueOption}>
                        비공개
                      </option>
                    );
                  }

                  return (
                    <option key={assetsValueOption} value={assetsValueOption}>
                      {자산_라벨[assetsValueOption as AssetsValue]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <TextInput label="취미/관심사" {...register("self.hobby")} />
      <TextInput
        label="특징"
        {...register("self.characteristics", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <div>
        문신
        <Checkbox label="함" {...register("self.hasTattoo")} />
      </div>
      <Controller
        control={control}
        name="self.exercisePerWeek"
        render={({ field: { onChange, value } }) => {
          return (
            <Select label="주간 운동량" value={value} onChange={onChange}>
              {Object.values(ExercisePerWeek).map((exercisePerWeekOption) => {
                return (
                  <option
                    key={exercisePerWeekOption}
                    value={exercisePerWeekOption}
                  >
                    {주간_운동량_라벨[exercisePerWeekOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <TextInput
        label="운동 종류"
        {...register("self.exerciseType", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <div>
        자차
        <Checkbox label="있음" {...register("self.hasCar")} />
      </div>
      <div>
        게임
        <Checkbox label="함" {...register("self.doesGame")} />
      </div>
      <TextInput
        label="데이트 스타일"
        {...register("self.datingStyle", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextareaInput
        label="나는 이런 사람이에요"
        {...register("self.selfIntroduction", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
        rows={4}
      />
    </div>
  );
}

const 비공개 = "PRIVATE";
