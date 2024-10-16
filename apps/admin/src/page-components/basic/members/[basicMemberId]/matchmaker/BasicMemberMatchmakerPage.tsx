import { Suspense, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  독서량_라벨,
  매치_유형,
  베이직_조건_라벨,
  신분_라벨,
  연간_벌이_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  지역_라벨,
  학력_라벨,
} from "@ieum/constants";
import {
  AnnualIncome,
  AssetsValue,
  BasicCondition,
  BasicMemberIdealTypeV2,
  BooksReadPerYear,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MatchStatus,
  MBTI,
  OccupationStatus,
  RegionV2,
  Religion,
  satisfiesDealBreakers,
} from "@ieum/prisma";
import { assert, isEmptyStringOrNil } from "@ieum/utils";
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
import type { BasicMemberWithBasicMatchesJoined } from "~/domains/basic/types";
import { api } from "~/utils/api";
import { CreateBasicMatchButton } from "./components/CreateBasicMatchButton";
import { CreateMegaphoneButton } from "./components/CreateMegaphoneButton";

interface CustomCanditatesSearchForm {
  regionsV2: { value: RegionV2 }[];
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
  shouldHaveCar: boolean | null;
  isGamingOk: boolean | null;
  isPetOk: boolean | null;
  dealBreakers: { value: BasicCondition }[];
  highPriorities: { value: BasicCondition }[];
  mediumPriorities: { value: BasicCondition }[];
  lowPriorities: { value: BasicCondition }[];
}

export function BasicMemberMatchmakerPage() {
  return (
    <Suspense fallback={null}>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const utils = api.useUtils();
  const router = useRouter();
  const basicMemberId = router.query.basicMemberId as string;
  const matchType = router.query.matchType as 매치_유형;
  const [basicMember] = api.basicMemberRouter.findById.useSuspenseQuery({
    id: basicMemberId,
  });

  assert(!(matchType === 매치_유형.확성기 && !basicMember.isMegaphoneUser));
  assert(basicMember.idealType != null, "idealType is required");

  const methods = useForm({
    values: createCustomCandidatesSearchFormValues(basicMember.idealType),
  });
  const [customSearchQueryParams, setCustomSearchQueryParams] = useState(
    formToValues(methods.getValues()),
  );

  const { data: matchCandidates = [] } =
    api.basicMemberRouter.findCustomMatchCandidates.useQuery({
      memberId: basicMemberId,
      data: customSearchQueryParams,
      matchType,
    });

  const { mutateAsync: addToBlacklist, isPending: isAddingToBlacklist } =
    api.basicMemberRouter.addToBlacklist.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });
  const [shouldCrossCheck, setShouldCrossCheck] = useState(
    match(matchType)
      .with(매치_유형.기본, () => {
        return true;
      })
      .with(매치_유형.확성기, () => {
        return false;
      })
      .exhaustive(),
  );

  const list = useMemo(() => {
    if (!shouldCrossCheck) {
      return matchCandidates;
    }

    return matchCandidates.filter((member) => {
      assert(member.idealType != null, "idealType is required");

      return satisfiesDealBreakers({
        selfIdealType: member.idealType,
        target: basicMember,
      });
    });
  }, [shouldCrossCheck, basicMember, matchCandidates]);

  return (
    <div className="min-h-screen">
      <div className="flex w-full justify-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-lg font-semibold">
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
            <span>{` 님 ${match(matchType)
              .with(매치_유형.기본, () => {
                return "기본";
              })
              .with(매치_유형.확성기, () => {
                return "확성기";
              })
              .exhaustive()} 매칭`}</span>
          </h1>
          <div className="flex w-full justify-center gap-2">
            <div className="flex w-1/2 max-w-3xl flex-col items-end gap-1">
              <h2 className="text-lg font-semibold">본인</h2>
              <BasicMemberCard member={basicMember} defaultMode="DETAILED" />
            </div>
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
            <div className="flex w-1/2 max-w-3xl flex-col items-start gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{`상대방 (${list.length}명)`}</h2>
                <Checkbox
                  label="필수 조건 적용"
                  checked={shouldCrossCheck}
                  onChange={(e) => {
                    setShouldCrossCheck(e.target.checked);
                  }}
                />
              </div>
              <div className="flex h-[calc(100vh-92px)] w-full flex-col gap-2 overflow-y-auto pr-1.5">
                {list.map((member) => {
                  return (
                    <div key={member.id} className="flex w-full gap-1">
                      <BasicMemberCard
                        member={member as BasicMemberWithBasicMatchesJoined}
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          className="rounded-lg bg-red-500 p-2 text-sm font-medium text-white"
                          disabled={isAddingToBlacklist}
                          onClick={async () => {
                            await addToBlacklist({
                              actionMemberId: basicMemberId,
                              targetMemberId: member.id,
                            });
                          }}
                        >
                          블랙
                        </button>
                        {matchType === 매치_유형.확성기 ? (
                          <CreateMegaphoneButton
                            payload={{
                              senderId: basicMemberId,
                              receiverId: member.id,
                              targetStatus: MatchStatus.BACKLOG,
                            }}
                          />
                        ) : (
                          <CreateBasicMatchButton
                            payload={{
                              member1Id: basicMemberId,
                              member2Id: member.id,
                              targetStatus: MatchStatus.BACKLOG,
                            }}
                          />
                        )}
                        {matchType === 매치_유형.확성기 ? (
                          <CreateMegaphoneButton
                            payload={{
                              senderId: basicMemberId,
                              receiverId: member.id,
                              targetStatus: MatchStatus.PREPARING,
                            }}
                          />
                        ) : (
                          <CreateBasicMatchButton
                            payload={{
                              member1Id: basicMemberId,
                              member2Id: member.id,
                              targetStatus: MatchStatus.PREPARING,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
    fields: regionFields,
    append: appendRegion,
    remove: removeRegion,
  } = useFieldArray({
    control,
    name: "regionsV2",
  });
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
    fields: dealBreakerFields,
    append: appendDealBreaker,
    remove: removeDealBreaker,
  } = useFieldArray({
    control,
    name: "dealBreakers",
  });
  const {
    fields: highPriorityFields,
    append: appendHighPriority,
    remove: removeHighPriority,
  } = useFieldArray({
    control,
    name: "highPriorities",
  });
  const {
    fields: mediumPriorityFields,
    append: appendMediumPriority,
    remove: removeMediumPriority,
  } = useFieldArray({
    control,
    name: "mediumPriorities",
  });
  const {
    fields: lowPriorityFields,
    append: appendLowPriority,
    remove: removeLowPriority,
  } = useFieldArray({
    control,
    name: "lowPriorities",
  });
  const [noPriorities, setNoPriorities] = useState(
    Object.values(BasicCondition).filter((condition) => {
      return (
        !dealBreakerFields.some((field) => field.value === condition) &&
        !highPriorityFields.some((field) => field.value === condition) &&
        !mediumPriorityFields.some((field) => field.value === condition) &&
        !lowPriorityFields.some((field) => field.value === condition)
      );
    }),
  );

  function setAsDealBreaker(condition: BasicCondition) {
    const highPriorityIndex = highPriorityFields.findIndex((field) => {
      return field.value === condition;
    });
    if (highPriorityIndex > -1) {
      removeHighPriority(highPriorityIndex);
    }

    const mediumPriorityIndex = mediumPriorityFields.findIndex((field) => {
      return field.value === condition;
    });
    if (mediumPriorityIndex > -1) {
      removeMediumPriority(mediumPriorityIndex);
    }

    const lowPriorityIndex = lowPriorityFields.findIndex((field) => {
      return field.value === condition;
    });
    if (lowPriorityIndex > -1) {
      removeLowPriority(lowPriorityIndex);
    }

    const noPriorityIndex = noPriorities.findIndex((c) => c === condition);
    if (noPriorityIndex > -1) {
      setNoPriorities((prev) => {
        return prev.filter((c) => c !== condition);
      });
    }

    const isDealBreaker = dealBreakerFields.some((field) => {
      return field.value === condition;
    });

    if (!isDealBreaker) {
      appendDealBreaker({ value: condition });
    }
  }

  function appendToContainer(condition: BasicCondition, containerId: 우선순위) {
    switch (containerId) {
      case 우선순위.필수:
        appendDealBreaker({ value: condition });
        break;
      case 우선순위.높음:
        appendHighPriority({ value: condition });
        break;
      case 우선순위.중간:
        appendMediumPriority({ value: condition });
        break;
      case 우선순위.낮음:
        appendLowPriority({ value: condition });
        break;
      case 우선순위.미지정:
        setNoPriorities((prev) => [...prev, condition]);
        break;
      default:
        throw new Error("Invalid containerId");
    }
  }

  function removeFromContainer(
    condition: BasicCondition,
    containerId: 우선순위,
  ) {
    switch (containerId) {
      case 우선순위.필수:
        removeDealBreaker(
          dealBreakerFields.findIndex((field) => field.value === condition),
        );
        break;
      case 우선순위.높음:
        removeHighPriority(
          highPriorityFields.findIndex((field) => field.value === condition),
        );
        break;
      case 우선순위.중간:
        removeMediumPriority(
          mediumPriorityFields.findIndex((field) => field.value === condition),
        );
        break;
      case 우선순위.낮음:
        removeLowPriority(
          lowPriorityFields.findIndex((field) => field.value === condition),
        );
        break;
      case 우선순위.미지정:
        setNoPriorities((prev) => prev.filter((c) => c !== condition));
        break;
      default:
        throw new Error("Invalid containerId");
    }
  }
  const [hide, setHide] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <span>우선순위</span>
        <div className="flex gap-2">
          <Checkbox
            label="숨김"
            checked={hide}
            onChange={({ target: { checked } }) => {
              setHide(checked);
            }}
          />
          <button
            type="button"
            className="rounded bg-gray-300 px-2 py-1 text-sm"
            onClick={() => {
              setAsDealBreaker(BasicCondition.AGE);
              setAsDealBreaker(BasicCondition.REGION);
            }}
          >
            나지
          </button>
          <button
            type="button"
            className="rounded bg-gray-300 px-2 py-1 text-sm"
            onClick={() => {
              setAsDealBreaker(BasicCondition.AGE);
              setAsDealBreaker(BasicCondition.REGION);
              setAsDealBreaker(BasicCondition.EDUCATION_LEVEL);
              setAsDealBreaker(BasicCondition.IS_SMOKER_OK);
              setAsDealBreaker(BasicCondition.IS_TATTOO_OK);
            }}
          >
            나지학흡문
          </button>
        </div>
      </div>
      <form
        className={`flex flex-col gap-1 text-xs ${hide ? "hidden" : ""}`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <DndContext
            onDragOver={({ active, over }) => {
              if (over == null) {
                return;
              }

              const activeContainerId: 우선순위 =
                active.data.current?.sortable.containerId;
              const overContainerId: 우선순위 =
                over.data.current?.sortable.containerId ?? over.id;

              removeFromContainer(
                active.id as BasicCondition,
                activeContainerId,
              );
              appendToContainer(active.id as BasicCondition, overContainerId);
            }}
          >
            <div className="flex flex-col gap-1">
              {[
                {
                  id: 우선순위.필수,
                  label: "필수",
                  conditions: dealBreakerFields.map((field) => field.value),
                },
                {
                  id: 우선순위.높음,
                  label: "높음",
                  conditions: highPriorityFields.map((field) => field.value),
                },
                {
                  id: 우선순위.중간,
                  label: "중",
                  conditions: mediumPriorityFields.map((field) => field.value),
                },
                {
                  id: 우선순위.낮음,
                  label: "하",
                  conditions: lowPriorityFields.map((field) => field.value),
                },
                {
                  id: 우선순위.미지정,
                  label: "미지정",
                  conditions: noPriorities,
                },
              ].map((section) => {
                return (
                  <PrioritySection
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    conditions={section.conditions}
                  />
                );
              })}
            </div>
          </DndContext>
        </div>
        <div className="my-1 flex w-full gap-1">
          <button
            className="w-12 rounded-lg bg-gray-300 py-1.5"
            type="button"
            onClick={onReset}
          >
            초기화
          </button>
          <button
            className="flex-1 rounded-lg bg-blue-500 py-1.5 text-white"
            type="submit"
          >
            후보 검색
          </button>
        </div>
        <div>
          지역
          <div className="grid grid-cols-2 gap-1">
            {Object.values(RegionV2)
              .filter((region) => {
                return Object.values(쿼리_가능한_지역).includes(
                  region as 쿼리_가능한_지역,
                );
              })
              .map((region) => {
                return (
                  <Checkbox
                    key={region}
                    label={지역_라벨[region]}
                    checked={regionFields.some((field) => {
                      return field.value === region;
                    })}
                    onChange={(e) => {
                      if (e.target.checked) {
                        appendRegion({ value: region });
                      } else {
                        removeRegion(
                          regionFields.findIndex(
                            (field) => field.value === region,
                          ),
                        );
                      }
                    }}
                  />
                );
              })}
          </div>
        </div>
        <div className="flex gap-1">
          <TextInput
            label="최소 나이 출생연도"
            style={{ width: "100px" }}
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
            style={{ width: "100px" }}
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
        <div className="flex gap-1">
          <TextInput
            label="최소 키"
            style={{ width: "100px" }}
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
            style={{ width: "100px" }}
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
                style={{ width: "100px" }}
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
          <div className="grid grid-cols-2 gap-1">
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
          <div className="grid grid-cols-2 gap-1">
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
          <div className="grid grid-cols-2 gap-1">
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
                            : 연간_벌이_라벨[
                                annualIncomeOption as AnnualIncome
                              ]}
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
                        <option
                          key={assetsValueOption}
                          value={assetsValueOption}
                        >
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
      </form>
    </div>
  );
}

const 우선순위 = {
  필수: "DEAL_BREAKER",
  높음: "HIGH",
  중간: "MEDIUM",
  낮음: "LOW",
  미지정: "NONE",
} as const;

type 우선순위 = (typeof 우선순위)[keyof typeof 우선순위];

function PrioritySection({
  id,
  label,
  conditions,
}: {
  id: 우선순위;
  label: string;
  conditions: BasicCondition[];
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`${id === "DEAL_BREAKER" ? "text-red-500" : ""}`}>
        {label}
      </span>
      <DroppablePriorityContainer id={id} conditions={conditions} />
    </div>
  );
}

function DroppablePriorityContainer({
  id,
  conditions,
}: {
  id: 우선순위;
  conditions: BasicCondition[];
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext id={id} items={conditions}>
      {conditions.length > 0 ? (
        <div className="grid grid-cols-2 gap-0.5" ref={setNodeRef}>
          {conditions.map((condition) => {
            return <SortableItem key={condition} condition={condition} />;
          })}
        </div>
      ) : (
        <Empty id={id} />
      )}
    </SortableContext>
  );
}

function SortableItem({ condition }: { condition: BasicCondition }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: condition });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="cursor-grab rounded border border-gray-300 px-1.5 py-1"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      {베이직_조건_라벨[condition]}
    </div>
  );
}

function Empty({ id }: { id: 우선순위 }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `${id}-EMPTY`, disabled: true });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="flex flex-row items-center justify-center rounded-md border border-dashed border-gray-400 px-2 py-1"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <p className="text-gray-500">조건을 끌어 놓으세요</p>
    </div>
  );
}

const 상관없음 = "상관없음";

function createCustomCandidatesSearchFormValues(
  idealType: BasicMemberIdealTypeV2,
): CustomCanditatesSearchForm {
  const {
    regionsV2,
    minAgeBirthYear,
    maxAgeBirthYear,
    minHeight,
    maxHeight,
    educationLevel,
    occupationStatuses,
    preferredMbtis,
    nonPreferredMbtis,
    isSmokerOk,
    preferredReligions,
    nonPreferredReligions,
    minAnnualIncome,
    minAssetsValue,
    booksReadPerYear,
    isTattooOk,
    exercisePerWeek,
    shouldHaveCar,
    isGamingOk,
    isPetOk,
    dealBreakers,
    highPriorities,
    mediumPriorities,
    lowPriorities,
  } = idealType;

  return {
    regionsV2: regionsV2.map((value) => {
      return { value };
    }),
    minAgeBirthYear,
    maxAgeBirthYear,
    minHeight,
    maxHeight,
    minEducationLevel: educationLevel,
    occupationStatuses: occupationStatuses.map((value) => {
      return { value };
    }),
    preferredMbtis: preferredMbtis.map((value) => {
      return { value };
    }),
    nonPreferredMbtis: nonPreferredMbtis.map((value) => {
      return { value };
    }),
    isSmokerOk,
    preferredReligions: preferredReligions.map((value) => {
      return { value };
    }),
    nonPreferredReligions: nonPreferredReligions.map((value) => {
      return { value };
    }),
    minAnnualIncome,
    minAssetsValue,
    minBooksReadPerYear: booksReadPerYear,
    isTattooOk,
    exercisePerWeek,
    shouldHaveCar,
    isGamingOk,
    isPetOk,
    dealBreakers: dealBreakers.map((value) => {
      return { value };
    }),
    highPriorities: highPriorities.map((value) => {
      return { value };
    }),
    mediumPriorities: mediumPriorities.map((value) => {
      return { value };
    }),
    lowPriorities: lowPriorities.map((value) => {
      return { value };
    }),
  };
}

function formToValues(form: CustomCanditatesSearchForm) {
  return {
    regionsV2: form.regionsV2.map(({ value }) => value),
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
    nonPreferredReligions: form.nonPreferredReligions.map(({ value }) => value),
    minAnnualIncome: form.minAnnualIncome,
    minAssetsValue: form.minAssetsValue,
    minBooksReadPerYear: form.minBooksReadPerYear,
    isTattooOk: form.isTattooOk,
    exercisePerWeek: form.exercisePerWeek,
    shouldHaveCar: form.shouldHaveCar,
    isGamingOk: form.isGamingOk,
    isPetOk: form.isPetOk,
    dealBreakers: form.dealBreakers.map(({ value }) => value),
    highPriorities: form.highPriorities.map(({ value }) => value),
    mediumPriorities: form.mediumPriorities.map(({ value }) => value),
    lowPriorities: form.lowPriorities.map(({ value }) => value),
  };
}

const 쿼리_가능한_지역 = {
  서울: RegionV2.SEOUL,
  인천부천: RegionV2.INCHEON_BUCHEON,
  경기남부: RegionV2.SOUTH_GYEONGGI,
  경기북부: RegionV2.NORTH_GYEONGGI,
  충청: RegionV2.CHUNGCHEONG,
} as const;

type 쿼리_가능한_지역 =
  (typeof 쿼리_가능한_지역)[keyof typeof 쿼리_가능한_지역];

BasicMemberMatchmakerPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
