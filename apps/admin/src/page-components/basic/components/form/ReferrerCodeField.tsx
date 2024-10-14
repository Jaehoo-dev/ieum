import { formatUniqueMemberName, isEmptyStringOrNil } from "@ieum/utils";
import { useFormContext } from "react-hook-form";
import { useDebounce } from "use-debounce";

import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";
import { BasicMemberForm } from "../../members/BasicMemberForm";

export function ReferrerCodeField() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<BasicMemberForm>();
  const referrerCode = watch("self.referrerCode");
  const referrer = useDebouncedReferrer(referrerCode);

  return (
    <div className="flex gap-1">
      <TextInput
        label="추천인 코드"
        error={errors.self?.referrerCode != null}
        {...register("self.referrerCode", {
          setValueAs: (value: string | null) => {
            return isEmptyStringOrNil(value) ? null : value;
          },
        })}
      />
      {referrer != null ? (
        <TextInput
          label="추천인"
          value={formatUniqueMemberName(referrer)}
          disabled={true}
        />
      ) : null}
    </div>
  );
}

function useDebouncedReferrer(code: string | null) {
  const [debouncedCode] = useDebounce(code, 300);

  const { data: referrer } = api.basicMemberRouter.getByReferralCode.useQuery(
    { referralCode: debouncedCode! },
    { enabled: !isEmptyStringOrNil(debouncedCode) },
  );

  return referrer;
}
