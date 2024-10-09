import { SLACK_MANAGER1_ID_MENTION } from "@ieum/slack";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { Checkbox as _Checkbox, Checkbox } from "~/components/ui/checkbox";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { 조회용_매치_유형 } from "~/page-components/my-matches/_enums";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MatchTypeSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const utils = api.useUtils();
  const { data: isMegaphoneUser } =
    api.basicMemberRouter.isMegaphoneUser.useQuery({
      memberId: member.id,
    });
  const { mutate: updateIsMegaphoneUser } =
    api.basicMemberRouter.updateIsMegaphoneUser.useMutation({
      onMutate: async (variables) => {
        await utils.basicMemberRouter.isMegaphoneUser.cancel();
        utils.basicMemberRouter.isMegaphoneUser.setData(
          { memberId: member.id },
          variables.isMegaphoneUser,
        );
      },
      onSettled: () => {
        return utils.basicMemberRouter.isMegaphoneUser.invalidate();
      },
    });
  const { sendMessage } = useSlackNotibot();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-700">매치 유형</h2>
      <div className="flex flex-col gap-2">
        <Checkbox
          id={조회용_매치_유형.BASIC}
          label="기본 - 프로필을 동시에 맞교환해요."
          checked={true}
          disabled={true}
        />
        <Checkbox
          id={조회용_매치_유형.MEGAPHONE_RECEIVER}
          label={`먼저 받기 - ${member.name} 님이 이상형 조건에 부합하는 분의 프로필을 먼저 받아요.`}
          checked={true}
          disabled={true}
        />
        <Checkbox
          id={조회용_매치_유형.MEGAPHONE_SENDER}
          label={`먼저 보내기 - ${member.name} 님의 이상형 조건에 부합하는 분에게 프로필을 먼저 보여줘요. 노출을 늘려 인연을 더 빨리 찾아요.`}
          checked={Boolean(isMegaphoneUser)}
          onCheckedChange={(checked: boolean) => {
            sendMessage({
              channel: "폼_제출_알림",
              content: `${formatUniqueMemberName(member)} - [먼저 보내기] ${
                checked ? "켬" : "끔"
              } ${SLACK_MANAGER1_ID_MENTION}`,
            });
            updateIsMegaphoneUser({
              memberId: member.id,
              isMegaphoneUser: checked,
            });
          }}
        />
      </div>
    </div>
  );
}
