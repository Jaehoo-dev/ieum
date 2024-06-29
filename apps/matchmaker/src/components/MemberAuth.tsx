import { useEffect, useState } from "react";
import {
  auth,
  browserSessionPersistence,
  PhoneAuthProvider,
  RecaptchaVerifier,
  setPersistence,
  signInWithCredential,
  signInWithPhoneNumber,
} from "@ieum/firebase";
import { assert, isEmptyStringOrNil, krHyphenToGlobal } from "@ieum/utils";
import { Controller, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { HomepageTipsTabLink } from "./HomepageTipsTabLink";

export function MemberAuth() {
  const [step, setStep] = useState<"PHONE" | "CODE">("PHONE");
  const [verificationId, setVerificationId] = useState<string>();

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `로그인 창 진입\n${navigator.userAgent}\nreferrer: ${document.referrer}`,
    );
  }, [sendMessage]);

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
    <div className="flex flex-col items-center gap-6">
      <form
        className="flex w-full flex-col"
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
          className="mt-3 w-full rounded-lg border border-primary-500 bg-primary-500 p-2 text-center font-medium text-white hover:border-primary-700 hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 md:p-3 md:text-xl"
          disabled={isSubmitting || errors.phoneNumber != null}
        >
          {isSubmitting ? "전송중.." : "인증번호 전송"}
        </button>
      </form>
      <HomepageTipsTabLink rel="noopener" />
    </div>
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
      shouldPersist: true,
      verificationCode: "",
    },
  });
  const { sendMessage } = useSlackNotibot();

  return (
    <div className="w-full">
      <form
        className="flex flex-col items-center gap-1"
        onSubmit={handleSubmit(async ({ shouldPersist, verificationCode }) => {
          assert(verificationId != null, "verificationId must be set");

          const credential = PhoneAuthProvider.credential(
            verificationId,
            verificationCode,
          );

          try {
            void sendMessage("로그인 시도");

            if (!shouldPersist) {
              await setPersistence(auth, browserSessionPersistence);
            }

            await signInWithCredential(auth, credential);
          } catch {
            alert("인증에 실패했습니다. 다시 시도해주세요.");
          }
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
        <div className="inline-flex items-center">
          <label
            className="relative flex cursor-pointer items-center rounded-full p-3"
            htmlFor="shouldPersist"
          >
            <input
              type="checkbox"
              className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-12 before:w-12 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-primary-500 checked:bg-primary-500 checked:before:bg-primary-500"
              id="shouldPersist"
              {...register("shouldPersist")}
            />
            <span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </label>
          <label
            className="mt-[2px] cursor-pointer select-none text-gray-500"
            htmlFor="shouldPersist"
          >
            로그인 유지
          </label>
        </div>
        <button
          id="sign-in-button"
          className="mt-1 w-full rounded-lg border border-primary-500 bg-primary-500 p-2 text-center font-medium text-white hover:border-primary-700 hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 md:p-3 md:text-xl"
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
