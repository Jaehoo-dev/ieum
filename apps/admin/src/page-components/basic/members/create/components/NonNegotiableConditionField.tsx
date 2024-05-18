import { 베이직_조건_라벨 } from "@ieum/labels";
import { BasicCondition } from "@ieum/prisma";
import { useFieldArray, useFormContext } from "react-hook-form";

import type { CreateBasicMemberForm } from "../CreateBasicMemberForm";

export function NonNegotiableConditionsField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateBasicMemberForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nonNegotiableConditions",
  });

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">필수 조건</h1>
      <div className="grid grid-cols-3 gap-2">
        {Object.values(BasicCondition).map((condition) => {
          return (
            <label key={condition} className="flex gap-2">
              <input
                className={`rounded border border-gray-300 ${
                  errors.nonNegotiableConditions
                    ? "border-2 border-red-500"
                    : ""
                }`}
                type="checkbox"
                checked={fields.some((field) => {
                  return field.value === condition;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    append({ value: condition });
                  } else {
                    remove(
                      fields.findIndex((field) => field.value === condition),
                    );
                  }
                }}
              />
              {베이직_조건_라벨[condition]}
            </label>
          );
        })}
      </div>
    </div>
  );
}
