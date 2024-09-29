import { ReactElement } from "react";

import { Layout } from "~/components/Layout";

export function MatchesPage() {
  return null;
}

MatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 목록">{page}</Layout>;
};
