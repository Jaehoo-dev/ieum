import type { ReactElement } from "react";
import { Suspense } from "react";
import { useRouter } from "next/router";
import { Gender } from "@ieum/prisma";
import { format } from "date-fns";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function DraftMembersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-2">
      <h1 className="text-2xl font-semibold">신규 가입 회원 목록</h1>
      <Suspense>
        <Resolved />
      </Suspense>
    </div>
  );
}

function Resolved() {
  const [draftMembers] = api.draftBasicMemberRouter.getAll.useSuspenseQuery();
  const router = useRouter();

  return (
    <div className="grid grid-cols-4 gap-2">
      {draftMembers.map((draftMember) => (
        <button
          key={draftMember.id}
          className="flex flex-col rounded-lg bg-gray-200 p-3"
          onClick={() => {
            router.push(`/basic/draft-members/${draftMember.id}`);
          }}
        >
          <span>{format(draftMember.createdAt, "M월d일")}</span>
          <div className="flex flex-row gap-2">
            <span
              className={
                draftMember.gender === Gender.MALE
                  ? "text-blue-500"
                  : "text-pink-500"
              }
            >
              {draftMember.name}
            </span>
            <span>{draftMember.phoneNumber}</span>
          </div>
          <span>{draftMember.residence}</span>
        </button>
      ))}
    </div>
  );
}

DraftMembersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
