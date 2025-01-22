import type { ReactElement } from "react";
import { Suspense } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
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

  return (
    <>
      <BlindProfile profile={profile} style={{ marginBottom: "84px" }} />
      <EditButton />
    </>
  );
}

function EditButton() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
      <div className="w-full max-w-lg px-2">
        <button
          className="w-full rounded-lg bg-blind-500 p-3 text-xl font-medium text-white hover:bg-blind-600"
          onClick={() => {
            router.push("/my-profile/edit");
          }}
        >
          수정
        </button>
      </div>
    </div>
  );
}

MyProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="내 프로필">{page}</Layout>;
};
