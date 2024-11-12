import { assert } from "@ieum/utils";

import { useConfirmDialog } from "~/hooks/useConfirmDialog";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function DeleteMemberSection() {
  const { member, signOut } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { open: confirm } = useConfirmDialog();
  const utils = api.useUtils();
  const { mutateAsync: deleteMember } =
    api.blindMemberRouter.deleteMember.useMutation({
      onSuccess: async () => {
        await signOut();

        return utils.invalidate();
      },
    });

  return (
    <div className="flex justify-center">
      <button
        className="text-sm text-red-500"
        onClick={async () => {
          const confirmed = await confirm({
            title: "정말 탈퇴하시겠어요?",
            description: "2주 동안 재가입할 수 없습니다.",
            confirmationButtonProps: {
              className: "bg-red-500 text-white flex-1",
            },
          });

          if (confirmed) {
            await deleteMember({ memberId: member.id });
          }
        }}
      >
        탈퇴
      </button>
    </div>
  );
}
