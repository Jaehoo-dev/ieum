import { useEffect } from "react";
import { 성별_라벨 } from "@ieum/constants";
import { Gender, MarriageStatus } from "@ieum/prisma";
import { formatPhoneNumberInput } from "@ieum/utils";
import { Controller, useFormContext } from "react-hook-form";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { RegisterForm } from "../../RegisterForm";
import { TextInput } from "../TextInput";
import { UniSelect } from "../UniSelect";

interface Props {
  onNext: () => void;
}

export function Welcome({ onNext }: Props) {
  const {
    formState: { errors },
    register,
    control,
    trigger,
    watch,
  } = useFormContext<RegisterForm>();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: "회원가입 페이지 진입",
    });
  }, []);

  return (
    <div className="flex w-full flex-col">
      <img
        src="/hello.jpg"
        alt="안녕하세요"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-6 p-8">
        <h1 className="text-xl font-medium text-gray-800">
          안녕하세요! 이음입니다.
        </h1>
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
                  description="상대방에게 공개하지 않아요. 이 번호로 호스트가 연락을 드리니 정확하게 입력해주세요."
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
            name="gender"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <UniSelect
                  label="성별이 무엇인가요?"
                  options={[
                    {
                      label: 성별_라벨[Gender.MALE],
                      value: Gender.MALE,
                    },
                    {
                      label: 성별_라벨[Gender.FEMALE],
                      value: Gender.FEMALE,
                    },
                  ]}
                  value={value}
                  required={true}
                  onChange={onChange}
                  error={error != null}
                  errorText={error?.message}
                  cols={2}
                />
              );
            }}
            rules={{
              required: "성별을 선택해주세요.",
            }}
          />
          <Controller
            control={control}
            name="marriageStatus"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <UniSelect
                  label="기혼은 아니겠죠?"
                  options={[
                    { label: "미혼", value: MarriageStatus.SINGLE },
                    { label: "기혼", value: MarriageStatus.MARRIED },
                    { label: "돌싱", value: MarriageStatus.DIVORCED },
                  ]}
                  required={true}
                  value={value}
                  onChange={onChange}
                  description="기혼자는 돌아가주세요! 죄송하지만 돌싱인 분들에게도 서비스를 제공하지 않습니다."
                  error={error != null}
                  errorText={error?.message}
                  cols={3}
                />
              );
            }}
            rules={{
              required: "성별을 선택해주세요.",
              validate: (value) => {
                if (value === "MARRIED") {
                  return "기혼자는 가입이 불가능합니다.";
                }

                if (value === "DIVORCED") {
                  return "돌싱인 분들에겐 서비스를 제공하지 않습니다.";
                }

                return true;
              },
            }}
          />
        </div>
        <button
          onClick={async () => {
            sendMessage({
              content: "회원가입 페이지 다음 클릭",
            });

            const isValid = await trigger(
              ["name", "phoneNumber", "gender", "marriageStatus"],
              {
                shouldFocus: true,
              },
            );

            if (isValid) {
              onNext();
            }
          }}
          className="mt-4 w-full rounded-lg bg-primary-500 px-4 py-2 text-lg font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          disabled={watch("marriageStatus") !== "SINGLE"}
        >
          다음
        </button>
      </div>
    </div>
  );
}
