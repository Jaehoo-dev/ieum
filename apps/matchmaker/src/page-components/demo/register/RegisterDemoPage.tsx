import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FRIP_PRODUCT_URL, PRODUCT_URL } from "@ieum/constants";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { Ending } from "./components/Ending";
import { IdealTypeSurvey } from "./components/IdealTypeSurvey";
import { Welcome } from "./components/Welcome";

const steps = ["환영 및 안내", "이상형 설문", "끝"] as const;

export function RegisterDemoPage() {
  const [step, setStep] = useState<(typeof steps)[number]>("환영 및 안내");
  const router = useRouter();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    const from = router.query.from;

    if (from == null) {
      return;
    }

    sendMessage({
      channel: "알림",
      content: `설문 데모 페이지 진입 from: ${from}`,
    });
  }, [router.query.from, sendMessage]);

  return match(step)
    .with("환영 및 안내", () => {
      return (
        <Welcome
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
            setStep("환영 및 안내");
          }}
          onNext={() => {
            setStep("끝");
          }}
        />
      );
    })
    .with("끝", () => {
      return (
        <Ending
          targetUrl={
            router.query.from === "frip" ? FRIP_PRODUCT_URL : PRODUCT_URL
          }
        />
      );
    })
    .exhaustive();
}

RegisterDemoPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="설문 체험판" sidebar={false} padding={false}>
      {page}
    </Layout>
  );
};

RegisterDemoPage.auth = false;
