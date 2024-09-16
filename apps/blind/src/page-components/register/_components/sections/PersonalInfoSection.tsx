import { formatPhoneNumberInput } from "@ieum/utils";
import { Controller, useFormContext } from "react-hook-form";

import { TextInput } from "~/components/form/TextInput";
import { UniSelect } from "~/components/form/UniSelect";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { RegisterForm, registerFormId } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";

interface Props {
  onBack: () => void;
}

export function PersonalInfoSection({ onBack }: Props) {
  const {
    watch,
    formState: { errors, isSubmitting },
    register,
    control,
  } = useFormContext<RegisterForm>();
  const { sendMessage } = useSlackNotibot();

  return (
    <div className="flex w-full flex-col gap-8 p-6">
      <BackTextButton onClick={onBack} />
      <div className="flex flex-col gap-8">
        <TextInput
          label="성함을 알려주세요."
          description="상대방에게 공개하지 않아요."
          required={true}
          placeholder="김이음"
          error={errors.name != null}
          errorText={errors.name?.message}
          {...register("name", {
            required: "이름을 입력해주세요.",
          })}
        />
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <TextInput
                label="전화번호가 무엇인가요?"
                description="이 번호로 호스트가 연락을 드리니 정확하게 입력해주세요."
                required={true}
                placeholder="010-0000-0000"
                value={value}
                onChange={({ target: { value } }) => {
                  onChange(formatPhoneNumberInput(value));
                }}
                error={error != null}
                errorText={error?.message}
              />
            );
          }}
          rules={{
            required: "전화번호를 입력해주세요.",
            pattern: {
              value: /^010-\d{4}-\d{4}$/,
              message: "올바른 전화번호를 입력해주세요.",
            },
          }}
        />
        <Controller
          control={control}
          name="personalInfoConsent"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="서비스를 제공하기 위해 개인정보를 수집하는 데 동의하십니까?"
                options={[
                  { label: "예", value: true },
                  { label: "아니요", value: false },
                ]}
                value={value}
                onChange={onChange}
                required={true}
                error={error != null}
                errorText={error?.message}
              />
            );
          }}
          rules={{
            validate: (value) => {
              return (
                value === true ||
                "개인정보 수집에 동의하지 않으시면 서비스를 제공해드릴 수 없습니다."
              );
            },
          }}
        />
      </div>
      <div className="mt-4 flex flex-row gap-2">
        <button
          onClick={() => {
            sendMessage({
              content: `${watch(
                "phoneNumber",
              )} - 개인정보 페이지 이전 버튼 클릭`,
            });
            onBack();
          }}
          className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-lg font-medium text-white hover:bg-gray-600"
        >
          이전
        </button>
        <button
          form={registerFormId}
          type="submit"
          onClick={() => {
            sendMessage({
              content: `${watch("phoneNumber")} - 개인정보 페이지 제출 클릭`,
            });
          }}
          className="flex-1 rounded-lg bg-blind-500 px-4 py-2 text-lg font-medium text-white hover:bg-blind-700 disabled:opacity-50"
          disabled={!watch("personalInfoConsent") || isSubmitting}
        >
          {isSubmitting ? "제출 중.." : "제출"}
        </button>
      </div>
    </div>
  );
}
