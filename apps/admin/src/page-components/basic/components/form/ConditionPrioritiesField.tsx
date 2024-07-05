import { useState } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 베이직_조건_라벨 } from "@ieum/constants";
import { BasicCondition } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { useFieldArray, useFormContext } from "react-hook-form";

import { BasicMemberForm } from "../../members/BasicMemberForm";

const 우선순위 = {
  필수: "DEAL_BREAKER",
  높음: "HIGH",
  중간: "MEDIUM",
  낮음: "LOW",
  미지정: "NONE",
} as const;

type 우선순위 = (typeof 우선순위)[keyof typeof 우선순위];

export function ConditionPrioritiesField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<BasicMemberForm>();
  const {
    fields: dealBreakerFields,
    append: appendDealBreaker,
    remove: removeDealBreaker,
  } = useFieldArray({
    control,
    name: "idealType.dealBreakers",
  });
  const {
    fields: highPriorityFields,
    append: appendHighPriority,
    remove: removeHighPriority,
  } = useFieldArray({
    control,
    name: "idealType.highPriorities",
  });
  const {
    fields: mediumPriorityFields,
    append: appendMediumPriority,
    remove: removeMediumPriority,
  } = useFieldArray({
    control,
    name: "idealType.mediumPriorities",
  });
  const {
    fields: lowPriorityFields,
    append: appendLowPriority,
    remove: removeLowPriority,
  } = useFieldArray({
    control,
    name: "idealType.lowPriorities",
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

  const sections = [
    {
      id: 우선순위.필수,
      label: "필수",
      conditions: dealBreakerFields.map((field) => field.value),
    },
    {
      id: 우선순위.높음,
      label: "상",
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
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold">이상형 조건 우선순위</h3>
      <DndContext
        onDragOver={({ active, over }) => {
          if (over == null) {
            return;
          }

          const activeContainerId: 우선순위 =
            active.data.current?.sortable.containerId;
          const overContainerId: 우선순위 =
            over.data.current?.sortable.containerId ?? over.id;

          removeFromContainer(active.id as BasicCondition, activeContainerId);
          appendToContainer(active.id as BasicCondition, overContainerId);
        }}
      >
        <div className="flex flex-col gap-3">
          {sections.map((section) => {
            return (
              <Section
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
  );
}

function Section({
  id,
  label,
  conditions,
}: {
  id: 우선순위;
  label: string;
  conditions: BasicCondition[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{label}</span>
      <DroppableContainer id={id} conditions={conditions} />
    </div>
  );
}

function DroppableContainer({
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
        <div className="grid grid-cols-4 gap-2" ref={setNodeRef}>
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
      className="cursor-grab rounded border border-gray-300 p-2"
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
