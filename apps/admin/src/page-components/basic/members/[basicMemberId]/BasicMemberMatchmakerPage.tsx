import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import {
  독서량_라벨,
  베이직_조건_라벨,
  신분_라벨,
  연간_벌이_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  학력_라벨,
} from "@ieum/constants";
import type { BasicMember } from "@ieum/prisma";
import {
  AnnualIncome,
  AssetsValue,
  BasicCondition,
  BooksReadPerYear,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MatchStatus,
  MBTI,
  OccupationStatus,
  orderedAnnualIncomes,
  orderedAssetsValues,
  orderedBooksReadPerYears,
  orderedEducationLevels,
  orderedExercisePerWeeks,
  Religion,
} from "@ieum/prisma";
import { isEmptyStringOrNil } from "@ieum/utils";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { match } from "ts-pattern";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Checkbox } from "~/components/Checkbox";
import { Layout } from "~/components/Layout";
import { Select } from "~/components/Select";
import { TextInput } from "~/components/TextInput";
import type { BasicMemberWithJoined } from "~/domains/basic/types";
import { api } from "~/utils/api";

interface CustomCanditatesSearchForm {
  minAgeBirthYear: number | null;
  maxAgeBirthYear: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  minEducationLevel: EducationLevel | null;
  occupationStatuses: { value: OccupationStatus }[];
  preferredMbtis: { value: MBTI }[];
  nonPreferredMbtis: { value: MBTI }[];
  isSmokerOk: boolean;
  preferredReligions: { value: Religion }[];
  nonPreferredReligions: { value: Religion }[];
  minAnnualIncome: AnnualIncome | null;
  minAssetsValue: AssetsValue | null;
  minBooksReadPerYear: BooksReadPerYear | null;
  isTattooOk: boolean;
  exercisePerWeek: ExercisePerWeek | null;
  shouldHaveCar: boolean;
  isGamingOk: boolean;
  isPetOk: boolean;
  nonNegotiableConditions: { value: BasicCondition }[];
}

export function BasicMemberMatchmakerPage() {
  const [searchMode, setSearchMode] = useState<"DEFAULT" | "CUSTOM">("DEFAULT");
  const utils = api.useUtils();
  const router = useRouter();
  const basicMemberId = Number(router.query.basicMemberId);
  const { data: basicMember } = api.basicMemberRouter.findById.useQuery(
    { id: basicMemberId },
    {
      enabled: !isNaN(basicMemberId),
    },
  );
  const { data: defaultMatchCandidates = [] } =
    api.basicMemberRouter.findMatchCandidates.useQuery(
      { id: basicMemberId },
      { enabled: searchMode === "DEFAULT" && !isNaN(basicMemberId) },
    );
  const methods = useForm({
    values: createCustomCandidatesSearchFormValues(basicMember),
  });
  const [customSearchQueryParams, setCustomSearchQueryParams] = useState(
    formToValues(methods.getValues()),
  );

  useEffect(() => {
    if (searchMode === "DEFAULT") {
      return;
    }

    setCustomSearchQueryParams(formToValues(methods.getValues()));
  }, [methods, searchMode]);

  const { data: customMatchCandidates = [] } =
    api.basicMemberRouter.findCustomMatchCandidates.useQuery(
      {
        memberId: basicMemberId,
        conditions: customSearchQueryParams.conditions,
        nonNegotiableConditions:
          customSearchQueryParams.nonNegotiableConditions,
      },
      {
        enabled: searchMode === "CUSTOM" && basicMember != null,
      },
    );
  const { mutateAsync: createMatch, isPending: isCreatingMatch } =
    api.basicMatchRouter.create.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });
  const { mutateAsync: addToBlacklist, isPending: isAddingToBlacklist } =
    api.basicMemberRouter.addToBlacklist.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });
  const [shouldCrossCheck, setShouldCrossCheck] = useState(true);

  const list = useMemo(() => {
    if (!shouldCrossCheck) {
      return searchMode === "CUSTOM"
        ? customMatchCandidates
        : defaultMatchCandidates;
    }

    if (basicMember == null) {
      return [];
    }

    if (searchMode === "CUSTOM") {
      return customMatchCandidates.filter((member) => {
        return satisfiesNonNegotiableConditions({
          self: member,
          target: basicMember,
        });
      });
    }

    return defaultMatchCandidates.filter((member) => {
      return satisfiesNonNegotiableConditions({
        self: member,
        target: basicMember,
      });
    });
  }, [
    shouldCrossCheck,
    basicMember,
    searchMode,
    defaultMatchCandidates,
    customMatchCandidates,
  ]);

  return (
    <div className="mr-44 min-h-screen">
      <div className="flex w-full">
        <div className="flex flex-1 flex-col items-center gap-8">
          <h1 className="text-4xl font-semibold">
            {basicMember != null ? (
              <span
                className={`${
                  basicMember.gender === Gender.MALE
                    ? "text-blue-500"
                    : "text-pink-500"
                }`}
              >
                {basicMember.name}
              </span>
            ) : null}
            <span>{" 님 매칭"}</span>
          </h1>
          <div
            className="flex w-full justify-center gap-10"
            style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
          >
            <div className="flex w-5/12 max-w-3xl flex-col items-end gap-4">
              <h2 className="text-2xl font-semibold">본인</h2>
              <div className="flex w-full max-w-4xl flex-col gap-2">
                <Checkbox
                  label="커스텀 검색"
                  checked={searchMode === "CUSTOM"}
                  onChange={(e) => {
                    setSearchMode(e.target.checked ? "CUSTOM" : "DEFAULT");
                  }}
                />
                {searchMode === "CUSTOM" ? (
                  <FormProvider {...methods}>
                    <CustomSearchForm
                      onReset={() => {
                        methods.reset();
                      }}
                      onSubmit={(fields) => {
                        setCustomSearchQueryParams(formToValues(fields));
                      }}
                    />
                  </FormProvider>
                ) : null}
              </div>
              <div className="w-full border-b border-gray-200" />
              {basicMember == null ? null : (
                <BasicMemberCard member={basicMember} defaultMode="DETAILED" />
              )}
            </div>
            <div className="flex w-5/12 flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">{`상대방 (${list.length}명)`}</h2>
                <Checkbox
                  label="필수 조건 적용"
                  checked={shouldCrossCheck}
                  onChange={(e) => {
                    setShouldCrossCheck(e.target.checked);
                  }}
                />
              </div>
              <div className="flex h-[calc(100vh-200px)] w-full flex-col gap-4 overflow-y-auto pr-4">
                {list.map((member) => {
                  return (
                    <div key={member.id} className="flex w-full gap-4">
                      <BasicMemberCard
                        member={member as BasicMemberWithJoined}
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          className="rounded-lg bg-red-500 px-4 py-2 text-white"
                          disabled={isAddingToBlacklist}
                          onClick={async () => {
                            await addToBlacklist({
                              actionMemberId: basicMemberId,
                              targetMemberId: member.id,
                            });
                          }}
                        >
                          Blacklist
                        </button>
                        <button
                          className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                          disabled={isCreatingMatch}
                          onClick={async () => {
                            await createMatch({
                              member1Id: basicMemberId,
                              member2Id: member.id,
                            });
                          }}
                        >
                          Backlog
                        </button>
                        <button
                          className="rounded-lg bg-green-500 px-4 py-2 text-white"
                          disabled={isCreatingMatch}
                          onClick={async () => {
                            await createMatch({
                              member1Id: basicMemberId,
                              member2Id: member.id,
                              initialStatus: MatchStatus.PREPARING,
                            });
                          }}
                        >
                          Prepare
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="fixed right-4 w-44">
          <h2 className="text-xl font-semibold">※ 체크리스트</h2>
          <div>- 지역 확인</div>
          <div>- 필수 아니어도 나이 확인</div>
          <div>- 쌍방으로 체형 확인</div>
          <div>- 같은 직장 확인</div>
          <div>- 기피 직장/직무 확인</div>
          <div>- 양쪽 상세 내용 확인</div>
          <div>- 양쪽 메모 확인</div>
          <div>- 사진 확인</div>
        </div>
      </div>
    </div>
  );
}

interface CustomSearchFormProps {
  onReset: () => void;
  onSubmit: (fields: CustomCanditatesSearchForm) => void;
}

function CustomSearchForm({ onReset, onSubmit }: CustomSearchFormProps) {
  const { register, control, handleSubmit } =
    useFormContext<CustomCanditatesSearchForm>();
  const {
    fields: occupationStatusFields,
    append: appendOccupationStatus,
    remove: removeOccupationStatus,
  } = useFieldArray({
    control,
    name: "occupationStatuses",
  });
  const {
    fields: preferredMbtisFields,
    append: appendPreferredMbtis,
    remove: removePreferredMbtis,
  } = useFieldArray({
    control,
    name: "preferredMbtis",
  });
  const {
    fields: nonPreferredMbtisFields,
    append: appendNonPreferredMbtis,
    remove: removeNonPreferredMbtis,
  } = useFieldArray({
    control,
    name: "nonPreferredMbtis",
  });
  const {
    fields: preferredReligionFields,
    append: appendPreferredReligion,
    remove: removePreferredReligion,
  } = useFieldArray({
    control,
    name: "preferredReligions",
  });
  const {
    fields: nonPreferredReligionFields,
    append: appendNonPreferredReligion,
    remove: removeNonPreferredReligion,
  } = useFieldArray({
    control,
    name: "nonPreferredReligions",
  });
  const {
    fields: nonNegotiableConditionFields,
    append: appendNonNegotiableCondition,
    remove: removeNonNegotiableCondition,
  } = useFieldArray({
    control,
    name: "nonNegotiableConditions",
  });

  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex gap-2">
        <TextInput
          label="최소 나이 출생연도"
          {...register("minAgeBirthYear", {
            setValueAs: (value: string | null) => {
              if (isEmptyStringOrNil(value)) {
                return null;
              }

              const valueAsNumber = Number(value);

              return isNaN(valueAsNumber) ? null : valueAsNumber;
            },
          })}
        />
        <TextInput
          label="최대 나이 출생연도"
          {...register("maxAgeBirthYear", {
            setValueAs: (value: string | null) => {
              if (isEmptyStringOrNil(value)) {
                return null;
              }

              const valueAsNumber = Number(value);

              return isNaN(valueAsNumber) ? null : valueAsNumber;
            },
          })}
        />
      </div>
      <div className="flex gap-2">
        <TextInput
          label="최소 키"
          {...register("minHeight", {
            setValueAs: (value: string | null) => {
              if (isEmptyStringOrNil(value)) {
                return null;
              }

              const valueAsNumber = Number(value);

              return isNaN(valueAsNumber) ? null : valueAsNumber;
            },
          })}
        />
        <TextInput
          label="최대 키"
          {...register("maxHeight", {
            setValueAs: (value: string | null) => {
              if (isEmptyStringOrNil(value)) {
                return null;
              }

              const valueAsNumber = Number(value);

              return isNaN(valueAsNumber) ? null : valueAsNumber;
            },
          })}
        />
      </div>
      <Controller
        control={control}
        name="minEducationLevel"
        render={({ field: { onChange, value } }) => {
          return (
            <Select
              label="최소 학력"
              value={value ?? 상관없음}
              onChange={({ target: { value } }) => {
                onChange(value === 상관없음 ? null : value);
              }}
            >
              {[상관없음, ...Object.values(EducationLevel)].map(
                (educationLevelOption) => {
                  return (
                    <option
                      key={educationLevelOption}
                      value={educationLevelOption}
                    >
                      {educationLevelOption === 상관없음
                        ? 상관없음
                        : 학력_라벨[educationLevelOption as EducationLevel]}
                    </option>
                  );
                },
              )}
            </Select>
          );
        }}
      />
      <div>
        신분
        <div className="grid grid-cols-4 gap-2">
          {Object.values(OccupationStatus).map((occupationStatus) => {
            return (
              <Checkbox
                key={occupationStatus}
                label={신분_라벨[occupationStatus]}
                checked={occupationStatusFields.some((field) => {
                  return field.value === occupationStatus;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendOccupationStatus({ value: occupationStatus });
                  } else {
                    removeOccupationStatus(
                      occupationStatusFields.findIndex(
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
      <div>
        선호 MBTI
        <div className="grid grid-cols-4 gap-1">
          {Object.values(MBTI).map((mbti) => {
            return (
              <Checkbox
                key={mbti}
                label={mbti}
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
        비선호 MBTI
        <div className="grid grid-cols-4 gap-1">
          {Object.values(MBTI).map((mbti) => {
            return (
              <Checkbox
                key={mbti}
                label={mbti}
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
      <div className="flex gap-4">
        <div>
          흡연
          <Checkbox label="허용" {...register("isSmokerOk")} />
        </div>
        <div>
          문신
          <Checkbox label="허용" {...register("isTattooOk")} />
        </div>
      </div>
      <div>
        선호 종교
        <div className="grid grid-cols-5 gap-2">
          {Object.values(Religion).map((religion) => {
            return (
              <Checkbox
                key={religion}
                label={종교_라벨[religion]}
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
        <div className="grid grid-cols-5 gap-2">
          {Object.values(Religion).map((religion) => {
            return (
              <Checkbox
                key={religion}
                label={종교_라벨[religion]}
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
      <div className="flex gap-4">
        <Controller
          control={control}
          name="minAnnualIncome"
          render={({ field: { onChange, value } }) => {
            return (
              <Select
                label="최소 연간 벌이 수준"
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
                      <option
                        key={annualIncomeOption}
                        value={annualIncomeOption}
                      >
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
          name="minAssetsValue"
          render={({ field: { onChange, value } }) => {
            return (
              <Select
                label="최소 자산 수준"
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
      </div>
      <div className="flex gap-4">
        <Controller
          control={control}
          name="minBooksReadPerYear"
          render={({ field: { onChange, value } }) => {
            return (
              <Select
                label="최소 독서량"
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
        <Controller
          control={control}
          name="exercisePerWeek"
          render={({ field: { onChange, value } }) => {
            return (
              <Select
                label="운동량"
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
      </div>
      <div className="flex gap-4">
        <div>
          자차
          <Checkbox label="보유" {...register("shouldHaveCar")} />
        </div>
        <div>
          게임
          <Checkbox label="괜찮음" {...register("isGamingOk")} />
        </div>
        <div>
          반려동물
          <Checkbox label="괜찮음" {...register("isPetOk")} />
        </div>
      </div>
      <div>
        필수 조건
        <div className="grid grid-cols-5 gap-1">
          {Object.values(BasicCondition).map((condition) => {
            return (
              <Checkbox
                key={condition}
                label={베이직_조건_라벨[condition]}
                checked={nonNegotiableConditionFields.some((field) => {
                  return field.value === condition;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    appendNonNegotiableCondition({ value: condition });
                  } else {
                    removeNonNegotiableCondition(
                      nonNegotiableConditionFields.findIndex(
                        (field) => field.value === condition,
                      ),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex w-full gap-2">
        <button
          className="w-32 rounded-lg bg-gray-300 px-4 py-2"
          type="button"
          onClick={onReset}
        >
          초기화
        </button>
        <button
          className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white"
          type="submit"
        >
          후보 검색
        </button>
      </div>
    </form>
  );
}

const 상관없음 = "상관없음";

function satisfiesNonNegotiableConditions({
  self,
  target,
}: {
  self: BasicMember;
  target: BasicMember;
}) {
  const conditions = self.nonNegotiableConditions;

  for (const condition of conditions) {
    const satisfiesCondition = match(condition)
      .with("AGE", () => {
        return (
          (self.idealMinAgeBirthYear == null ||
            target.birthYear <= self.idealMinAgeBirthYear) &&
          (self.idealMaxAgeBirthYear == null ||
            target.birthYear >= self.idealMaxAgeBirthYear)
        );
      })
      .with("HEIGHT", () => {
        return (
          (self.idealMinHeight == null ||
            target.height >= self.idealMinHeight) &&
          (self.idealMaxHeight == null || target.height <= self.idealMaxHeight)
        );
      })
      .with("EDUCATION_LEVEL", () => {
        if (self.idealEducationLevel == null) {
          return true;
        }

        return orderedEducationLevels
          .slice(orderedEducationLevels.indexOf(self.idealEducationLevel))
          .includes(target.educationLevel);
      })
      .with("OCCUPATION_STATUS", () => {
        return self.idealOccupationStatuses.includes(target.occupationStatus);
      })
      .with("PREFERRED_MBTIS", () => {
        if (target.mbti == null) {
          return true;
        }

        return self.idealPreferredMbtis.includes(target.mbti);
      })
      .with("NON_PREFERRED_MBTIS", () => {
        if (target.mbti == null) {
          return true;
        }

        return !self.idealNonPreferredMbtis.includes(target.mbti);
      })
      .with("IS_SMOKER_OK", () => {
        if (self.idealIsSmokerOk) {
          return true;
        }

        return !target.isSmoker;
      })
      .with("PREFERRED_RELIGIONS", () => {
        return self.idealPreferredReligions.includes(target.religion);
      })
      .with("NON_PREFERRED_RELIGIONS", () => {
        return !self.idealNonPreferredReligions.includes(target.religion);
      })
      .with("MIN_ANNUAL_INCOME", () => {
        if (self.idealMinAnnualIncome == null) {
          return true;
        }

        if (target.annualIncome == null) {
          return false;
        }

        return orderedAnnualIncomes
          .slice(orderedAnnualIncomes.indexOf(self.idealMinAnnualIncome))
          .includes(target.annualIncome);
      })
      .with("MIN_ASSETS_VALUE", () => {
        if (self.idealMinAssetsValue == null) {
          return true;
        }

        if (target.assetsValue == null) {
          return false;
        }

        return orderedAssetsValues
          .slice(orderedAssetsValues.indexOf(self.idealMinAssetsValue))
          .includes(target.assetsValue);
      })
      .with("BOOKS_READ_PER_YEAR", () => {
        if (self.idealBooksReadPerYear == null) {
          return true;
        }

        return orderedBooksReadPerYears
          .slice(orderedBooksReadPerYears.indexOf(self.idealBooksReadPerYear))
          .includes(target.booksReadPerYear);
      })
      .with("IS_TATTOO_OK", () => {
        if (self.idealIsTattooOk) {
          return true;
        }

        return !target.hasTattoo;
      })
      .with("EXERCISE_PER_WEEK", () => {
        if (self.idealExercisePerWeek == null) {
          return true;
        }

        return orderedExercisePerWeeks
          .slice(orderedExercisePerWeeks.indexOf(self.idealExercisePerWeek))
          .includes(target.exercisePerWeek);
      })
      .with("SHOULD_HAVE_CAR", () => {
        if (!self.idealShouldHaveCar) {
          return true;
        }

        return target.hasCar;
      })
      .with("IS_GAMING_OK", () => {
        if (self.idealIsGamingOk) {
          return true;
        }

        return !target.doesGame;
      })
      .with("IS_PET_OK", () => {
        if (self.idealIsPetOk) {
          return true;
        }

        return !target.hasPet;
      })
      .otherwise(() => true);

    if (!satisfiesCondition) {
      return false;
    }
  }

  return true;
}

function createCustomCandidatesSearchFormValues(
  member: BasicMember | undefined,
): CustomCanditatesSearchForm {
  if (member == null) {
    return {
      minAgeBirthYear: null,
      maxAgeBirthYear: null,
      minHeight: null,
      maxHeight: null,
      minEducationLevel: null,
      occupationStatuses: [],
      preferredMbtis: [],
      nonPreferredMbtis: [],
      isSmokerOk: false,
      preferredReligions: [],
      nonPreferredReligions: [],
      minAnnualIncome: null,
      minAssetsValue: null,
      minBooksReadPerYear: null,
      isTattooOk: false,
      exercisePerWeek: null,
      shouldHaveCar: false,
      isGamingOk: true,
      isPetOk: true,
      nonNegotiableConditions: [],
    };
  }

  return {
    minAgeBirthYear: member.idealMinAgeBirthYear,
    maxAgeBirthYear: member.idealMaxAgeBirthYear,
    minHeight: member.idealMinHeight,
    maxHeight: member.idealMaxHeight,
    minEducationLevel: member.idealEducationLevel,
    occupationStatuses: member.idealOccupationStatuses.map((value) => {
      return { value };
    }),
    preferredMbtis: member.idealPreferredMbtis.map((value) => {
      return { value };
    }),
    nonPreferredMbtis: member.idealNonPreferredMbtis.map((value) => {
      return { value };
    }),
    isSmokerOk: member.idealIsSmokerOk,
    preferredReligions: member.idealPreferredReligions.map((value) => {
      return { value };
    }),
    nonPreferredReligions: member.idealNonPreferredReligions.map((value) => {
      return { value };
    }),
    minAnnualIncome: member.idealMinAnnualIncome,
    minAssetsValue: member.idealMinAssetsValue,
    minBooksReadPerYear: member.idealBooksReadPerYear,
    isTattooOk: member.idealIsTattooOk,
    exercisePerWeek: member.idealExercisePerWeek,
    shouldHaveCar: member.idealShouldHaveCar,
    isGamingOk: member.idealIsGamingOk,
    isPetOk: member.idealIsPetOk,
    nonNegotiableConditions: member.nonNegotiableConditions.map((value) => {
      return { value };
    }),
  };
}

function formToValues(form: CustomCanditatesSearchForm) {
  return {
    conditions: {
      minAgeBirthYear: form.minAgeBirthYear,
      maxAgeBirthYear: form.maxAgeBirthYear,
      minHeight: form.minHeight,
      maxHeight: form.maxHeight,
      minEducationLevel: form.minEducationLevel,
      occupationStatuses: form.occupationStatuses.map(({ value }) => value),
      preferredMbtis: form.preferredMbtis.map(({ value }) => value),
      nonPreferredMbtis: form.nonPreferredMbtis.map(({ value }) => value),
      isSmokerOk: form.isSmokerOk,
      preferredReligions: form.preferredReligions.map(({ value }) => value),
      nonPreferredReligions: form.nonPreferredReligions.map(
        ({ value }) => value,
      ),
      minAnnualIncome: form.minAnnualIncome,
      minAssetsValue: form.minAssetsValue,
      minBooksReadPerYear: form.minBooksReadPerYear,
      isTattooOk: form.isTattooOk,
      exercisePerWeek: form.exercisePerWeek,
      shouldHaveCar: form.shouldHaveCar,
      isGamingOk: form.isGamingOk,
      isPetOk: form.isPetOk,
    },
    nonNegotiableConditions: form.nonNegotiableConditions.map(
      ({ value }) => value,
    ),
  };
}

BasicMemberMatchmakerPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
