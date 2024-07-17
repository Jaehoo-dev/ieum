import { ReactElement, Suspense } from "react";
import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyStatusPage() {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [status] = api.basicMemberRouter.getStatus.useSuspenseQuery({
    memberId: member.id,
  });

  return match(status)
    .with(MemberStatus.ACTIVE, () => <Active />)
    .with(MemberStatus.INACTIVE, () => <Inactive />)
    .exhaustive();
}

function Active() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-gray-700">내 상태</h2>
      <p className="text-lg text-gray-700">활동 중</p>
    </div>
  );
}

function Inactive() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const utils = api.useUtils();
  const { mutateAsync: activate } = api.basicMemberRouter.activate.useMutation({
    onSuccess: () => {
      return utils.basicMemberRouter.getStatus.invalidate();
    },
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-gray-700">내 상태</h2>
        <p className="text-lg text-gray-700">휴면</p>
      </div>
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="w-full max-w-lg px-2">
          <button
            className="block w-full rounded-lg bg-primary-500 p-3 text-center text-lg font-medium text-white hover:bg-primary-700"
            onClick={async () => {
              await activate({ memberId: member.id });
              alert("휴면 해제했습니다");
            }}
          >
            휴면 해제
          </button>
        </div>
      </div>
    </>
  );
}

MyStatusPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="활성 상태">{page}</Layout>;
};
