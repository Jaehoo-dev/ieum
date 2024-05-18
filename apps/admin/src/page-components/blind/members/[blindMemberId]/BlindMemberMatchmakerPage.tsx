import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Gender } from "@ieum/prisma";
import type { BlindMember } from "@ieum/prisma";
import { match } from "ts-pattern";

import { BlindMemberCard } from "~/components/blind/BlindMemberCard";
import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function BlindMemberMatchmakerPage() {
  const utils = api.useUtils();
  const router = useRouter();
  const blindMemberId = Number(router.query.blindMemberId);
  const { data: blindMember } = api.blindMemberRouter.findById.useQuery(
    blindMemberId,
    { enabled: !isNaN(blindMemberId) },
  );
  const { data: 정량적_필수조건_충족하는_이성들 = [] } =
    api.blindMemberRouter.findNonNegotiableConditionsSatisfiedMembers.useQuery(
      { selfId: blindMemberId },
      { enabled: !isNaN(blindMemberId) },
    );
  const { mutateAsync: createMatch } = api.blindMatchRouter.create.useMutation({
    onSuccess: () => {
      return utils.blindMemberRouter.invalidate();
    },
  });
  const [shouldCrossCheck, setShouldCrossCheck] = useState(true);

  const list = useMemo(() => {
    if (!shouldCrossCheck) {
      return 정량적_필수조건_충족하는_이성들;
    }

    if (blindMember == null) {
      return [];
    }

    return 정량적_필수조건_충족하는_이성들.filter((member) => {
      return satisfiesNonNegotiableConditions({
        self: member,
        target: blindMember,
      });
    });
  }, [blindMember, shouldCrossCheck, 정량적_필수조건_충족하는_이성들]);

  return (
    <div className="mt-6 flex min-h-screen w-full flex-col items-center gap-8 py-2">
      <h1 className="text-4xl font-semibold">
        {blindMember != null ? (
          <span
            className={`${
              blindMember.gender === Gender.MALE
                ? "text-blue-500"
                : "text-pink-500"
            }`}
          >
            {blindMember.name}
          </span>
        ) : null}
        <span>{" 님 매칭"}</span>
      </h1>
      <h2 className="text-3xl font-semibold">
        ※ 지역과 체형은 직접 확인해야 함
      </h2>
      <div
        className="flex w-full justify-center gap-10"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <div className="flex w-5/12 flex-col items-end gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">본인</h2>
            <Link
              href={`/blind/members/${blindMemberId}/matches`}
              className="text-blue-600 hover:underline"
            >
              {"매칭 이력 >"}
            </Link>
          </div>
          {blindMember == null ? null : (
            <BlindMemberCard member={blindMember} />
          )}
          {"TODO: custom search filters"}
        </div>
        <div className="flex w-5/12 flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">상대방</h2>
            <label>
              <input
                type="checkbox"
                defaultChecked={shouldCrossCheck}
                onChange={(e) => {
                  setShouldCrossCheck(e.target.checked);
                }}
              />
              <span className="ml-2">필수 조건 적용</span>
            </label>
          </div>
          {list.map((member) => {
            return (
              <div key={member.id} className="flex w-full gap-4">
                <BlindMemberCard member={member} />
                <div>
                  <button
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white"
                    onClick={async () => {
                      await createMatch({
                        member1Id: blindMemberId,
                        member2Id: member.id,
                      });

                      alert(`${blindMember?.name} - ${member.name} 매칭 완료`);
                    }}
                    disabled={
                      blindMember == null || blindMember.matchesLeft < 1
                    }
                  >
                    Match
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function satisfiesNonNegotiableConditions({
  self,
  target,
}: {
  self: BlindMember;
  target: BlindMember;
}) {
  const conditions = self.nonNegotiableConditions;

  for (const condition of conditions) {
    const satisfiesCondition = match(condition)
      .with("HEIGHT", () => {
        return (
          (self.idealMinHeight == null ||
            target.height >= self.idealMinHeight) &&
          (self.idealMaxHeight == null || target.height <= self.idealMaxHeight)
        );
      })
      .with("PREFERRED_MBTIS", () => {
        return self.idealPreferredMbtis.includes(target.mbti);
      })
      .with("NON_PREFERRED_MBTIS", () => {
        return !self.idealNonPreferredMbtis.includes(target.mbti);
      })
      .with("IS_SMOKER_OK", () => {
        if (self.idealIsSmokerOk) {
          return true;
        }

        return !target.isSmoker;
      })
      .with("NON_PREFERRED_RELIGIONS", () => {
        return !self.idealNonPreferredReligions.includes(target.religion);
      })
      .with("REGION", () => true)
      .with("PREFERRED_BODY_SHAPES", () => true)
      .exhaustive();

    if (!satisfiesCondition) {
      return false;
    }
  }

  return true;
}

BlindMemberMatchmakerPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
