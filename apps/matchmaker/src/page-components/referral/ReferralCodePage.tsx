import { ReactElement, Suspense, useEffect } from "react";
import { assert } from "@ieum/utils";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";

export function ReferralCodePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium text-gray-800">내 추천인 코드</h2>
        <div className="rounded-lg border border-primary-500">
          <Suspense fallback={<Skeleton />}>
            <Resolved />
          </Suspense>
        </div>
      </div>
      <Suspense>
        <DescriptionResolved />
      </Suspense>
    </div>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [referralCode] = api.basicMemberRouter.getReferralCode.useSuspenseQuery(
    { memberId: member.id },
  );
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage(
      `${formatUniqueMemberName(member)} - 내 추천인 코드 페이지 진입`,
    );
  }, [member.name]);

  return (
    <div
      className="flex w-full cursor-pointer flex-row items-center justify-between p-4"
      onClick={async () => {
        sendMessage(`${formatUniqueMemberName(member)} - 추천인 코드 복사`);
        await navigator.clipboard.writeText(referralCode);
        alert("추천인 코드를 복사했습니다.");
      }}
    >
      <p className="text-xl font-semibold text-gray-800">{referralCode}</p>
      <Copy />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex w-full cursor-not-allowed flex-row items-center justify-between p-4">
      <p className="text-xl font-semibold text-gray-800">...</p>
      <Copy />
    </div>
  );
}

function Copy() {
  return (
    <span className="flex flex-row items-center gap-1 text-gray-600">
      <ContentCopyRoundedIcon />
      <p>복사</p>
    </span>
  );
}

function DescriptionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  return (
    <div className="flex w-full items-start gap-1.5 text-sm text-gray-600">
      <p>※</p>
      <div>
        <p>추천인 코드를 공유해 보세요!</p>
        <p>
          {`${member.name} 님의 추천인 코드로 신규 회원이 가입을 완료하면 ${member.name} 님과 신규 회원님 모두에게 만남권 50% 할인권을 드립니다.`}
        </p>
      </div>
    </div>
  );
}

ReferralCodePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="추천인 코드">{page}</Layout>;
};
