import {
  독서량_라벨,
  신분_라벨,
  연간_벌이_라벨,
  음주량_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  지역_라벨,
  체형_라벨,
  학력_라벨,
} from "@ieum/constants";
import {
  AnnualIncome,
  AssetsValue,
  BodyShape,
  BooksReadPerYear,
  DrinkingFrequency,
  EducationLevel,
  ExercisePerWeek,
  MBTI,
  OccupationStatus,
  Region,
  Religion,
} from "@ieum/prisma";
import { isEmptyStringOrNil } from "@ieum/utils";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Checkbox } from "~/components/Checkbox";
import { Select } from "~/components/Select";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { BasicMemberForm } from "../../members/BasicMemberForm";

export function IdealTypeFields() {
  const {
    control,
    register,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<BasicMemberForm>();
  const {
    fields: idealRegionFields,
    append: appendIdealRegion,
    remove: removeIdealRegion,
  } = useFieldArray({
    control,
    name: "idealType.regions",
  });
  const {
    fields: preferredBodyShapeFields,
    append: appendPreferredBodyShape,
    remove: removePreferredBodyShape,
  } = useFieldArray({
    control,
    name: "idealType.bodyShapes",
  });
  const {
    fields: idealEyelidFields,
    append: appendIdealEyelid,
    remove: removeIdealEyelid,
  } = useFieldArray({
    control,
    name: "idealType.eyelids",
  });
  const {
    fields: idealOccupationStatusFields,
    append: appendIdealOccupationStatus,
    remove: removeIdealOccupationStatus,
  } = useFieldArray({
    control,
    name: "idealType.occupationStatuses",
  });
  const {
    fields: preferredMbtisFields,
    append: appendPreferredMbtis,
    remove: removePreferredMbtis,
  } = useFieldArray({
    control,
    name: "idealType.preferredMbtis",
  });
  const {
    fields: nonPreferredMbtisFields,
    append: appendNonPreferredMbtis,
    remove: removeNonPreferredMbtis,
  } = useFieldArray({
    control,
    name: "idealType.nonPreferredMbtis",
  });
  const {
    fields: preferredReligionFields,
    append: appendPreferredReligion,
    remove: removePreferredReligion,
  } = useFieldArray({
    control,
    name: "idealType.preferredReligions",
  });
  const {
    fields: nonPreferredReligionFields,
    append: appendNonPreferredReligion,
    remove: removeNonPreferredReligion,
  } = useFieldArray({
    control,
    name: "idealType.nonPreferredReligions",
  });

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">이상형</h2>
      <TextInput
        label="최소 나이 출생연도"
        error={errors.idealType?.minAgeBirthYear != null}
        {...register("idealType.minAgeBirthYear", {
          setValueAs: (value: string | null) => {
            if (isEmptyStringOrNil(value)) {
              return null;
            }

            const valueAsNumber = Number(value);

            return isNaN(valueAsNumber) ? null : valueAsNumber;
          },
          validate: (value) => {
            const idealMaxAgeBirthYear = getValues("idealType.maxAgeBirthYear");

            return (
              value == null ||
              (value >= 1980 &&
                value <= 2005 &&
                (idealMaxAgeBirthYear == null || value >= idealMaxAgeBirthYear))
            );
          },
        })}
      />
      <TextInput
        label="최대 나이 출생연도"
        error={errors.idealType?.maxAgeBirthYear != null}
        {...register("idealType.maxAgeBirthYear", {
          setValueAs: (value: string | null) => {
            if (isEmptyStringOrNil(value)) {
              return null;
            }

            const valueAsNumber = Number(value);

            return isNaN(valueAsNumber) ? null : valueAsNumber;
          },
          validate: (value) => {
            const idealMinAgeBirthYear = getValues("idealType.minAgeBirthYear");

            return (
              value == null ||
              (value >= 1975 &&
                value <= 2005 &&
                (idealMinAgeBirthYear == null || value <= idealMinAgeBirthYear))
            );
          },
        })}
      />
      <div>
        지역
        <div className="grid grid-cols-3 gap-1">
          {Object.values(Region).map((region) => {
            return (
              <label key={region} className="flex gap-2">
                <input
                  className={`rounded border border-gray-300 ${
                    errors.idealType?.regions ? "border-2 border-red-500" : ""
                  }`}
                  type="checkbox"
                  checked={idealRegionFields.some((field) => {
                    return field.value === region;
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      appendIdealRegion({ value: region });
                    } else {
                      if (region !== "OTHER") {
                        setValue("idealType.customRegion", null);
                      }

                      removeIdealRegion(
                        idealRegionFields.findIndex(
                          (field) => field.value === region,
                        ),
                      );
                    }
                  }}
                />
                {지역_라벨[region]}
              </label>
            );
          })}
        </div>
        {watch("idealType.regions").some(({ value }) => {
          return value === "OTHER";
        }) ? (
          <TextInput
            error={errors.idealType?.customRegion != null}
            {...register("idealType.customRegion", {
              setValueAs: (value: string) => {
                return value === "" ? null : value;
              },
            })}
          />
        ) : null}
      </div>
      <TextInput
        label="최소 키"
        error={errors.idealType?.minHeight != null}
        {...register("idealType.minHeight", {
          setValueAs: (value: string | null) => {
            if (isEmptyStringOrNil(value)) {
              return null;
            }

            const valueAsNumber = Number(value);

            return isNaN(valueAsNumber) ? null : valueAsNumber;
          },
          validate: (value) => {
            const idealMaxHeight = getValues("idealType.maxHeight");

            return (
              value == null ||
              (value >= 140 &&
                value <= 200 &&
                (idealMaxHeight == null || value <= idealMaxHeight))
            );
          },
        })}
      />
      <TextInput
        label="최대 키"
        error={errors.idealType?.maxHeight != null}
        {...register("idealType.maxHeight", {
          setValueAs: (value: string | null) => {
            if (isEmptyStringOrNil(value)) {
              return null;
            }

            const valueAsNumber = Number(value);

            return isNaN(valueAsNumber) ? null : valueAsNumber;
          },
          validate: (value) => {
            const idealMinHeight = getValues("idealType.minHeight");

            return (
              value == null ||
              (value >= 140 &&
                value <= 200 &&
                (idealMinHeight == null || value >= idealMinHeight))
            );
          },
        })}
      />
      <div>
        체형
        <div className="grid grid-cols-5 gap-2">
          {Object.values(BodyShape).map((bodyShape) => {
            return (
              <Checkbox
                key={bodyShape}
                label={체형_라벨[bodyShape]}
                error={errors.idealType?.bodyShapes != null}
                checked={preferredBodyShapeFields.some((field) => {
                  return field.value === bodyShape;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendPreferredBodyShape({ value: bodyShape });
                  } else {
                    removePreferredBodyShape(
                      preferredBodyShapeFields.findIndex(
                        (field) => field.value === bodyShape,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <TextInput
        label="선호하는 얼굴/신체 특징"
        {...register("idealType.facialBodyPart", {
          setValueAs: (value: string) => {
            return value === "" ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="idealType.educationLevel"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="선호하는 최소 학력 수준"
              error={errors.idealType?.educationLevel != null}
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(EducationLevel)].map(
                (educationLevel) => {
                  return (
                    <option key={educationLevel} value={educationLevel}>
                      {educationLevel === 상관없음
                        ? 상관없음
                        : 학력_라벨[educationLevel as EducationLevel]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <TextInput
        label="선호하는 학벌"
        {...register("idealType.schoolLevel", {
          setValueAs: (value: string) => {
            return value === "" ? null : value;
          },
        })}
      />
      <div>
        선호 신분
        <div className="grid grid-cols-4 gap-2">
          {Object.values(OccupationStatus).map((occupationStatus) => {
            return (
              <Checkbox
                key={occupationStatus}
                label={신분_라벨[occupationStatus]}
                error={errors.idealType?.occupationStatuses != null}
                checked={idealOccupationStatusFields.some((field) => {
                  return field.value === occupationStatus;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendIdealOccupationStatus({ value: occupationStatus });
                  } else {
                    removeIdealOccupationStatus(
                      idealOccupationStatusFields.findIndex(
                        (field) => field.value === occupationStatus,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <TextInput
        label="기피 직장/학교"
        {...register("idealType.nonPreferredWorkplace", {
          setValueAs: (value: string) => {
            return value === "" ? null : value;
          },
        })}
      />
      <TextInput
        label="기피 직무"
        {...register("idealType.nonPreferredJob", {
          setValueAs: (value: string) => {
            return value === "" ? null : value;
          },
        })}
      />
      <div>
        선호 MBTI
        <div className="grid grid-cols-4 gap-1">
          {Object.values(MBTI).map((mbti) => {
            return (
              <Checkbox
                key={mbti}
                label={mbti}
                error={errors.idealType?.preferredMbtis != null}
                checked={preferredMbtisFields.some((field) => {
                  return field.value === mbti;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendPreferredMbtis({ value: mbti });
                  } else {
                    removePreferredMbtis(
                      preferredMbtisFields.findIndex(
                        (field) => field.value === mbti,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <div>
        기피 MBTI
        <div className="grid grid-cols-4 gap-1">
          {Object.values(MBTI).map((mbti) => {
            return (
              <Checkbox
                key={mbti}
                label={mbti}
                error={errors.idealType?.nonPreferredMbtis != null}
                checked={nonPreferredMbtisFields.some((field) => {
                  return field.value === mbti;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendNonPreferredMbtis({ value: mbti });
                  } else {
                    removeNonPreferredMbtis(
                      nonPreferredMbtisFields.findIndex(
                        (field) => field.value === mbti,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <div>
        <span>흡연</span>
        <Checkbox
          label="괘찮음"
          error={errors.idealType?.isSmokerOk != null}
          checked={watch("idealType.isSmokerOk")}
          onChange={(e) => {
            setValue("idealType.isSmokerOk", e.target.checked);
          }}
        />
      </div>
      <Controller
        control={control}
        name="idealType.drinkingFrequency"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="선호하는 음주량"
              error={errors.idealType?.drinkingFrequency != null}
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                if (value !== DrinkingFrequency.OTHER) {
                  setValue("idealType.customDrinkingFrequency", null);
                }

                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(DrinkingFrequency)].map(
                (drinkingFrequencyOption) => {
                  return (
                    <option
                      key={drinkingFrequencyOption}
                      value={drinkingFrequencyOption}
                    >
                      {drinkingFrequencyOption === 상관없음
                        ? 상관없음
                        : 음주량_라벨[
                            drinkingFrequencyOption as DrinkingFrequency
                          ]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      {watch("idealType.drinkingFrequency") === DrinkingFrequency.OTHER ? (
        <TextInput
          {...register("idealType.customDrinkingFrequency", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      ) : null}
      <div>
        선호 종교
        <div className="flex flex-row gap-4">
          {Object.values(Religion).map((religion) => {
            return (
              <Checkbox
                key={religion}
                label={종교_라벨[religion]}
                error={errors.idealType?.preferredReligions != null}
                checked={preferredReligionFields.some((field) => {
                  return field.value === religion;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendPreferredReligion({ value: religion });
                  } else {
                    removePreferredReligion(
                      preferredReligionFields.findIndex(
                        (field) => field.value === religion,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <div>
        기피 종교
        <div className="flex flex-row gap-4">
          {Object.values(Religion).map((religion) => {
            return (
              <Checkbox
                key={religion}
                label={종교_라벨[religion]}
                error={errors.idealType?.nonPreferredReligions != null}
                checked={nonPreferredReligionFields.some((field) => {
                  return field.value === religion;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendNonPreferredReligion({ value: religion });
                  } else {
                    removeNonPreferredReligion(
                      nonPreferredReligionFields.findIndex(
                        (field) => field.value === religion,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <Controller
        control={control}
        name="idealType.minAnnualIncome"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="최소 연간 벌이 수준"
              error={errors.idealType?.minAnnualIncome != null}
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(AnnualIncome)]
                .filter((item) => {
                  return item !== AnnualIncome.LT_30M;
                })
                .map((annualIncomeOption) => {
                  return (
                    <option key={annualIncomeOption} value={annualIncomeOption}>
                      {annualIncomeOption === 상관없음
                        ? 상관없음
                        : 연간_벌이_라벨[annualIncomeOption as AnnualIncome]}
                    </option>
                  );
                })}
            </Select>
          );
        }}
      />
      <Controller
        control={control}
        name="idealType.minAssetsValue"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="최소 자산 수준"
              error={errors.idealType?.minAssetsValue != null}
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(AssetsValue)]
                .filter((item) => {
                  return item !== AssetsValue.LT_30M;
                })
                .map((assetsValueOption) => {
                  return (
                    <option key={assetsValueOption} value={assetsValueOption}>
                      {assetsValueOption === 상관없음
                        ? 상관없음
                        : 자산_라벨[assetsValueOption as AssetsValue]}
                    </option>
                  );
                })}
            </Select>
          );
        }}
      />
      <TextInput
        label="취미/관심사"
        {...register("idealType.hobby", {
          setValueAs: (value: string) => {
            return value === "" ? null : value;
          },
        })}
      />
      <Controller
        control={control}
        name="idealType.booksReadPerYear"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="최소 독서량"
              error={errors.idealType?.booksReadPerYear != null}
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(BooksReadPerYear)].map(
                (booksReadPerYearOption) => {
                  return (
                    <option
                      key={booksReadPerYearOption}
                      value={booksReadPerYearOption}
                    >
                      {booksReadPerYearOption === 상관없음
                        ? 상관없음
                        : 독서량_라벨[
                            booksReadPerYearOption as BooksReadPerYear
                          ]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <TextInput
        label="특징"
        {...register("idealType.characteristics", {
          setValueAs: (value: string) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <TextInput
        label="인생관"
        {...register("idealType.lifePhilosophy", {
          setValueAs: (value: string) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      <div>
        문신
        <Checkbox label="괜찮음" {...register("idealType.isTattooOk")} />
      </div>
      <Controller
        control={control}
        name="idealType.exercisePerWeek"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="운동량"
              error={errors.idealType?.exercisePerWeek != null}
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(ExercisePerWeek)].map(
                (exercisePerWeekOption) => {
                  return (
                    <option
                      key={exercisePerWeekOption}
                      value={exercisePerWeekOption}
                    >
                      {exercisePerWeekOption === 상관없음
                        ? 상관없음
                        : 주간_운동량_라벨[
                            exercisePerWeekOption as ExercisePerWeek
                          ]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <TextareaInput
        label="만나고 싶은 이성상"
        {...register("idealType.idealTypeDescription", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
    </div>
  );
}

const 상관없음 = "상관없음";
