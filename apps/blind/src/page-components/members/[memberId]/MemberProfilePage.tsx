import {
  ComponentPropsWithoutRef,
  ReactElement,
  Suspense,
  useEffect,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { BlindMatchStatus } from "@ieum/prisma";
import { BlindProfile } from "@ieum/profile";
import { assert } from "@ieum/utils";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { Spacing } from "~/components/Spacing";
import { useConfirmDialog } from "~/hooks/useConfirmDialog";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MemberProfilePage() {
  const router = useRouter();
  const memberId = router.query.memberId;

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      {memberId != null ? (
        <Suspense
          fallback={
            <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          <Resolved memberId={memberId as string} />
        </Suspense>
      ) : null}
    </>
  );
}

function Resolved({ memberId: targetMemberId }: { memberId: string }) {
  const router = useRouter();
  const { member: self } = useMemberAuthContext();

  assert(self != null, "Component should be used within MemberAuthGuard");
  assert(self.id !== targetMemberId, "Should not be self");

  const [profile] = api.blindMemberRouter.getProfile.useSuspenseQuery({
    memberId: targetMemberId,
  });

  assert(self.gender !== profile.gender, "Only supports straight matching");

  const [match] = api.blindMatchRouter.getMatchInfo.useSuspenseQuery({
    selfMemberId: self.id,
    targetMemberId,
  });

  useEffect(() => {
    if (match == null) {
      return;
    }

    if (match.expiresAt < new Date()) {
      router.replace("/members");
    }
  }, [match?.expiresAt, router]);

  useEffect(() => {
    if (match?.status === BlindMatchStatus.REJECTED) {
      router.replace("/members");
    }
  }, [match, router]);

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: `${self.id} - ${profile.id} 프로필 조회`,
    });
  }, [self, profile.id, sendMessage]);

  return (
    <div className="flex w-full flex-col gap-4">
      {match != null ? (
        <div className="flex flex-col gap-4">
          <MatchInfo targetMemberId={targetMemberId} />
          {match.status === BlindMatchStatus.ACCEPTED ? (
            <KakaotalkIdSection
              selfMemberId={self.id}
              targetMemberId={targetMemberId}
            />
          ) : null}
          <hr />
        </div>
      ) : null}
      <BlindProfile profile={profile} />
      <Spacing size={108} />
      <ButtonsField targetMemberId={targetMemberId} />
    </div>
  );
}

function KakaotalkIdSection({
  selfMemberId,
  targetMemberId,
}: {
  selfMemberId: string;
  targetMemberId: string;
}) {
  const [match] = api.blindMatchRouter.getMatchInfo.useSuspenseQuery({
    selfMemberId,
    targetMemberId,
  });

  assert(match != null, "Should have been matched");
  assert(match.status === BlindMatchStatus.ACCEPTED, "Should be accepted");

  const [kakaotalkId] = api.blindMemberRouter.getKakaotalkId.useSuspenseQuery({
    memberId: targetMemberId,
  });

  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-gray-700">카카오톡 ID</span>
      <span
        className="flex cursor-pointer items-center gap-0.5 rounded-lg bg-gray-200 px-4 py-2 text-lg font-semibold text-blind-500"
        onClick={() => {
          navigator.clipboard.writeText(kakaotalkId);
          alert("카카오톡 아이디를 복사했어요.");
        }}
      >
        <span>{kakaotalkId}</span>
        <ContentCopyRoundedIcon fontSize="small" />
      </span>
    </div>
  );
}

function MatchInfo({ targetMemberId }: { targetMemberId: string }) {
  const { member: self } = useMemberAuthContext();

  assert(self != null, "Component should be used within MemberAuthGuard");

  const [match] = api.blindMatchRouter.getMatchInfo.useSuspenseQuery({
    selfMemberId: self.id,
    targetMemberId,
  });

  assert(match != null, "Should have been matched");
  assert(match.status !== BlindMatchStatus.REJECTED, "Should not be rejected");

  const isProposer =
    match.proposerId === self.id && match.respondentId === targetMemberId;
  const isRespondent =
    match.respondentId === self.id && match.proposerId === targetMemberId;

  assert(isProposer || isRespondent, "Should be either proposer or respondent");

  return (
    <div className="flex w-full items-center gap-2 rounded-lg bg-blind-700 p-4 text-white">
      {match.status === BlindMatchStatus.ACCEPTED ? (
        <p>
          성사되었어요. 🎉
          <br />
          좋은 인연으로 이어지길 기대할게요. 💘
        </p>
      ) : isRespondent ? (
        <p>
          상대방이 먼저 하트를 보냈어요.
          <br />
          하트를 보내면 바로 성사돼요.
        </p>
      ) : (
        <p>
          하트를 보냈어요.
          <br />
          상대방의 응답을 기다리고 있어요.
        </p>
      )}
    </div>
  );
}

function ButtonsField({ targetMemberId }: { targetMemberId: string }) {
  const { member: self } = useMemberAuthContext();

  assert(self != null, "Component should be used within MemberAuthGuard");

  const [match] = api.blindMatchRouter.getMatchInfo.useSuspenseQuery({
    selfMemberId: self.id,
    targetMemberId,
  });
  const selfIsProposer = match != null && match.proposerId === self.id;
  const selfIsRespondent = match != null && match.respondentId === self.id;

  assert(
    match == null || selfIsProposer || selfIsRespondent,
    "Should have not been matched or member should be either proposer or respondent",
  );

  const { open: confirm } = useConfirmDialog();
  const utils = api.useUtils();
  const { mutateAsync: propose } = api.blindMatchRouter.propose.useMutation({
    onSuccess: () => {
      return Promise.all([
        utils.blindMatchRouter.invalidate(),
        utils.blindMemberRouter.invalidate(),
      ]);
    },
  });
  const { mutateAsync: accept } = api.blindMatchRouter.accept.useMutation({
    onSuccess: () => {
      return Promise.all([
        utils.blindMatchRouter.invalidate(),
        utils.blindMemberRouter.invalidate(),
      ]);
    },
  });

  if (match == null) {
    return (
      <div className="fixed bottom-0 left-0 flex w-full flex-col items-center gap-2 border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="w-full max-w-lg px-2">
          <LikeButton
            onClick={async () => {
              const confirmed = await confirm({
                title: "하트를 보내시겠어요?",
                description:
                  "취소할 수 없어요. 상대방도 하트를 보내면 성사됩니다.",
              });

              if (!confirmed) {
                return;
              }

              await propose({
                proposerId: self.id,
                respondentId: targetMemberId,
              });

              alert(
                "하트를 보냈어요. 알림은 매일 오전 9시와 오후 9시에 보냅니다.",
              );
            }}
          >
            <FavoriteIcon className="mb-0.5" />
            <span>하트 보내기</span>
          </LikeButton>
        </div>
      </div>
    );
  }

  if (match.status === BlindMatchStatus.ACCEPTED) {
    return null;
  }

  if (selfIsProposer) {
    return (
      <div className="fixed bottom-0 left-0 flex w-full justify-center border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="flex w-full max-w-lg flex-col gap-2 md:px-2">
          {/* TODO: D-h시간 */}
          <LikeButton disabled={true}>
            <FavoriteIcon className="mb-0.5" />
            <span>하트 발송 완료</span>
          </LikeButton>
        </div>
      </div>
    );
  }

  if (selfIsRespondent) {
    return (
      <div className="fixed bottom-0 left-0 flex w-full justify-center border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
        <div className="flex w-full max-w-lg flex-col gap-2 md:px-2">
          <span className="text-center text-sm text-gray-500">
            ※ 상대방이 먼저 하트를 보냈어요.
          </span>
          <LikeButton
            onClick={async () => {
              const confirmed = await confirm({
                title: "하트를 보내시겠어요?",
                description: "번복할 수 없어요.",
              });

              if (!confirmed) {
                return;
              }

              await accept({
                selfMemberId: self.id,
                matchId: match.id,
              });

              // TODO: alert
            }}
          >
            <FavoriteIcon className="mb-0.5" />
            <span>하트 보내기</span>
          </LikeButton>
        </div>
      </div>
    );
  }
}

function LikeButton(props: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className="flex w-full items-center justify-center gap-1 rounded-lg bg-blind-500 p-3 text-lg text-white enabled:hover:bg-blind-700 disabled:cursor-not-allowed disabled:bg-blind-300"
      {...props}
    />
  );
}

MemberProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="회원 프로필">{page}</Layout>;
};
