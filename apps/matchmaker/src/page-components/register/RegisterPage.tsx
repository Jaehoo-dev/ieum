import { ReactElement, useState } from "react";
import { FormProvider } from "react-hook-form";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";
import { Ending } from "./_components/sections/Ending";
import { IdealTypeSurvey } from "./_components/sections/IdealTypeSurvey";
import { PreIdealTypeSurvey } from "./_components/sections/PreIdealTypeSurvey";
import { PreSelfSurvey } from "./_components/sections/PreSelfSurvey";
import { SelfSurvey } from "./_components/sections/SelfSurvey";
import { Welcome } from "./_components/sections/Welcome";
import { WrapUp } from "./_components/sections/WrapUp";
import { formToPayload, registerFormId, useRegisterForm } from "./RegisterForm";

const steps = [
  "환영 및 기본 인적사항",
  "본인 설문 설명",
  "본인 설문",
  "이상형 설문 설명",
  "이상형 설문",
  "마무리",
  "끝",
] as const;

export function RegisterPage() {
  const { clearCache, ...methods } = useRegisterForm();
  const [step, setStep] =
    useState<(typeof steps)[number]>("환영 및 기본 인적사항");
  const { mutateAsync: createDraftMember } =
    api.draftMemberRouter.create.useMutation();

  return (
    <FormProvider {...methods}>
      <form
        id={registerFormId}
        onSubmit={methods.handleSubmit(async (fields) => {
          const payload = formToPayload(fields);

          await createDraftMember(payload);

          clearCache();
          setStep("끝");
        })}
      >
        {match(step)
          .with("환영 및 기본 인적사항", () => {
            return (
              <Welcome
                onNext={() => {
                  setStep("본인 설문 설명");
                }}
              />
            );
          })
          .with("본인 설문 설명", () => {
            return (
              <PreSelfSurvey
                onBack={() => {
                  setStep("환영 및 기본 인적사항");
                }}
                onNext={() => {
                  setStep("본인 설문");
                }}
              />
            );
          })
          .with("본인 설문", () => {
            return (
              <SelfSurvey
                onBack={() => {
                  setStep("본인 설문 설명");
                }}
                onNext={() => {
                  setStep("이상형 설문 설명");
                }}
              />
            );
          })
          .with("이상형 설문 설명", () => {
            return (
              <PreIdealTypeSurvey
                onBack={() => {
                  setStep("본인 설문");
                }}
                onNext={() => {
                  setStep("이상형 설문");
                }}
              />
            );
          })
          .with("이상형 설문", () => {
            return (
              <IdealTypeSurvey
                onBack={() => {
                  setStep("이상형 설문 설명");
                }}
                onNext={() => {
                  setStep("마무리");
                }}
              />
            );
          })
          .with("마무리", () => {
            return (
              <WrapUp
                onBack={() => {
                  setStep("이상형 설문");
                }}
              />
            );
          })
          .with("끝", () => {
            return <Ending />;
          })
          .exhaustive()}
      </form>
    </FormProvider>
  );
}

RegisterPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="회원 가입" sidebar={false} padding={false}>
      {page}
    </Layout>
  );
};

RegisterPage.auth = false;
