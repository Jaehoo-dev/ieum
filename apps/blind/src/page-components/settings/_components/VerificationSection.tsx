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
      <h2 className="text-xl font-semibold">인증 상태</h2>
      <div className="flex w-full items-start gap-1">
        <p className="text-sm text-gray-500">※</p>
        <p className="text-sm text-gray-500">
          인증을 하면 프로필에 인증 배지가 표시됩니다.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-row items-center gap-0.5">
          <span>신분:</span>
          {verificationStatus.id ? (
            <VerifiedIcon className="text-blind-400" fontSize="small" />
          ) : (
            <CancelRoundedIcon className="text-red-500" fontSize="small" />
          )}
        </div>
        <div className="flex flex-row items-center gap-0.5">
          <span>직장:</span>
          {verificationStatus.job ? (
            <VerifiedIcon className="text-blind-400" fontSize="small" />
          ) : (
            <CancelRoundedIcon className="text-red-500" fontSize="small" />
          )}
        </div>
      </div>
    </div>
  );
}
