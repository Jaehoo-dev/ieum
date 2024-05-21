import assert from "assert";
import { useState } from "react";
import {
  auth,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
} from "@ieum/firebase";
import { isEmptyStringOrNil, krHyphenToGlobal } from "@ieum/utils";
import { Controller, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function MemberAuth() {
  const [step, setStep] = useState<"PHONE" | "CODE">("PHONE");
  const [verificationId, setVerificationId] = useState<string>();

  return (
    <div className="w-full max-w-md">
      {match(step)
        .with("PHONE", () => (
          <PhoneStep
            onSignIn={(verificationId) => {
              setVerificationId(verificationId);
              setStep("CODE");
            }}
          />
        ))
        .with("CODE", () => (
          <CodeStep
            verificationId={verificationId}
            onReset={() => {
              setStep("PHONE");
              setVerificationId(undefined);
            }}
          />
        ))
        .exhaustive()}
    </div>
  );
}

interface PhoneStepProps {
  onSignIn: (verificationId: string) => void;
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

  return (
    <form
      className="flex flex-col"
      onSubmit={handleSubmit(async ({ phoneNumber }) => {
        const recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "sign-in-button",
          { size: "invisible" },
        );

        try {
          void sendMessage(`인증번호 전송: ${phoneNumber}`);

          const result = await signInWithPhoneNumber(
            auth,
            krHyphenToGlobal(phoneNumber),
            recaptchaVerifier,
          );

          onSignIn(result.verificationId);
          alert("인증번호를 전송했습니다.");
        } catch (err) {
          alert(`인증번호 전송에 실패했습니다. 잠시 후 다시 시도해주세요.`);
          recaptchaVerifier.clear();
        }
      })}
    >
      <label className="flex flex-col" htmlFor="phoneNumber">
        <span className="text-xl text-gray-700">전화번호</span>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <input
                id="phoneNumber"
                className={`rounded-lg border ${
                  error ? "border-red-500" : "border-gray-300"
                } px-4 py-3 text-xl text-gray-700`}
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
        className="mt-3 w-full rounded-lg bg-primary-500 p-3 text-xl font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        disabled={isSubmitting || errors.phoneNumber != null}
      >
        {isSubmitting ? "전송중.." : "인증번호 전송"}
      </button>
    </form>
  );
}

interface CodeStepProps {
  verificationId: string | undefined;
  onReset: () => void;
}

function CodeStep({ verificationId, onReset }: CodeStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      verificationCode: "",
    },
  });
  const { sendMessage } = useSlackNotibot();

  return (
    <div>
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(async ({ verificationCode }) => {
          assert(verificationId != null, "verificationId must be set");

          const credential = PhoneAuthProvider.credential(
            verificationId,
            verificationCode,
          );

          try {
            void sendMessage("로그인 시도");
            await signInWithCredential(auth, credential);
          } catch {
            alert("인증에 실패했습니다. 다시 시도해주세요.");
          }
        })}
      >
        <label className="flex flex-col">
          <span className="text-xl text-gray-700">인증번호</span>
          <input
            className={`rounded-lg border ${
              errors.verificationCode ? "border-red-500" : "border-gray-300"
            } px-4 py-3 text-xl text-gray-700`}
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
          className="mt-3 w-full rounded-lg bg-primary-500 p-3 text-xl font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "인증중.." : "인증하기"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button
          className="cursor-pointer text-lg font-light text-gray-500 underline hover:text-gray-700"
          onClick={onReset}
        >
          이전 단계로
        </button>
      </div>
    </div>
  );
}

function formatPhoneNumberInput(phoneNumber: string) {
  return phoneNumber
    .replace(/[^0-9]/g, "")
    .slice(0, 11)
    .replace(
      /(\d{1,3})(\d{1,4})?(\d{1,4})?/,
      // @ts-expect-error: p1, p2, p3 can be undefined
      (_, p1?: string, p2?: string, p3?: string) => {
        if (!isEmptyStringOrNil(p3)) {
          return `${p1}-${p2}-${p3}`;
        }

        if (!isEmptyStringOrNil(p2)) {
          return `${p1}-${p2}`;
        }

        return p1;
      },
    );
}
