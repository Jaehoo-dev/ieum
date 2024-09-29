import { ReactElement, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { assert, globalKrToBasicKr } from "@ieum/utils";
import { signOut as signOutFirebase } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { api } from "~/utils/api";
import { auth } from "~/utils/firebase";
import { EndingSection } from "./_components/sections/EndingSection";
import { SurveySection } from "./_components/sections/SurveySection";

const steps = ["설문", "끝"] as const;

export function RegisterPage() {
  const router = useRouter();
  const [user, isAuthLoading, error] = useAuthState(auth);
  const utils = api.useUtils();
  const [step, setStep] = useState<(typeof steps)[number]>("설문");

  const abort = useCallback(async () => {
    await signOutFirebase(auth);
    await utils.blindMemberRouter.invalidate();
    await router.replace("/");
  }, [router, utils.blindMemberRouter]);

  useEffect(() => {
    if (error != null || (!isAuthLoading && user?.phoneNumber == null)) {
      abort();
    }
  }, [error, user, isAuthLoading, abort]);

  return isAuthLoading ? (
    <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center">
      <Loader />
    </div>
  ) : (
    match(step)
      .with("설문", () => {
        assert(user?.phoneNumber != null, "User should have phone number");

        return (
          <SurveySection
            phoneNumber={globalKrToBasicKr(user.phoneNumber)}
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
