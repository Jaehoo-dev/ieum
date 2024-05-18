import type { ReactElement } from "react";
import { Gender } from "@ieum/prisma";

import { BlindMemberCard } from "~/components/blind/BlindMemberCard";
import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function BlindMembersPage() {
  const { data: maleMembers } = api.blindMemberRouter.findAllByGender.useQuery({
    gender: Gender.MALE,
  });
  const { data: femaleMembers } =
    api.blindMemberRouter.findAllByGender.useQuery({
      gender: Gender.FEMALE,
    });

  return (
    <div className="mt-6 flex min-h-screen flex-col items-center gap-6 py-2">
      <h1 className="text-4xl font-semibold">블라인드 회원 목록</h1>
      <div
        className="flex w-full justify-center gap-10"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <div className="flex w-5/12 flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">남성</h1>
          {maleMembers?.map((member) => {
            return <BlindMemberCard key={member.id} member={member} />;
          })}
        </div>
        <div className="flex w-5/12 flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">여성</h1>
          {femaleMembers?.map((member) => {
            return <BlindMemberCard key={member.id} member={member} />;
          })}
        </div>
      </div>
    </div>
  );
}

BlindMembersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
