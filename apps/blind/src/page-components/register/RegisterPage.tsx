import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "@ieum/blind-auth";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { api } from "~/utils/api";
import { EndingSection } from "./_components/sections/EndingSection";
import { SurveySection } from "./_components/sections/SurveySection";

const steps = ["설문", "끝"] as const;

export function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const utils = api.useUtils();
  const [step, setStep] = useState<(typeof steps)[number]>("설문");

  const abort = useCallback(async () => {
    await signOut();
    await utils.blindMemberRouter.invalidate();
    await router.replace("/");
  }, [router, utils.blindMemberRouter]);

  useEffect(() => {
    match(status)
      .with("loading", () => {
        return;
      })
      .with("unauthenticated", () => {
        abort();
      })
      .with("authenticated", () => {
        if (session?.user.phoneNumber == null) {
          abort();
        }
      })
      .exhaustive();
  }, [status, session?.user.phoneNumber, abort]);

  return status === "loading" ? (
    <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center">
      <Loader />
    </div>
  ) : (
    match(step)
      .with("설문", () => {
        assert(
          session?.user.phoneNumber != null,
          "User should have phone number",
        );

        return (
          <SurveySection
            phoneNumber={session.user.phoneNumber}
            onSubmitSuccess={() => {
              setStep("끝");
            }}
          />
        );
      })
      .with("끝", () => {
        return <EndingSection />;
      })
      .exhaustive()
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
