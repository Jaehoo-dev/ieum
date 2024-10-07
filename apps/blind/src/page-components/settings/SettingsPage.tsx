import { ReactElement, Suspense } from "react";
import Head from "next/head";

import { Layout } from "~/components/Layout";
import { BlacklistSection } from "./_components/BlacklistSection";
import { HeartSection } from "./_components/HeartSection";
import { StatusSectionResolved } from "./_components/StatusSection";
import { VerificationSection } from "./_components/VerificationSection";

export function SettingsPage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <Suspense>
        <Resolved />
      </Suspense>
    </>
  );
}

function Resolved() {
  return (
    <div className="mb-6 flex flex-col gap-6">
      <StatusSectionResolved />
      <hr />
      <HeartSection />
      <hr />
      <VerificationSection />
      <hr />
      <BlacklistSection />
    </div>
  );
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="설정" bottomNav={true}>
      {page}
    </Layout>
  );
};
