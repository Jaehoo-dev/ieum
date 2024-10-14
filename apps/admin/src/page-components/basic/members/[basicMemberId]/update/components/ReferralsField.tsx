import { useRouter } from "next/router";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

export function ReferralsField() {
  const router = useRouter();

  const basicMemberId = router.query.basicMemberId;

  assert(basicMemberId != null, "basicMemberId should be provided");

  const { data: referrals } = api.basicMemberRouter.getReferrals.useQuery({
    memberId: basicMemberId as string,
  });

  return (
    <TextInput
      label="이 회원 추천으로 가입한 회원 목록"
      value={referrals
        ?.map((member) => {
          return formatUniqueMemberName(member);
        })
        .join(", ")}
      disabled={true}
    />
  );
}
