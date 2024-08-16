import { isEmptyStringOrNil } from "@ieum/utils";
import { useFormContext } from "react-hook-form";

import { TextInput } from "~/components/TextInput";
import { BasicMemberForm } from "../../members/BasicMemberForm";

export function ReferrerCodeField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BasicMemberForm>();

  return (
    <TextInput
      label="추천인 코드"
      error={errors.self?.referrerCode != null}
      {...register("self.referrerCode", {
        setValueAs: (value: string | null) => {
          return isEmptyStringOrNil(value) ? null : value;
        },
      })}
    />
  );
}
