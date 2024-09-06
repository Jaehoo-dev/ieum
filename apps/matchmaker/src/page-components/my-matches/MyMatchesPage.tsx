import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { assert } from "@ieum/utils";
import { match as matchPattern } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { TipsMenuLink } from "~/components/TipsMenuLink";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";
import { ActiveBasicMatchesSectionResolved } from "./_components/basic/ActiveBasicMatchesSectionResolved";
import { PastBasicMatchesSectionResolved } from "./_components/basic/PastBasicMatchesSectionResolved";
import { MatchTypeTabs } from "./_components/MatchTypeTabs";
import { ActiveMegaphoneMatchesSectionAsReceiverResolved } from "./_components/megaphone/ActiveMegaphoneMatchesSectionAsReceiverResolved";
import { ActiveMegaphoneMatchesSectionAsSenderResolved } from "./_components/megaphone/ActiveMegaphoneMatchesSectionAsSenderResolved";
import { PastMegaphoneMatchesAsReceiverSectionResolved } from "./_components/megaphone/PastMegaphoneMatchesAsReceiverSectionResolved";
import { PastMegaphoneMatchesAsSenderSectionResolved } from "./_components/megaphone/PastMegaphoneMatchesAsSenderSectionResolved";
import { 조회용_매치_유형 } from "./_enums";

export function MyMatchesPage() {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const matchType =
    (router.query.matchType as 조회용_매치_유형) ?? 조회용_매치_유형.BASIC;
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(
        member,
      )} - ${matchType} 목록 페이지 진입`,
    });
  }, [member.name, sendMessage]);

  const { data: activeBasicMatches = [] } =
    api.basicMatchRouter.findActiveMatchesByMemberId.useQuery({
      memberId: member.id,
    });
  const { data: activeMegaphoneMatchesAsReceiver = [] } =
    api.megaphoneMatchRouter.findActiveMatchesAsReceiverByMemberId.useQuery({
      memberId: member.id,
    });
  const { data: activeMegaphoneMatchesAsSender } =
    api.megaphoneMatchRouter.findActiveMatchesAsSenderByMemberId.useQuery(
      { memberId: member.id },
      { enabled: member.isMegaphoneUser },
    );

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex w-full flex-col items-center gap-6">
        <MatchTypeTabs
          value={matchType}
          onChange={(value) => {
            router.replace({
              query: {
                ...router.query,
                matchType: value,
              },
            });
          }}
          senderTab={member.isMegaphoneUser}
          basicMatchNotification={activeBasicMatches.length > 0}
          receiverNotification={activeMegaphoneMatchesAsReceiver.length > 0}
          senderNotification={
            activeMegaphoneMatchesAsSender != null &&
            activeMegaphoneMatchesAsSender?.length > 0
          }
        />
        <Suspense
          fallback={
            <div className="mb-10 mt-16 flex w-full justify-center">
              <Loader />
            </div>
          }
        >
          <div className="flex w-full flex-col items-center gap-4">
            {matchPattern(matchType)
              .with(조회용_매치_유형.BASIC, () => {
                return (
                  <>
                    <ActiveBasicMatchesSectionResolved />
                    <PastBasicMatchesSectionResolved />
                  </>
                );
              })
              .with(조회용_매치_유형.MEGAPHONE_RECEIVER, () => {
                return (
                  <>
                    <ActiveMegaphoneMatchesSectionAsReceiverResolved />
                    <PastMegaphoneMatchesAsReceiverSectionResolved />
                  </>
                );
              })
              .with(조회용_매치_유형.MEGAPHONE_SENDER, () => {
                return activeMegaphoneMatchesAsSender != null ? (
                  <>
                    <ActiveMegaphoneMatchesSectionAsSenderResolved />
                    <PastMegaphoneMatchesAsSenderSectionResolved />
                  </>
                ) : null;
              })
              .exhaustive()}
          </div>
        </Suspense>
        <div className="my-4 flex justify-center">
          <TipsMenuLink />
        </div>
      </div>
    </>
  );
}

MyMatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 목록">{page}</Layout>;
};
