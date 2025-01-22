import type { ComponentPropsWithoutRef } from "react";
import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export const MatchesEmpty = {
  Basic: BasicMatchesEmpty,
  Receiver: MegaphoneMatchesAsReceiverEmpty,
  Sender: MegaphoneMatchesAsSenderEmpty,
} as const;

function BasicMatchesEmpty() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { data: memberStatus } = api.basicMemberRouter.getStatus.useQuery({
    memberId: member.id,
  });

  return match(memberStatus)
    .with(undefined, MemberStatus.ACTIVE, () => {
      return (
        <Wrapper>
          <Text>이상형을 찾고 있어요 💘</Text>
          <Text>조금만 기다려주세요 🙏</Text>
        </Wrapper>
      );
    })
    .with(MemberStatus.INACTIVE, () => {
      return (
        <Wrapper>
          <Text>휴면 상태예요 😴</Text>
        </Wrapper>
      );
    })
    .with(MemberStatus.PENDING, () => {
      return (
        <Wrapper>
          <Text>계정을 심사 중이에요 📝</Text>
        </Wrapper>
      );
    })
    .exhaustive();
}

function MegaphoneMatchesAsReceiverEmpty() {
  return (
    <Wrapper>
      <Text>새로 도착한 프로필이 없어요 📭</Text>
    </Wrapper>
  );
}

function MegaphoneMatchesAsSenderEmpty() {
  return (
    <Wrapper>
      <Text>이상형을 찾고 있어요 💘</Text>
      <Text>조금만 기다려주세요 🙏</Text>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex w-full flex-col items-center">{children}</div>
  );
}

function Text(props: ComponentPropsWithoutRef<"p">) {
  return <p className="text-xl font-medium text-primary-500" {...props} />;
}
