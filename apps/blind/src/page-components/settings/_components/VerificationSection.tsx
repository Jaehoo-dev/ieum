import { ReactNode } from "react";
import Link from "next/link";
import { assert } from "@ieum/utils";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import VerifiedIcon from "@mui/icons-material/Verified";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function VerificationSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [verificationStatus] =
    api.blindMemberRouter.getVerificationStatus.useSuspenseQuery({
      memberId: member.id,
    });

  return (
    <div className="flex flex-col gap-4 text-gray-700">
      <h2 className="text-xl font-semibold">인증</h2>
      <div className="flex flex-col gap-0.5">
        <Description>인증을 하면 프로필에 인증 배지를 표시합니다.</Description>
        <Description>
          안심하세요! 인증을 해도 인증 내용은 공개하지 않습니다.
        </Description>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* <div className="flex flex-row items-center gap-0.5">
          <span>실명:</span>
          {verificationStatus.name ? <Verified /> : <NotVerified />}
        </div> */}
        <div className="flex flex-row items-center gap-0.5">
          <span>성별:</span>
          {verificationStatus.gender ? <Verified /> : <NotVerified />}
        </div>
        <div className="flex flex-row items-center gap-0.5">
          <span>나이:</span>
          {verificationStatus.age ? <Verified /> : <NotVerified />}
        </div>
        <div className="flex flex-row items-center gap-0.5">
          <span>직장:</span>
          {verificationStatus.job ? <Verified /> : <NotVerified />}
        </div>
      </div>
    </div>
  );
}

function Description({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-1">
      <p className="text-sm text-gray-500">※</p>
      <p className="text-sm text-gray-500">{children}</p>
    </div>
  );
}

function Verified() {
  return <VerifiedIcon className="mb-0.5 text-blind-400" fontSize="small" />;
}

function NotVerified() {
  return (
    <span className="flex items-center gap-1">
      <CancelRoundedIcon className="mb-0.5 text-red-500" fontSize="small" />
      <Link
        href="/settings/verification"
        className="text-sm text-gray-500 underline"
      >
        인증하기
      </Link>
    </span>
  );
}
