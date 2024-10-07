import { ReactElement, Suspense } from "react";
import Head from "next/head";
import { BlindProfile } from "@ieum/profile";
import { assert } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyProfilePage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <Suspense
        fallback={
          <div className="mt-4 flex items-center justify-center">
            <Loader />
          </div>
        }
      >
        <Resolved />
      </Suspense>
    </>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [profile] = api.blindMemberRouter.getProfile.useSuspenseQuery({
    memberId: member.id,
  });

  return <BlindProfile profile={profile} />;
}

MyProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="내 프로필">{page}</Layout>;
};
