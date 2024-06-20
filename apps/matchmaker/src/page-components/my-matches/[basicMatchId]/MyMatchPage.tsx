import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { Profile } from "@ieum/profile";
import { assert } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyMatchPage() {
  return (
    <Suspense fallback={null}>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();
  const router = useRouter();
  const matchId = Number(router.query.basicMatchId);

  assert(member != null, "Component should be used within MemberAuthGuard");
  assert(!Number.isNaN(matchId), "basicMatchId should be a number");

  const [profile] =
    api.basicMatchRouter.getMatchTargetMemberProfile.useSuspenseQuery({
      selfMemberId: member.id,
      matchId,
    });
  const [match] = api.basicMatchRouter.getMatchById.useSuspenseQuery({
    matchId,
  });

  const isPendingByMember = match.pendingBy.some(({ id }) => {
    return id === member.id;
  });

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `${member.name} - ${match.id} 매칭 페이지 진입 / ${profile.id} 프로필 조회`,
    );
  }, [match.id, member.name, profile.id, sendMessage]);

  useEffect(() => {
    if (isPendingByMember || match.acceptedBy.length === 2) {
      return;
    }

    void sendMessage(
      `${member.name} - ${match.id} 매칭 페이지 진입 -> redirect to /my-matches`,
    );

    router.replace("/my-matches");
  }, [
    isPendingByMember,
    match.acceptedBy.length,
    match.id,
    member.name,
    router,
    sendMessage,
  ]);

  return (
    <div className="flex w-full flex-col">
      <Profile profile={profile} watermarkText={member.name} />
      {isPendingByMember ? (
        <>
          <Spacing size={108} />
          <Buttons
            memberId={member.id}
            onRejectClick={() => {
              void sendMessage(`${member.name} - ${match.id} 매칭 거절 클릭`);
            }}
            onAcceptClick={() => {
              void sendMessage(`${member.name} - ${match.id} 매칭 수락 클릭`);
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function Buttons({
  memberId,
  onRejectClick,
  onAcceptClick,
}: {
  memberId: number;
  onRejectClick: () => void;
  onAcceptClick: () => void;
}) {
  const router = useRouter();
  const matchId = Number(router.query.basicMatchId);

  assert(!Number.isNaN(matchId), "matchId should be a number");

  const utils = api.useUtils();
  const { mutateAsync: reject, isPending: isRejecting } =
    api.basicMatchRouter.reject.useMutation({
      onSuccess: () => {
        return utils.basicMatchRouter.invalidate();
      },
    });
  const { mutateAsync: accept, isPending: isAccepting } =
    api.basicMatchRouter.accept.useMutation({
      onSuccess: () => {
        return utils.basicMatchRouter.invalidate();
      },
    });

  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
      <span className="text-center text-sm text-gray-600">
        ※ 24시간 이상 무응답 시 휴면회원으로 전환합니다
      </span>
      <div className="flex w-full gap-4">
        <button
          className="flex-1 rounded-lg bg-gray-500 p-3 text-xl font-medium text-white enabled:hover:bg-gray-600 disabled:cursor-not-allowed"
          onClick={async () => {
            onRejectClick();
            await reject({
              memberId,
              matchId,
            });
            alert("거절하셨습니다. 더 잘 맞는 분을 찾아 드릴게요.");
            void router.push("/my-matches");
          }}
          disabled={isRejecting || isAccepting}
        >
          {isRejecting ? "처리중.." : "거절"}
        </button>
        <button
          className="flex-1 rounded-lg bg-primary-500 p-3 text-xl font-medium text-white enabled:hover:bg-primary-700 disabled:cursor-not-allowed"
          onClick={async () => {
            onAcceptClick();
            await accept({
              memberId,
              matchId,
            });
            alert("수락하셨습니다. 성사되면 호스트가 연락 드릴게요!");
            void router.push("/my-matches");
          }}
          disabled={isAccepting || isRejecting}
        >
          {isAccepting ? "처리중.." : "수락"}
        </button>
      </div>
    </div>
  );
}

MyMatchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="상대방 프로필">{page}</Layout>;
};
