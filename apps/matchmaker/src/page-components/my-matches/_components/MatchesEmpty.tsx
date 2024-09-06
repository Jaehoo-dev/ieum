import { ComponentPropsWithoutRef } from "react";
import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";

export const MatchesEmpty = {
  Basic: BasicMatchesEmpty,
  Receiver: MegaphoneMatchesAsReceiverEmpty,
  Sender: MegaphoneMatchesAsSenderEmpty,
} as const;

function BasicMatchesEmpty() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  return match(member.status)
    .with(MemberStatus.ACTIVE, () => {
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
    .otherwise(() => {
      throw new Error("Invalid member status");
    });
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
      <Text>선수락 받은 매칭이</Text>
      <Text>아직 없어요 📭</Text>
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
