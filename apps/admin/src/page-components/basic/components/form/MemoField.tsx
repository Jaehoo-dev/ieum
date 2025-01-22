import { isEmptyStringOrNil } from "@ieum/utils";
import { useFormContext } from "react-hook-form";

import { TextareaInput } from "~/components/TextareaInput";
import type { BasicMemberForm } from "../../members/BasicMemberForm";

export function MemoField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BasicMemberForm>();

  return (
    <TextareaInput
      label="메모"
      error={errors.self?.memo != null}
      {...register("self.memo", {
        setValueAs: (value: string | null) => {
          return isEmptyStringOrNil(value) ? null : value;
        },
      })}
    />
  );
}
