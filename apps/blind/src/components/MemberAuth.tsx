import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "@ieum/blind-auth";
import { assert, formatPhoneNumberInput, krHyphenToKr } from "@ieum/utils";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { Controller, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { api } from "~/utils/api";

export function MemberAuth() {
  const [step, setStep] = useState<"PHONE" | "CODE">("PHONE");
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [verificationId, setVerificationId] = useState<string>();

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {match(step)
        .with("PHONE", () => (
          <PhoneStep
            onSignIn={({ phoneNumber, verificationId }) => {
              setPhoneNumber(phoneNumber);
              setVerificationId(verificationId);
              setStep("CODE");
            }}
          />
        ))
        .with("CODE", () => (
          <CodeStep
            phoneNumber={phoneNumber}
            verificationId={verificationId}
            onReset={() => {
              setPhoneNumber(undefined);
              setVerificationId(undefined);
              setStep("PHONE");
            }}
          />
        ))
        .exhaustive()}
      <Link
        href="/demo"
        className="text-center text-sm text-blind-500 underline"
      >
        체험하기
      </Link>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 text-gray-700">
          <HelpOutlineRoundedIcon className="mb-0.5 text-sm" />
          <span>전화번호 인증을 왜 하나요?</span>
        </div>
        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <Description>
            무분별한 계정 생성을 방지하고 건전한 서비스를 제공하기 위해
            전화번호로 회원체계를 운영합니다.
          </Description>
          <Description>하트를 받았을 때 알림을 발송합니다.</Description>
          <Description>
            전화번호는 다른 회원에게{" "}
            <span className="font-semibold">절대 노출하지 않습니다</span>.
          </Description>
        </div>
      </div>
    </div>
  );
}

function Description({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-1">
      <p>-</p>
      <p>{children}</p>
    </div>
  );
}

interface PhoneStepProps {
  onSignIn: (payload: { phoneNumber: string; verificationId: string }) => void;
}

function PhoneStep({ onSignIn }: PhoneStepProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      phoneNumber: "",
    },
  });
  const { sendMessage } = useSlackNotibot();
  const { mutateAsync: createOtp } = api.otpRouter.create.useMutation();

  return (
    <form
      className="flex w-full flex-col"
      onSubmit={handleSubmit(async ({ phoneNumber }) => {
        sendMessage({
          content: `${phoneNumber} - 인증번호 전송 요청\n${navigator.userAgent}`,
        });

        const hyphenRemovedPhoneNumber = krHyphenToKr(phoneNumber);

        const { verificationId, isReused } = await createOtp({
          phoneNumber: hyphenRemovedPhoneNumber,
        });

        if (isReused) {
          alert(
            "이미 인증번호를 전송했습니다. 문자로 받은 인증번호를 입력하거나 잠시 후 다시 시도해주세요.",
          );
          onSignIn({ phoneNumber: hyphenRemovedPhoneNumber, verificationId });

          return;
        }

        sendMessage({ content: `${phoneNumber} - 인증번호 전송` });
        onSignIn({ phoneNumber: hyphenRemovedPhoneNumber, verificationId });
        alert("인증번호를 전송했습니다.");
      })}
    >
      <label className="flex flex-col" htmlFor="phoneNumber">
        <span className="text-gray-700 md:text-lg">전화번호</span>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <input
                id="phoneNumber"
                className={`rounded-lg border ${
                  error ? "border-red-500" : "border-gray-300"
                } px-4 py-2 text-lg text-gray-700 md:py-3 md:text-xl`}
                type="text"
                placeholder="010-0000-0000"
                value={value}
                onChange={({ target: { value } }) => {
                  onChange(formatPhoneNumberInput(value));
                }}
              />
            );
          }}
          rules={{
            required: "전화번호를 입력해주세요",
            pattern: {
              value: /^010-\d{4}-\d{4}$/,
              message: "올바른 전화번호를 입력해주세요",
            },
          }}
        />
      </label>
      <button
        id="sign-in-button"
        className="mt-3 w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white hover:border-blind-700 hover:bg-blind-700 disabled:cursor-not-allowed disabled:bg-blind-300 md:p-3 md:text-xl"
        disabled={isSubmitting || errors.phoneNumber != null}
      >
        {isSubmitting ? "전송중.." : "인증번호 전송"}
      </button>
    </form>
  );
}

interface CodeStepProps {
  phoneNumber: string | undefined;
  verificationId: string | undefined;
  onReset: () => void;
}

function CodeStep({ phoneNumber, verificationId, onReset }: CodeStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      shouldPersist: true,
      verificationCode: "",
    },
  });
  const { sendMessage } = useSlackNotibot();

  return (
    <div className="w-full">
      <form
        className="flex flex-col items-center gap-1"
        onSubmit={handleSubmit(async ({ verificationCode }) => {
          assert(verificationId != null, "verificationId must be set");

          void sendMessage({ content: "로그인 시도" });

          await signIn("credentials", {
            verificationId,
            phoneNumber,
            otp: verificationCode,
            redirect: false,
          });
        })}
      >
        <label className="flex w-full flex-col">
          <span className="text-gray-700 md:text-lg">인증번호</span>
          <input
            className={`rounded-lg border ${
              errors.verificationCode ? "border-red-500" : "border-gray-300"
            } px-4 py-2 text-lg text-gray-700 md:py-3 md:text-xl`}
            type="text"
            placeholder="123456"
            {...register("verificationCode", {
              required: "인증번호를 입력해주세요",
              pattern: {
                value: /^\d{6}$/,
                message: "올바른 인증번호를 입력해주세요",
              },
            })}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
          />
        </label>
        <button
          id="sign-in-button"
          className="mt-1 w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white hover:border-blind-700 hover:bg-blind-700 disabled:cursor-not-allowed disabled:bg-blind-300 md:p-3 md:text-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "인증중.." : "인증하기"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button
          className="cursor-pointer font-light text-gray-500 underline hover:text-gray-700"
          onClick={onReset}
        >
          이전 단계로
        </button>
      </div>
    </div>
  );
}
