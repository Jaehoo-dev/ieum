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

  console.log(Array(heartsLeft));

  return (
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
  );
}
