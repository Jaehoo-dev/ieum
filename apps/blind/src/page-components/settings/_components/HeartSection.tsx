import { DEFAULT_HEART_COUNT } from "@ieum/constants";
import { assert } from "@ieum/utils";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function HeartSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [heartsLeft] = api.blindMemberRouter.getHeartCount.useSuspenseQuery({
    memberId: member.id,
  });

  return (
    <div className="flex flex-col gap-4 text-gray-700">
      <div className="flex items-center justify-between text-gray-700">
        <h2 className="text-xl font-semibold">하트</h2>
        <div className="flex items-center gap-2">
          <span>
            {Array.from({ length: heartsLeft }).map((_, index) => {
              return (
                <FavoriteIcon key={index} className="mb-0.5 text-blind-500" />
              );
            })}
          </span>
          <span>{`${heartsLeft}개`}</span>
        </div>
      </div>
      <div className="flex w-full items-start gap-1">
        <p className="text-sm text-gray-500">※</p>
        <p className="text-sm text-gray-500">
          {`하트는 매주 월요일 오전에 ${DEFAULT_HEART_COUNT}개씩 생겨요.`}
        </p>
      </div>
    </div>
  );
}
