import {
  ComponentPropsWithoutRef,
  ReactElement,
  Suspense,
  useEffect,
  useState,
} from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { BlindMatchStatus } from "@ieum/prisma";
import { BlindProfile } from "@ieum/profile";
import { assert } from "@ieum/utils";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { Spacing } from "~/components/Spacing";
import { useConfirmDialog } from "~/hooks/useConfirmDialog";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { ChatUrlFormFormDialog } from "./_components/ChatUrlFormDialog";

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

  if (
    (match != null && match.expiresAt < new Date()) ||
    match?.status === BlindMatchStatus.REJECTED
  ) {
    router.replace("/members");
  }

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
            <ChatUrlSection
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

function ChatUrlSection({
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
  assert(match.kakaoOpenchatUrl != null, "Should have kakaoOpenchatUrl");

  return (
    <div className="mt-1 flex flex-col items-center">
      <span className="font-medium text-gray-800">
        카카오톡 오픈채팅방 링크
      </span>
      <Link
        href={match.kakaoOpenchatUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex cursor-pointer items-center gap-1 text-blind-500"
      >
        <span className="underline">{match.kakaoOpenchatUrl}</span>
        <OpenInNewRoundedIcon className="mb-0.5 text-sm" />
      </Link>
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
    return <AcceptButton selfMemberId={self.id} matchId={match.id} />;
  }
}

function AcceptButton({
  selfMemberId,
  matchId,
}: {
  selfMemberId: string;
  matchId: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const utils = api.useUtils();
  const { mutateAsync: accept } = api.blindMatchRouter.accept.useMutation({
    onSuccess: () => {
      return Promise.all([
        utils.blindMatchRouter.invalidate(),
        utils.blindMemberRouter.invalidate(),
      ]);
    },
  });

  return (
    <>
      <div className="fixed bottom-0 left-0 flex w-full justify-center border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
        <div className="flex w-full max-w-lg flex-col gap-2 md:px-2">
          <span className="text-center text-sm text-gray-500">
            ※ 상대방이 먼저 하트를 보냈어요.
          </span>
          <LikeButton
            onClick={() => {
              setIsDialogOpen(true);
            }}
          >
            <FavoriteIcon className="mb-0.5" />
            <span>하트 보내기</span>
          </LikeButton>
        </div>
      </div>
      <ChatUrlFormFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onSubmit={async (kakaoOpenchatUrl) => {
          await accept({
            selfMemberId,
            matchId,
            kakaoOpenchatUrl,
          });
          alert(
            "성사되었어요. 상대방에게 오픈채팅방 링크와 함께 알림을 보냈어요.",
          );
        }}
      />
    </>
  );
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
