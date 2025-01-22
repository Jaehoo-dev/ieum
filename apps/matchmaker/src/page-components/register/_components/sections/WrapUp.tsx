import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { TextareaInput } from "~/components/form/TextareaInput";
import { TextInput } from "~/components/form/TextInput";
import { UniSelect } from "~/components/form/UniSelect";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import type { RegisterForm } from "../../RegisterForm";
import { registerFormId } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";

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
  const phoneNumber = getValues("phoneNumber");
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: `${phoneNumber} - 회원가입 마무리 페이지 진입`,
    });
  }, [phoneNumber, sendMessage]);

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <BackTextButton
        onClick={() => {
          sendMessage({
            content: `${phoneNumber} - 회원가입 마무리 페이지 이전 텍스트버튼 클릭`,
          });
          onBack();
        }}
      />
      <div className="flex flex-col gap-8">
        <TextInput
          label="추천을 받아 가입하시는 거라면 추천인 코드를 입력해주세요."
          error={errors.referrerCode != null}
          errorText={errors.referrerCode?.message}
          {...register("referrerCode", {
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
          description="왜 이음을 선택하셨나요? 본인 또는 이상형과 관련한 이야기, 추가로 어필하고 싶은 점이나 설문 피드백 등 모두 좋습니다."
          error={errors.memo != null}
          errorText={errors.memo?.message}
          {...register("memo", {
            setValueAs: (value) => {
              if (value == null || value === "") {
                return null;
              }

              return value.trim();
            },
          })}
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
          type="button"
          onClick={() => {
            sendMessage({
              content: `${phoneNumber} - 회원가입 마무리 페이지 이전 버튼 클릭`,
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
              content: `${phoneNumber} - 회원가입 마무리 페이지 제출 클릭`,
            });
          }}
          className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-lg font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          disabled={!watch("personalInfoConsent") || isSubmitting}
        >
          {isSubmitting ? "제출 중.." : "제출"}
        </button>
      </div>
    </div>
  );
}
