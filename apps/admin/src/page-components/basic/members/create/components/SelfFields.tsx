import {
  독서량_라벨,
  성별_라벨,
  신분_라벨,
  쌍꺼풀_라벨,
  연간_벌이_라벨,
  연락_빈도_라벨,
  연락_수단_라벨,
  자녀수_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  체형_라벨,
  학력_라벨,
} from "@ieum/constants";
import {
  AnnualIncome,
  AssetsValue,
  BodyShape,
  BooksReadPerYear,
  ContactFrequency,
  ContactMethod,
  EducationLevel,
  ExercisePerWeek,
  Eyelid,
  Gender,
  OccupationStatus,
  PlannedNumberOfChildren,
  Religion,
} from "@ieum/prisma";
import { isEmptyStringOrNil, isMbti } from "@ieum/utils";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "~/components/Checkbox";
import { Select } from "~/components/Select";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import type { CreateBasicMemberForm } from "../CreateBasicMemberForm";

export function SelfFields() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateBasicMemberForm>();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">본인</h1>
      <TextInput
        label="이름"
        error={errors.name != null}
        {...register("name", {
          required: true,
        })}
      />
      <TextInput
        label="전화번호"
        error={errors.phoneNumber != null}
        {...register("phoneNumber", {
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
        name="gender"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="성별"
              error={errors.gender != null}
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
        error={errors.birthYear != null}
        {...register("birthYear", {
          required: true,
          valueAsNumber: true,
          validate: (value) => {
            return value >= 1980 && value <= 2005;
          },
        })}
      />
      <TextInput
        label="거주지"
        error={errors.residence != null}
        {...register("residence", {
          required: true,
        })}
      />
      <TextInput
        label="키"
        error={errors.height != null}
        {...register("height", {
          required: true,
          valueAsNumber: true,
          validate: (value) => {
            return value >= 140 && value <= 200;
          },
        })}
      />
      <Controller
        control={control}
        name="bodyShape"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="체형"
              error={errors.bodyShape != null}
              value={value}
              onChange={onChange}
            >
              {Object.values(BodyShape).map((bodyShape) => {
                return (
                  <option key={bodyShape} value={bodyShape}>
                    {체형_라벨[bodyShape]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <TextInput
        label="몸무게"
        error={errors.weight != null}
        {...register("weight", {
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
        name="eyelid"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="쌍꺼풀"
              error={errors.eyelid != null}
              value={value}
              onChange={(event) => {
                const option = event.target.value as Eyelid;

                if (option !== "OTHER") {
                  setValue("customEyelid", null);
                }

                onChange(option);
              }}
            >
              {Object.values(Eyelid).map((eyelidOption) => {
                return (
                  <option key={eyelidOption} value={eyelidOption}>
                    {쌍꺼풀_라벨[eyelidOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      {watch("eyelid") === "OTHER" ? (
        <TextInput
          error={errors.customEyelid != null}
          {...register("customEyelid", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <TextInput
        label="얼굴/신체 자신 있는 부위"
        error={errors.confidentFacialBodyPart != null}
        {...register("confidentFacialBodyPart", {
          required: true,
        })}
      />
      <Controller
        control={control}
        name="educationLevel"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="학력"
              error={errors.educationLevel != null}
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
        error={errors.graduatedUniversity != null}
        {...register("graduatedUniversity", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="occupationStatus"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="신분"
              error={errors.occupationStatus != null}
              value={value}
              onChange={onChange}
            >
              {Object.values(OccupationStatus).map((occupationStatusOption) => {
                return (
                  <option
                    key={occupationStatusOption}
                    value={occupationStatusOption}
                  >
                    {신분_라벨[occupationStatusOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <TextInput
        label="직장"
        error={errors.workplace != null}
        {...register("workplace", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="직무"
        error={errors.job != null}
        {...register("job", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="재학 학교"
        error={errors.currentSchool != null}
        {...register("currentSchool", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="mbti"
        rules={{
          validate: (value: string | null) => {
            return value == null || isMbti(value);
          },
        }}
        render={({ field: { onChange, value } }) => {
          return (
            <TextInput
              label="MBTI"
              error={errors.mbti != null}
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
        <Checkbox label="함" {...register("isSmoker")} />
      </div>
      <div>
        음주
        <Checkbox label="함" {...register("isDrinker")} />
      </div>
      <TextInput
        label="술을 얼마나 자주, 얼만큼 마시는지"
        {...register("alcoholConsumption", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="주량"
        {...register("alcoholTolerance", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="religion"
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
        name="annualIncome"
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
        name="assetsValue"
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
      <TextInput
        label="자산 관리 방법"
        {...register("assetManagementApproach", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput label="취미/관심사" {...register("hobby")} />
      <Controller
        control={control}
        name="booksReadPerYear"
        render={({ field: { onChange, value } }) => {
          return (
            <Select label="독서량" value={value} onChange={onChange}>
              {Object.values(BooksReadPerYear).map((booksReadPerYearOption) => {
                return (
                  <option
                    key={booksReadPerYearOption}
                    value={booksReadPerYearOption}
                  >
                    {독서량_라벨[booksReadPerYearOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      <TextInput
        label="책 취향"
        {...register("bookTaste", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="형제관계"
        {...register("siblings", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="특징"
        {...register("characteristics", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="10년 뒤 모습"
        {...register("tenYearFuture", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="plannedNumberOfChildren"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="결혼한다면 자녀 수는"
              value={value}
              onChange={onChange}
            >
              {Object.values(PlannedNumberOfChildren).map(
                (plannedNumberOfChildren) => {
                  return (
                    <option
                      key={plannedNumberOfChildren}
                      value={plannedNumberOfChildren}
                    >
                      {자녀수_라벨[plannedNumberOfChildren]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <TextInput
        label="인생관"
        {...register("lifePhilosophy", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="직업관"
        {...register("workPhilosophy", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <div>
        문신
        <Checkbox label="함" {...register("hasTattoo")} />
      </div>
      <Controller
        control={control}
        name="exercisePerWeek"
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
        {...register("exerciseType", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <div>
        자차
        <Checkbox label="있음" {...register("hasCar")} />
      </div>
      <div>
        게임
        <Checkbox label="함" {...register("doesGame")} />
      </div>
      <TextInput
        label="게임 종류"
        {...register("gameType", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="데이트 스타일"
        {...register("datingStyle", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="contactFrequency"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="연락 빈도"
              value={value}
              onChange={(event) => {
                const option = event.target.value as ContactFrequency;

                if (option !== "OTHER") {
                  setValue("customContactFrequency", null);
                }

                onChange(option);
              }}
            >
              {Object.values(ContactFrequency).map((contactFrequencyOption) => {
                return (
                  <option
                    key={contactFrequencyOption}
                    value={contactFrequencyOption}
                  >
                    {연락_빈도_라벨[contactFrequencyOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      {watch("contactFrequency") === "OTHER" ? (
        <TextInput
          error={errors.customContactFrequency != null}
          {...register("customContactFrequency", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <Controller
        control={control}
        name="contactMethod"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="연락 수단"
              value={value}
              onChange={(e) => {
                const option = e.target.value as ContactMethod;

                if (option !== "OTHER") {
                  setValue("customContactMethod", null);
                }

                onChange(option);
              }}
            >
              {Object.values(ContactMethod).map((contactMethodOption) => {
                return (
                  <option key={contactMethodOption} value={contactMethodOption}>
                    {연락_수단_라벨[contactMethodOption]}
                  </option>
                );
              })}
            </Select>
          );
        }}
      />
      {watch("contactMethod") === "OTHER" ? (
        <TextInput
          error={errors.customContactMethod != null}
          {...register("customContactMethod", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <div>
        반려동물
        <Checkbox label="키움" {...register("hasPet")} />
      </div>
      <TextareaInput
        label="나는 이런 사람이에요"
        {...register("selfIntroduction", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
    </div>
  );
}

const 비공개 = "PRIVATE";
