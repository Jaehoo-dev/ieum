import { ComponentPropsWithoutRef, ReactElement, Suspense } from "react";
import { useRouter } from "next/router";
import { assert } from "@ieum/utils";
import { addDays, differenceInDays } from "date-fns";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
          <Loader />
        </div>
      }
    >
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "member does not exist");

  const [
    {
      accepted,
      pending: { proposed, received },
    },
  ] = api.blindMatchRouter.getMatches.useSuspenseQuery({
    selfMemberId: member.id,
  });

  const isEmpty =
    accepted.length === 0 && proposed.length === 0 && received.length === 0;

  return isEmpty ? (
    <Empty />
  ) : (
    <div className="flex flex-col gap-6">
      {accepted.length > 0 ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-gray-800">성사된 회원</h2>
            <div className="grid grid-cols-2 gap-4">
              {accepted.map(({ id, target, acceptedAt }) => {
                assert(acceptedAt != null, "acceptedAt should not be null");

                return (
                  <Card
                    key={id}
                    target={target}
                    sentAt={acceptedAt}
                    onClick={() => {
                      router.push(`/members/${target.id}`);
                    }}
                  />
                );
              })}
            </div>
          </div>
          <hr />
        </>
      ) : null}
      {proposed.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-800">
            내가 하트를 보낸 회원
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {proposed.map(({ id, target, createdAt }) => {
              return (
                <Card
                  key={id}
                  target={target}
                  sentAt={createdAt}
                  onClick={() => {
                    router.push(`/members/${target.id}`);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
      {received.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-800">
            나에게 하트를 보낸 회원
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {received.map(({ id, target, createdAt }) => {
              return (
                <Card
                  key={id}
                  target={target}
                  sentAt={createdAt}
                  onClick={() => {
                    router.push(`/members/${target.id}`);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Empty() {
  return (
    <div className="my-4 flex w-full flex-col items-center">
      <p className="text-center text-xl font-medium text-blind-500">
        매칭이 없어요.
        <br />
        회원 목록에서 호감이 가는 상대에게
        <br />
        하트를 보내보세요. 💌
      </p>
    </div>
  );
}

interface CardProps extends ComponentPropsWithoutRef<"button"> {
  target: { id: string; nickname: string };
  sentAt: Date;
}

function Card({ target, sentAt, ...props }: CardProps) {
  return (
    <button
      className="flex w-full rounded-lg bg-blind-100 p-4 shadow hover:bg-blind-200 disabled:cursor-not-allowed disabled:bg-gray-100"
      {...props}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold text-gray-800">{target.nickname}</span>
        <span>{`D - ${differenceInDays(addDays(sentAt, 7), new Date())}`}</span>
      </div>
    </button>
  );
}

MatchesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="매칭 목록" bottomNav={true}>
      {page}
    </Layout>
  );
};
