import { ReactElement, Suspense } from "react";
import Head from "next/head";

import { Layout } from "~/components/Layout";
import { BlacklistSection } from "./_components/BlacklistSection";
import { StatusSectionResolved } from "./_components/StatusSection";

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
    <div className="flex flex-col gap-6">
      <StatusSectionResolved />
      <hr />
      <BlacklistSection />
    </div>
  );
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="설정">{page}</Layout>;
};
