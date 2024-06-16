import { isEmptyStringOrNil } from "@ieum/utils";
import { useFormContext } from "react-hook-form";

import { BasicMemberForm } from "../../members/BasicMemberForm";

export function MemoField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BasicMemberForm>();

  return (
    <label className="flex flex-col">
      메모
      <textarea
        className={`rounded border border-gray-300 ${
          errors.memo ? "border-2 border-red-500" : ""
        }`}
        {...register("memo", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
    </label>
  );
}
