import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import {
  MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS,
  MEGAPHONE_MATCH_SENDER_DURATION_HOURS,
  확성기_매치_참가자_유형,
} from "@ieum/constants";
import { MatchStatus } from "@ieum/prisma";
import { Profile } from "@ieum/profile";
import { assert, formatUniqueMemberName, krToKrHyphen } from "@ieum/utils";
import { match } from "ts-pattern";

import { KakaoBrowserOnly } from "~/components/KakaoBrowserOnly";
import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { Warning } from "~/components/Warning";
import { useConfirmDialog } from "~/hooks/useConfirmDialog";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { KakaoBrowserFallback } from "../../_components/KakaoBrowserFallback";
import { 조회용_매치_유형 } from "../../_enums";

export function MegaphoneMatchPage() {
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

  if (router.query.megaphoneMatchId == null) {
    return null;
  }

  async function handleRouterReplace() {
    return router.replace({
      pathname: "/my-matches",
      query: {
        matchType:
          selfMemberType === 확성기_매치_참가자_유형.SENDER
            ? 조회용_매치_유형.MEGAPHONE_SENDER
            : 조회용_매치_유형.MEGAPHONE_RECEIVER,
      },
    });
  }

  const matchId = router.query.megaphoneMatchId as string;
  const [
    { selfMemberType, isSelfMemberPending, matchStatus, targetMemberProfile },
  ] = api.megaphoneMatchRouter.getMatchData.useSuspenseQuery({
    matchId,
    selfMemberId: member.id,
  });
  const utils = api.useUtils();
  const { mutateAsync: reject, isPending: isRejecting } =
    api.megaphoneMatchRouter.reject.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { mutateAsync: accept, isPending: isAccepting } =
    api.megaphoneMatchRouter.accept.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { open: confirm } = useConfirmDialog();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(
        member,
      )} - ${matchId} 확성기 매치 페이지 진입 / ${
        targetMemberProfile.id
      } 프로필 조회`,
    });
  }, [matchId, member, sendMessage, targetMemberProfile]);

  const forbidden =
    matchStatus === MatchStatus.REJECTED ||
    (matchStatus === MatchStatus.PENDING && !isSelfMemberPending);

  useEffect(() => {
    if (forbidden) {
      void sendMessage({
        content: `${formatUniqueMemberName(
          member,
        )} - ${matchId} 확성기 매치 페이지 -> redirect to /my-matches`,
      });

      handleRouterReplace();
    }
  }, [forbidden, isSelfMemberPending, matchId, member, router, sendMessage]);

  if (forbidden) {
    return null;
  }

  return (
    <div className="flex w-full flex-col">
      <Warning />
      <Spacing size={16} />
      <Profile
        profile={targetMemberProfile}
        nameWatermark={member.name}
        numberWatermark={krToKrHyphen(member.phoneNumber)}
      />
      <Spacing size={108} />
      {isSelfMemberPending ? (
        <Buttons
          selfMemberType={selfMemberType}
          rejectButton={{
            onClick: async () => {
              sendMessage({
                content: `${formatUniqueMemberName(
                  member,
                )} - ${matchId} 확성기 매치 거절 클릭`,
              });

              const confirmed = await confirm({
                title: "거절하시겠습니까?",
                description: "번복할 수 없습니다.",
              });

              if (!confirmed) {
                return;
              }

              await reject({
                matchId,
                actionMemberId: member.id,
              });
              alert("거절하셨습니다. 더 잘 맞는 분을 찾아 드릴게요.");
              await handleRouterReplace();
            },
            isPending: isRejecting,
          }}
          acceptButton={{
            onClick: async () => {
              sendMessage({
                content: `${formatUniqueMemberName(
                  member,
                )} - ${matchId} 확성기 매치 수락 클릭`,
              });

              const confirmed = await confirm({
                title: "수락하시겠습니까?",
                description: match(selfMemberType)
                  .with(확성기_매치_참가자_유형.SENDER, () => {
                    return "번복 시 불이익을 받을 수 있습니다.";
                  })
                  .with(확성기_매치_참가자_유형.RECEIVER, () => {
                    return "이후 상대방 의사를 확인합니다. 번복 시 불이익을 받을 수 있습니다.";
                  })
                  .exhaustive(),
              });

              if (!confirmed) {
                return;
              }

              await accept({
                matchId,
                actionMemberId: member.id,
              });

              alert(
                match(selfMemberType)
                  .with(확성기_매치_참가자_유형.SENDER, () => {
                    return "성사되었습니다! 호스트가 연락드릴게요.";
                  })
                  .with(확성기_매치_참가자_유형.RECEIVER, () => {
                    return "수락하셨습니다. 성사되면 호스트가 연락드릴게요!";
                  })
                  .exhaustive(),
              );
              await handleRouterReplace();
            },
            isPending: isAccepting,
          }}
        />
      ) : null}
    </div>
  );
}

function Buttons({
  selfMemberType,
  rejectButton,
  acceptButton,
}: {
  selfMemberType: 확성기_매치_참가자_유형;
  rejectButton: {
    onClick: () => void;
    isPending: boolean;
  };
  acceptButton: {
    onClick: () => void;
    isPending: boolean;
  };
}) {
  const disabled = rejectButton.isPending || acceptButton.isPending;
  const durationHours = match(selfMemberType)
    .with(확성기_매치_참가자_유형.SENDER, () => {
      return MEGAPHONE_MATCH_SENDER_DURATION_HOURS;
    })
    .with(확성기_매치_참가자_유형.RECEIVER, () => {
      return MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS;
    })
    .exhaustive();

  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
      <span className="text-center text-sm text-gray-600">
        {`※ ${durationHours}시간 무응답 시 휴면회원으로 전환합니다`}
      </span>
      <div className="flex w-full gap-3">
        <button
          className="flex-1 rounded-lg bg-gray-500 p-3 text-lg text-white enabled:hover:bg-gray-600 disabled:cursor-not-allowed"
          onClick={rejectButton.onClick}
          disabled={disabled}
        >
          {rejectButton.isPending ? "처리중.." : "거절"}
        </button>
        <button
          className="flex-1 rounded-lg bg-primary-500 p-3 text-lg text-white enabled:hover:bg-primary-700 disabled:cursor-not-allowed"
          onClick={acceptButton.onClick}
          disabled={disabled}
        >
          {acceptButton.isPending ? "처리중.." : "수락"}
        </button>
      </div>
    </div>
  );
}

MegaphoneMatchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="상대방 프로필">{page}</Layout>;
};
