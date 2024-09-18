import { ComponentPropsWithoutRef } from "react";
import { assert } from "@ieum/utils";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function ResolvedPreRegisterButton() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const utils = api.useUtils();
  const [hasPreRegistered] = api.blindRouter.hasPreRegistered.useSuspenseQuery({
    memberId: member.id,
  });
  const { mutateAsync: preRegister, isPending } =
    api.blindRouter.preRegister.useMutation({
      onSuccess: () => {
        return utils.blindRouter.hasPreRegistered.invalidate();
      },
    });

  return (
    <StyledButton
      onClick={async () => {
        await preRegister({ memberId: member.id });
        alert("사전 신청을 완료했습니다. 연락드릴게요!");
      }}
      disabled={hasPreRegistered || isPending}
    >
      {hasPreRegistered ? "사전 신청 완료" : "사전 신청"}
    </StyledButton>
  );
}

ResolvedPreRegisterButton.Skeleton = function ButtonSkeleton() {
  return <StyledButton disabled={true}>사전 신청</StyledButton>;
};

function StyledButton(props: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className="w-full rounded-lg bg-blind-500 p-3 text-lg font-medium text-white hover:enabled:bg-blind-700 disabled:opacity-50"
      {...props}
    />
  );
}
