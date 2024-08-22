import { ReactElement, Suspense, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { HOMEPAGE_URL } from "@ieum/constants";
import { assert } from "@ieum/utils";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DiscountRoundedIcon from "@mui/icons-material/DiscountRounded";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";

export function ReferralCodePage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-gray-800">
              내 추천인 코드
            </h2>
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
        <hr />
        <Suspense>
          <DiscountCouponCountResolved />
        </Suspense>
      </div>
    </>
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
    sendMessage({
      content: `${formatUniqueMemberName(member)} - 내 추천인 코드 페이지 진입`,
    });
  }, [member.name]);

  return (
    <div
      className="flex w-full cursor-pointer flex-row items-center justify-between px-4 py-3"
      onClick={async () => {
        sendMessage({
          content: `${formatUniqueMemberName(member)} - 추천인 코드 복사`,
        });
        await navigator.clipboard.writeText(referralCode);
        alert("추천인 코드를 복사했습니다.");
      }}
    >
      <p className="text-lg font-semibold text-gray-800">{referralCode}</p>
      <Copy />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex w-full cursor-not-allowed flex-row items-center justify-between p-4">
      <p className="text-lg font-semibold text-gray-800">...</p>
      <Copy />
    </div>
  );
}

function Copy() {
  return (
    <span className="flex flex-row items-center gap-1 text-gray-600">
      <ContentCopyRoundedIcon fontSize="small" />
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
        <p>
          {"추천인 코드를 "}
          <Link
            className="underline"
            href={HOMEPAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            서비스 소개 링크
          </Link>
          {"와 함께 공유해 주세요! 온라인 커뮤니티에 올리셔도 좋아요."}
        </p>
        <p>
          {`추천인 코드로 신규 회원이 가입을 완료하면 ${member.name} 님께 `}
          <span className="text-primary-500">현금 1만 원</span>
          {`을 드립니다. 10명이 가입하면 10만 원!`}
        </p>
      </div>
    </div>
  );
}

function DiscountCouponCountResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [couponCount] =
    api.basicMemberRouter.getDiscountCouponCount.useSuspenseQuery({
      memberId: member.id,
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-medium text-gray-800">내 쿠폰</h2>
        <span className="text-gray-500">{couponCount}개</span>
      </div>
      {Array.from({ length: couponCount }).map((_, index) => {
        return (
          <div key={index} className="flex flex-row items-center gap-3">
            <DiscountRoundedIcon
              className="text-primary-500"
              fontSize="small"
            />
            <div>
              <p className="font-semibold text-gray-700">
                이음비 50% 할인 쿠폰
              </p>
              <p className="text-sm text-gray-500">
                이음비 결제 전에 사용을 요청해주세요.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

ReferralCodePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="추천인 코드">{page}</Layout>;
};
