import {
  ComponentPropsWithRef,
  forwardRef,
  ReactElement,
  Suspense,
  useEffect,
  useState,
} from "react";
import Head from "next/head";
import {
  closestCorners,
  DndContext,
  DraggableAttributes,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  신분_라벨,
  쌍꺼풀_라벨,
  음주량_라벨,
  주간_운동량_라벨,
  지역_라벨,
  체형_라벨,
  최소_독서량_라벨,
  최소_연간_벌이_라벨,
  최소_자산_라벨,
  최소_학력_라벨,
} from "@ieum/constants";
import {
  BasicCondition,
  BasicMemberIdealTypeV2,
  DrinkingFrequency,
  Religion,
} from "@ieum/prisma";
import { assert } from "@ieum/utils";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { keepPreviousData } from "@tanstack/react-query";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";

const unusedBasicConditions = new Set<BasicCondition>([
  BasicCondition.EYELID,
  BasicCondition.SHOULD_HAVE_CAR,
  BasicCondition.IS_GAMING_OK,
  BasicCondition.IS_PET_OK,
  BasicCondition.MIN_ASSETS_VALUE,
  BasicCondition.BOOKS_READ_PER_YEAR,
  BasicCondition.OCCUPATION_STATUS,
  BasicCondition.EXERCISE_PER_WEEK,
  BasicCondition.IS_GAMING_OK,
  BasicCondition.IS_PET_OK,
  BasicCondition.SHOULD_HAVE_CAR,
]);

export function MyIdealTypePage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <Suspense fallback={null}>
        <Resolved />
      </Suspense>
    </>
  );
}

const 기본_필수_조건들 = new Set<BasicCondition>([
  BasicCondition.NON_PREFERRED_WORKPLACE_SCHOOL,
]);

type Mode = "READ" | "EDIT";

const 우선순위 = {
  필수: "DEAL_BREAKER",
  높음: "HIGH",
  중간: "MEDIUM",
  낮음: "LOW",
  미지정: "NONE",
} as const;

type 우선순위 = (typeof 우선순위)[keyof typeof 우선순위];

const 매칭지수_라벨 = {
  HIGH: "상",
  MID_HIGH: "중상",
  MID: "중",
  MID_LOW: "중하",
  LOW: "하",
} as const;

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "member should be defined");

  const [idealType] =
    api.basicMemberIdealTypeRouter.getIdealTypeById.useSuspenseQuery({
      id: member.id,
    });
  const [dealBreakers, setDealBreakers] = useState(idealType.dealBreakers);
  const [highPriorities, setHighPriorities] = useState(
    idealType.highPriorities,
  );
  const [mediumPriorities, setMediumPriorities] = useState(
    idealType.mediumPriorities,
  );
  const [lowPriorities, setLowPriorities] = useState(idealType.lowPriorities);
  const [noPriorities, setNoPriorities] = useState(
    Object.values(BasicCondition)
      .filter((condition) => {
        return !unusedBasicConditions.has(condition);
      })
      .filter((condition) => {
        return (
          !dealBreakers.includes(condition) &&
          !highPriorities.includes(condition) &&
          !mediumPriorities.includes(condition) &&
          !lowPriorities.includes(condition)
        );
      }),
  );
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const [mode, setMode] = useState<Mode>("READ");
  const utils = api.useUtils();
  const { mutateAsync: updatePriorities } =
    api.basicMemberIdealTypeRouter.updatePriorities.useMutation({
      onSuccess: () => {
        return Promise.all([
          utils.basicMemberIdealTypeRouter.invalidate(),
          utils.basicMatchIndexRouter.invalidate(),
        ]);
      },
    });
  const [activeId, setActiveId] = useState<BasicCondition | null>(null);
  const [dragStartContainerId, setDragStartContainerId] =
    useState<우선순위 | null>(null);
  const setterByContainerId = {
    [우선순위.필수]: setDealBreakers,
    [우선순위.높음]: setHighPriorities,
    [우선순위.중간]: setMediumPriorities,
    [우선순위.낮음]: setLowPriorities,
    [우선순위.미지정]: setNoPriorities,
  } as const;
  const sections = [
    {
      label: "우선순위 - 높음",
      containerId: 우선순위.높음,
      conditions: highPriorities,
    },
    {
      label: "우선순위 - 중간",
      containerId: 우선순위.중간,
      conditions: mediumPriorities,
    },
    {
      label: "우선순위 - 낮음",
      containerId: 우선순위.낮음,
      conditions: lowPriorities,
    },
    {
      label: "미지정",
      containerId: 우선순위.미지정,
      conditions: noPriorities,
    },
  ];
  const { sendMessage } = useSlackNotibot();
  const { data: 매칭지수 } = api.basicMatchIndexRouter.getMatchIndex.useQuery(
    {
      memberId: member.id,
      customIdealType: {
        ...idealType,
        dealBreakers,
      },
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  useEffect(() => {
    void sendMessage(
      `${formatUniqueMemberName(member)} - 내 이상형 조건 페이지 진입`,
    );
  }, []);

  const handleDragEnd = ({ active, over }: DragOverEvent) => {
    const overContainerId: 우선순위 =
      over?.data.current?.sortable.containerId ?? over?.id;

    const overSetter = setterByContainerId[overContainerId];

    const 필수조건_초과인가 = dealBreakers.length > 5;
    const 필수조건_불가항목인가 = dealBreakerForbiddenConditions.includes(
      active.id as BasicCondition,
    );

    if (
      overContainerId === 우선순위.필수 &&
      (필수조건_초과인가 || 필수조건_불가항목인가)
    ) {
      if (필수조건_불가항목인가) {
        alert("선택 항목은 '포기 못하는 조건'으로 설정할 수 없습니다.");
      }

      overSetter((prev) => {
        return prev.filter((condition) => {
          return condition !== active.id;
        });
      });
      const dragStartContainerSetter =
        setterByContainerId[dragStartContainerId!];
      dragStartContainerSetter((prev) => {
        return [active.id as BasicCondition, ...prev];
      });

      setActiveId(null);
      setDragStartContainerId(null);

      return;
    }

    setActiveId(null);
    setDragStartContainerId(null);

    if (over == null || active.id === over.id) {
      return;
    }

    overSetter((prev) => {
      const oldIndex = prev.indexOf(active.id as BasicCondition);
      const newIndex = prev.indexOf(over.id as BasicCondition);

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      onDragStart={({ active }) => {
        setActiveId(active.id as BasicCondition);
        setDragStartContainerId(
          active.data.current?.sortable.containerId as 우선순위,
        );
      }}
      onDragCancel={handleDragEnd}
      onDragOver={({ active, over }) => {
        if (over == null) {
          return;
        }

        const activeContainerId: 우선순위 =
          active.data.current?.sortable.containerId;
        const overContainerId: 우선순위 =
          over.data.current?.sortable.containerId ?? over.id;

        const activeSetter = setterByContainerId[activeContainerId];
        const overSetter = setterByContainerId[overContainerId];

        activeSetter((prev) => {
          return prev.filter((condition) => {
            return condition !== active.id;
          });
        });
        overSetter((prev) => {
          return [...prev, active.id as BasicCondition];
        });
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            ※ 조건 내용 변경은 호스트에게 요청해 주세요.
          </p>
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              조건 우선순위
            </h2>
            {mode === "READ" ? (
              <EditButton onClick={() => setMode("EDIT")} />
            ) : (
              <DoneButton
                onClick={async () => {
                  if (dealBreakers.length > 5) {
                    alert(
                      "'포기 못하는 조건'은 최대 5개까지 선택할 수 있습니다.",
                    );

                    return;
                  }

                  await updatePriorities({
                    memberId: member.id,
                    priorities: {
                      dealBreakers,
                      highPriorities,
                      mediumPriorities,
                      lowPriorities,
                    },
                  });

                  setMode("READ");
                }}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-t border-gray-600" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-gray-700">{`매칭 지수: ${
                매칭지수 == null ? "-" : 매칭지수_라벨[매칭지수]
              }`}</span>
              <h3 className="font-semibold text-gray-800">
                절대 포기 못하는 조건 (최대 5개)
              </h3>
            </div>
            <DroppableContainer
              id={우선순위.필수}
              conditions={dealBreakers}
              idealType={idealType}
              mode={mode}
            />
          </div>
        </div>
        {sections.map((section) => {
          return (
            <div key={section.containerId} className="flex flex-col gap-4">
              <div className="border-t border-gray-600" />
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-gray-800">{section.label}</h3>
                <DroppableContainer
                  id={section.containerId}
                  conditions={section.conditions}
                  idealType={idealType}
                  mode={mode}
                />
              </div>
            </div>
          );
        })}
        <DragOverlay>
          {activeId != null ? (
            <DataField
              condition={activeId}
              idealType={idealType}
              dragEnabled={true}
              highlight={dealBreakers.includes(activeId)}
              style={{ opacity: 0.5 }}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  const { member } = useMemberAuthContext();
  const { sendMessage } = useSlackNotibot();

  return (
    <button
      className="rounded-md border border-gray-300 bg-gray-100 px-5 py-1 text-gray-800"
      onClick={() => {
        assert(member != null, "member should be defined");

        void sendMessage(
          `${formatUniqueMemberName(member)} - 내 이상형 조건 - 수정 클릭`,
        );
        onClick();
      }}
    >
      수정
    </button>
  );
}

function DoneButton({ onClick }: { onClick: () => void }) {
  const { member } = useMemberAuthContext();
  const { sendMessage } = useSlackNotibot();

  return (
    <button
      className="rounded-md border border-primary-700 bg-primary-500 px-5 py-1 text-white"
      onClick={() => {
        assert(member != null, "member should be defined");

        void sendMessage(
          `${formatUniqueMemberName(member)} - 내 이상형 조건 - 완료 클릭`,
        );
        onClick();
      }}
    >
      완료
    </button>
  );
}

function DroppableContainer({
  id,
  conditions,
  idealType,
  mode,
}: {
  id: 우선순위;
  conditions: BasicCondition[];
  idealType: BasicMemberIdealTypeV2;
  mode: Mode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext
      id={id}
      items={conditions}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex flex-col gap-2" ref={setNodeRef}>
        {conditions.length > 0 ? (
          conditions
            .filter((condition) => {
              return !unusedBasicConditions.has(condition);
            })
            .map((condition) => {
              return (
                <SortableDataField
                  key={condition}
                  condition={condition}
                  idealType={idealType}
                  dragEnabled={mode === "EDIT"}
                  highlight={id === 우선순위.필수}
                />
              );
            })
        ) : (
          <EmptyField />
        )}
      </div>
    </SortableContext>
  );
}

function EmptyField() {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: "EMPTY", disabled: true });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="flex flex-row items-center justify-center rounded-md border border-dashed border-gray-400 px-4 py-2"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <p className="text-gray-500">조건을 끌어 놓으세요</p>
    </div>
  );
}

const dealBreakerForbiddenConditions: BasicCondition[] = [
  BasicCondition.MIN_ANNUAL_INCOME,
  BasicCondition.MIN_ASSETS_VALUE,
];

function SortableDataField(props: DataFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.condition, disabled: !props.dragEnabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <DataField
      ref={setNodeRef}
      style={style}
      listeners={listeners}
      attributes={attributes}
      {...props}
    />
  );
}

interface DataFieldProps extends ComponentPropsWithRef<"div"> {
  condition: BasicCondition;
  idealType: BasicMemberIdealTypeV2;
  dragEnabled: boolean;
  highlight: boolean;
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

const DataField = forwardRef<HTMLDivElement, DataFieldProps>(
  (
    {
      condition,
      idealType,
      highlight: dealBreaker,
      dragEnabled,
      listeners,
      attributes,
      ...props
    },
    ref,
  ) => {
    const isDealBreaker = dealBreaker || 기본_필수_조건들.has(condition);
    const { label, value } = createFieldData(idealType, condition);

    return (
      <div
        className={`flex flex-row items-center justify-between rounded-md border ${
          isDealBreaker
            ? "border-primary-500 bg-primary-100"
            : "border-gray-400"
        } px-4 py-2`}
        ref={ref}
        {...props}
      >
        <p className="text-gray-800">{`${label}: ${value}`}</p>
        {dragEnabled ? (
          <DragHandleIcon
            className="cursor-grab touch-none text-gray-500 outline-none"
            style={{ width: "20px" }}
            {...listeners}
            {...attributes}
          />
        ) : null}
      </div>
    );
  },
);

function createFieldData(
  idealType: BasicMemberIdealTypeV2,
  condition: BasicCondition,
) {
  return match(condition)
    .with(BasicCondition.AGE, () => {
      const { minAgeBirthYear, maxAgeBirthYear } = idealType;

      return {
        label: "나이",
        value:
          minAgeBirthYear == null && maxAgeBirthYear == null
            ? "상관없음"
            : `${minAgeBirthYear != null ? `${minAgeBirthYear}년생 ` : ""}~${
                maxAgeBirthYear != null ? ` ${maxAgeBirthYear}년생` : ""
              }`,
      };
    })
    .with(BasicCondition.REGION, () => {
      return {
        label: "지역",
        value:
          idealType.regions.length > 0 || idealType.customRegion != null
            ? `${idealType.regions
                .map((region) => {
                  return 지역_라벨[region];
                })
                .join(", ")}${
                idealType.customRegion != null
                  ? `(${idealType.customRegion})`
                  : ""
              }`
            : "상관없음",
      };
    })
    .with(BasicCondition.HEIGHT, () => {
      const { minHeight, maxHeight } = idealType;

      return {
        label: "키",
        value:
          minHeight == null && maxHeight == null
            ? "상관없음"
            : `${minHeight != null ? `${minHeight}cm ` : ""}~${
                maxHeight != null ? ` ${maxHeight}cm` : ""
              }`,
      };
    })
    .with(BasicCondition.BODY_SHAPES, () => {
      return {
        label: "체형",
        value:
          idealType.bodyShapes.length > 0
            ? idealType.bodyShapes
                .map((bodyShapge) => {
                  return 체형_라벨[bodyShapge];
                })
                .join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.EYELID, () => {
      return {
        label: "눈꺼풀 종류",
        value:
          idealType.eyelids.length > 0
            ? idealType.eyelids
                .map((eyelid) => {
                  return 쌍꺼풀_라벨[eyelid];
                })
                .join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.FACIAL_BODY_PART, () => {
      return {
        label: "얼굴/신체 특징",
        value: idealType.facialBodyPart ?? "상관없음",
      };
    })
    .with(BasicCondition.EDUCATION_LEVEL, () => {
      return {
        label: "학력",
        value:
          idealType.educationLevel != null
            ? 최소_학력_라벨[idealType.educationLevel]
            : "상관없음",
      };
    })
    .with(BasicCondition.SCHOOL_LEVEL, () => {
      return {
        label: "학벌",
        value: idealType.schoolLevel ?? "상관없음",
      };
    })
    .with(BasicCondition.OCCUPATION_STATUS, () => {
      return {
        label: "신분",
        value:
          idealType.occupationStatuses.length > 0
            ? idealType.occupationStatuses
                .map((status) => {
                  return 신분_라벨[status];
                })
                .join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.NON_PREFERRED_WORKPLACE_SCHOOL, () => {
      return {
        label: "기피 직장/학교",
        value: idealType.nonPreferredWorkplace ?? "없음",
      };
    })
    .with(BasicCondition.NON_PREFERRED_JOB, () => {
      return {
        label: "기피 직무",
        value: idealType.nonPreferredJob ?? "없음",
      };
    })
    .with(BasicCondition.PREFERRED_MBTIS, () => {
      return {
        label: "선호 MBTI",
        value:
          idealType.preferredMbtis.length > 0
            ? idealType.preferredMbtis.join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.NON_PREFERRED_MBTIS, () => {
      return {
        label: "비선호 MBTI",
        value:
          idealType.nonPreferredMbtis.length > 0
            ? idealType.nonPreferredMbtis.join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.IS_SMOKER_OK, () => {
      return {
        label: "흡연 허용",
        value: idealType.isSmokerOk ? "예" : "아니요",
      };
    })
    .with(BasicCondition.DRINKING_FREQUENCY, () => {
      return {
        label: "음주 빈도/양",
        value:
          idealType.drinkingFrequency != null
            ? idealType.drinkingFrequency === DrinkingFrequency.OTHER
              ? idealType.customDrinkingFrequency!
              : 음주량_라벨[idealType.drinkingFrequency]
            : "상관없음",
      };
    })
    .with(BasicCondition.PREFERRED_RELIGIONS, () => {
      return {
        label: "선호 종교",
        value:
          idealType.preferredReligions.length > 0
            ? idealType.preferredReligions
                .map((religion) => {
                  return 종교_라벨[religion];
                })
                .join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.NON_PREFERRED_RELIGIONS, () => {
      return {
        label: "비선호 종교",
        value:
          idealType.nonPreferredReligions.length > 0
            ? idealType.nonPreferredReligions
                .map((religion) => {
                  return 종교_라벨[religion];
                })
                .join(", ")
            : "상관없음",
      };
    })
    .with(BasicCondition.MIN_ANNUAL_INCOME, () => {
      return {
        label: "연간 수입",
        value:
          idealType.minAnnualIncome != null
            ? 최소_연간_벌이_라벨[idealType.minAnnualIncome]
            : "상관없음",
      };
    })
    .with(BasicCondition.MIN_ASSETS_VALUE, () => {
      return {
        label: "자산",
        value:
          idealType.minAssetsValue != null
            ? 최소_자산_라벨[idealType.minAssetsValue]
            : "상관없음",
      };
    })
    .with(BasicCondition.HOBBY, () => {
      return {
        label: "취미/관심사",
        value: idealType.hobby ?? "상관없음",
      };
    })
    .with(BasicCondition.BOOKS_READ_PER_YEAR, () => {
      return {
        label: "연간 독서량",
        value:
          idealType.booksReadPerYear != null
            ? 최소_독서량_라벨[idealType.booksReadPerYear]
            : "상관없음",
      };
    })
    .with(BasicCondition.CHARACTERISTICS, () => {
      return {
        label: "특징",
        value: idealType.characteristics ?? "상관없음",
      };
    })
    .with(BasicCondition.IS_TATTOO_OK, () => {
      return {
        label: "문신 허용",
        value: idealType.isTattooOk ? "예" : "아니요",
      };
    })
    .with(BasicCondition.EXERCISE_PER_WEEK, () => {
      return {
        label: "운동",
        value:
          idealType.exercisePerWeek != null
            ? 주간_운동량_라벨[idealType.exercisePerWeek]
            : "상관없음",
      };
    })
    .with(BasicCondition.SHOULD_HAVE_CAR, () => {
      return {
        label: "자차 보유 기대",
        value: idealType.shouldHaveCar ? "예" : "아니요",
      };
    })
    .with(BasicCondition.IS_GAMING_OK, () => {
      return {
        label: "게임 허용",
        value: idealType.isGamingOk ? "예" : "아니요",
      };
    })
    .with(BasicCondition.IS_PET_OK, () => {
      return {
        label: "반려동물 허용",
        value: idealType.isPetOk ? "예" : "아니요",
      };
    })
    .exhaustive();
}

MyIdealTypePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="내 이상형 조건 (베타)">{page}</Layout>;
};

const 종교_라벨: Record<Religion, string> = {
  [Religion.NONE]: "종교 없음",
  [Religion.CHRISTIAN]: "개신교",
  [Religion.CATHOLIC]: "천주교",
  [Religion.BUDDHIST]: "불교",
  [Religion.OTHER]: "기타",
} as const;
