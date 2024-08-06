import { Controller, useFormContext } from "react-hook-form";

import { RegisterForm, registerFormId } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";
import { TextareaInput } from "../TextareaInput";
import { TextInput } from "../TextInput";
import { UniSelect } from "../UniSelect";

interface Props {
  onBack: () => void;
}

export function WrapUp({ onBack }: Props) {
  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    watch,
    register,
  } = useFormContext<RegisterForm>();

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <BackTextButton onClick={onBack} />
      <div className="flex flex-col gap-8">
        <TextInput
          label="추천을 받아 가입하시는 거라면 추천인 코드를 입력해주세요."
          description={`${getValues(
            "name",
          )} 님과 추천인 모두에게 이음비 50% 할인 쿠폰을 드립니다!`}
          error={errors.referralCode != null}
          errorText={errors.referralCode?.message}
          {...register("referralCode", {
            setValueAs: (value) => {
              if (value == null || value === "") {
                return null;
              }

              return value.trim();
            },
            validate: (value) => {
              if (value == null || value === "" || value.length === 5) {
                return true;
              }

              return "추천인 코드를 확인해주세요.";
            },
          })}
        />
        <TextareaInput
          label="수고하셨어요! 호스트에게 특별히 하고 싶은 말이 있다면 남겨주세요."
          description="왜 이음을 선택하셨나요? 본인 또는 상대방과 관련한 이야기, 추가로 어필하고 싶은 점이나 요청사항, 설문 피드백 등 모두 좋습니다."
          error={errors.memo != null}
          errorText={errors.memo?.message}
        />
        <Controller
          control={control}
          name="personalInfoConsent"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="소개 진행을 위해 개인정보를 수집하는 데 동의하십니까?"
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
              return value === true || "개인정보 수집에 동의해주세요.";
            },
          }}
        />
      </div>
      <div className="mt-4 flex flex-row gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-lg font-medium text-white hover:bg-gray-600"
        >
          이전
        </button>
        <button
          form={registerFormId}
          type="submit"
          className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-lg font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          disabled={!watch("personalInfoConsent") || isSubmitting}
        >
          제출
        </button>
      </div>
    </div>
  );
}
