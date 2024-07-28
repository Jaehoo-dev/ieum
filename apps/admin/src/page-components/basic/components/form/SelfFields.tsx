import {
  독서량_라벨,
  성별_라벨,
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
      <Controller
        control={control}
        name="self.bodyShape"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="체형"
              error={errors.self?.bodyShape != null}
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
        name="self.eyelid"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="쌍꺼풀"
              error={errors.self?.eyelid != null}
              value={value}
              onChange={(event) => {
                const option = event.target.value as Eyelid;

                if (option !== "OTHER") {
                  setValue("self.customEyelid", null);
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
      {watch("self.eyelid") === "OTHER" ? (
        <TextInput
          error={errors.self?.customEyelid != null}
          {...register("self.customEyelid", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <TextInput
        label="얼굴/신체 자신 있는 부위"
        error={errors.self?.confidentFacialBodyPart != null}
        {...register("self.confidentFacialBodyPart", {
          required: true,
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
      <Controller
        control={control}
        name="self.occupationStatus"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="신분"
              error={errors.self?.occupationStatus != null}
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
      <TextInput
        label="재학 학교"
        error={errors.self?.currentSchool != null}
        {...register("self.currentSchool", {
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
      <TextInput
        label="자산 관리 방법"
        {...register("self.assetManagementApproach", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput label="취미/관심사" {...register("self.hobby")} />
      <Controller
        control={control}
        name="self.booksReadPerYear"
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
        {...register("self.bookTaste", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="특징"
        {...register("self.characteristics", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="10년 뒤 모습"
        {...register("self.tenYearFuture", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="인생관"
        {...register("self.lifePhilosophy", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="직업관"
        {...register("self.workPhilosophy", {
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
        label="게임 종류"
        {...register("self.gameType", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="데이트 스타일"
        {...register("self.datingStyle", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="self.contactFrequency"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="연락 빈도"
              value={value}
              onChange={(event) => {
                const option = event.target.value as ContactFrequency;

                if (option !== "OTHER") {
                  setValue("self.customContactFrequency", null);
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
      {watch("self.contactFrequency") === "OTHER" ? (
        <TextInput
          error={errors.self?.customContactFrequency != null}
          {...register("self.customContactFrequency", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <Controller
        control={control}
        name="self.contactMethod"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="연락 수단"
              value={value}
              onChange={(e) => {
                const option = e.target.value as ContactMethod;

                if (option !== "OTHER") {
                  setValue("self.customContactMethod", null);
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
      {watch("self.contactMethod") === "OTHER" ? (
        <TextInput
          error={errors.self?.customContactMethod != null}
          {...register("self.customContactMethod", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <div>
        반려동물
        <Checkbox label="키움" {...register("self.hasPet")} />
      </div>
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
