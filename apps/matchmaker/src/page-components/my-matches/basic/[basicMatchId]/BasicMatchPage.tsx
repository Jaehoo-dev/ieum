import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { Profile } from "@ieum/profile";
import { assert, krToKrHyphen } from "@ieum/utils";

import { KakaoBrowserOnly } from "~/components/KakaoBrowserOnly";
import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { Warning } from "~/components/Warning";
import { useConfirmDialog } from "~/hooks/useConfirmDialog";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";
import { KakaoBrowserFallback } from "../../components/KakaoBrowserFallback";

export function BasicMatchPage() {
  return (
    <KakaoBrowserOnly fallback={<KakaoBrowserFallback />}>
      <Suspense fallback={null}>
        <Resolved />
      </Suspense>
    </KakaoBrowserOnly>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const router = useRouter();

  if (router.query.basicMatchId == null) {
    return null;
  }

  const matchId = router.query.basicMatchId as string;

  const [profile] =
    api.basicMatchRouter.getMatchTargetMemberProfile.useSuspenseQuery({
      selfMemberId: member.id,
      matchId,
    });
  const [match] = api.basicMatchRouter.getMatchById.useSuspenseQuery({
    matchId,
  });

  const isPendingByMember = match.pendingByV2.some(({ id }) => {
    return id === member.id;
  });

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(member)} - ${
        match.id
      } 매칭 페이지 진입 / ${profile.id} 프로필 조회`,
    });
  }, [match.id, member.name, profile.id, sendMessage]);

  useEffect(() => {
    if (isPendingByMember || match.acceptedByV2.length === 2) {
      return;
    }

    void sendMessage({
      content: `${formatUniqueMemberName(member)} - ${
        match.id
      } 매칭 페이지 진입 -> redirect to /my-matches`,
    });

    router.replace("/my-matches");
  }, [
    isPendingByMember,
    match.acceptedByV2.length,
    match.id,
    member.name,
    router,
    sendMessage,
  ]);

  return (
    <div className="flex w-full flex-col">
      <Warning />
      <Spacing size={16} />
      <Profile
        profile={profile}
        nameWatermark={member.name}
        numberWatermark={krToKrHyphen(member.phoneNumber)}
      />
      <Spacing size={108} />
      {isPendingByMember ? (
        <Buttons
          memberId={member.id}
          onRejectClick={() => {
            void sendMessage({
              content: `${formatUniqueMemberName(member)} - ${
                match.id
              } 매칭 거절 클릭`,
            });
          }}
          onAcceptClick={() => {
            void sendMessage({
              content: `${formatUniqueMemberName(member)} - ${
                match.id
              } 매칭 수락 클릭`,
            });
          }}
        />
      ) : null}
    </div>
  );
}

function Buttons({
  memberId,
  onRejectClick,
  onAcceptClick,
}: {
  memberId: string;
  onRejectClick: () => void;
  onAcceptClick: () => void;
}) {
  const router = useRouter();
  const matchId = router.query.basicMatchId as string;
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
  const { open: confirm } = useConfirmDialog();

  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
      <span className="text-center text-sm text-gray-600">
        ※ 24시간 이상 무응답 시 휴면회원으로 전환합니다
      </span>
      <div className="flex w-full gap-3">
        <button
          className="flex-1 rounded-lg bg-gray-500 p-3 text-xl font-medium text-white enabled:hover:bg-gray-600 disabled:cursor-not-allowed"
          onClick={async () => {
            onRejectClick();

            const confirmed = await confirm({
              title: "거절하시겠습니까?",
              description: "번복 시 불이익을 받을 수 있습니다.",
            });

            if (!confirmed) {
              return;
            }

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

            const confirmed = await confirm({
              title: "수락하시겠습니까?",
              description: "번복 시 불이익을 받을 수 있습니다.",
            });

            if (!confirmed) {
              return;
            }

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

BasicMatchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="상대방 프로필">{page}</Layout>;
};
