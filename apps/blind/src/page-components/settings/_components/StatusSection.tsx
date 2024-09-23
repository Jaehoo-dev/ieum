import { Gender, MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function StatusSectionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [memberStatus] = api.blindMemberRouter.getStatus.useSuspenseQuery({
    memberId: member.id,
  });

  return match(memberStatus)
    .with(MemberStatus.PENDING, () => <Pending />)
    .with(MemberStatus.ACTIVE, () => <Active />)
    .with(MemberStatus.INACTIVE, () => <Inactive />)
    .exhaustive();
}

function Pending() {
  return (
    <div className="flex flex-col gap-4">
      <Title />
      <p className="text-lg text-gray-700">심사 중 📃</p>
    </div>
  );
}

function Active() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const utils = api.useUtils();
  const { mutateAsync: inactivate, isPending: isRequesting } =
    api.blindMemberRouter.inactivate.useMutation({
      onSuccess: () => {
        return utils.blindMemberRouter.getStatus.invalidate();
      },
    });

  return (
    <div className="flex flex-col gap-4">
      <Title />
      <div className="flex items-center justify-between">
        <p className="text-lg text-gray-700">
          {`활동 중 ${match(member.gender)
            .with(Gender.MALE, () => {
              return "🏃‍♂️";
            })
            .with(Gender.FEMALE, () => {
              return "🏃‍♀️";
            })
            .exhaustive()}`}
        </p>
        <button
          className="rounded-lg bg-blind-500 px-5 py-2 text-center text-white hover:bg-blind-700 disabled:opacity-50"
          onClick={async () => {
            try {
              await inactivate({ memberId: member.id });
            } catch (error) {
              alert(
                "휴면 처리 중 오류가 발생했습니다. 호스트에게 문의해주세요.",
              );
            }
          }}
          disabled={isRequesting}
        >
          {isRequesting ? "처리 중.." : "휴면"}
        </button>
      </div>
    </div>
  );
}

function Inactive() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const utils = api.useUtils();
  const { mutateAsync: activate, isPending: isRequesting } =
    api.blindMemberRouter.activate.useMutation({
      onSuccess: () => {
        return utils.blindMemberRouter.getStatus.invalidate();
      },
    });

  return (
    <div className="flex flex-col gap-4">
      <Title />
      <div className="flex items-center justify-between">
        <p className="text-lg text-gray-700">휴면 😴</p>
        <button
          className="rounded-lg bg-blind-500 px-5 py-2 text-center text-white hover:bg-blind-700 disabled:opacity-50"
          onClick={async () => {
            try {
              await activate({ memberId: member.id });
            } catch (error) {
              alert("활성화 중 오류가 발생했습니다. 호스트에게 문의해주세요.");
            }
          }}
          disabled={isRequesting}
        >
          {isRequesting ? "처리 중.." : "활성화"}
        </button>
      </div>
    </div>
  );
}

function Title() {
  return <h2 className="text-xl font-semibold text-gray-700">내 계정 상태</h2>;
}
