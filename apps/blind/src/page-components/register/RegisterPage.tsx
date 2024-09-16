import { ReactElement, useState } from "react";
import { FormProvider } from "react-hook-form";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";
import { EndingSection } from "./_components/sections/EndingSection";
import { PersonalInfoSection } from "./_components/sections/PersonalInfoSection";
import { SurveySection } from "./_components/sections/SurveySection";
import { formToPayload, registerFormId, useRegisterForm } from "./RegisterForm";

const steps = ["설문", "개인정보", "끝"] as const;

export function RegisterPage() {
  const { clearCache, ...methods } = useRegisterForm();
  const [step, setStep] = useState<(typeof steps)[number]>("설문");
  const { mutateAsync: createMember } =
    api.draftBlindMemberRouter.create.useMutation();

  return (
    <FormProvider {...methods}>
      <form
        id={registerFormId}
        onSubmit={methods.handleSubmit(async (fields) => {
          const payload = formToPayload(fields);

          await createMember(payload);

          clearCache();
          setStep("끝");
        })}
      >
        {match(step)
          .with("설문", () => {
            return <SurveySection onNext={() => setStep("개인정보")} />;
          })
          .with("개인정보", () => {
            return <PersonalInfoSection onBack={() => setStep("설문")} />;
          })
          .with("끝", () => {
            return <EndingSection />;
          })
          .exhaustive()}
      </form>
    </FormProvider>
  );
}

RegisterPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="회원 등록" sidebar={false} padding={false}>
      {page}
    </Layout>
  );
};

RegisterPage.auth = false;
