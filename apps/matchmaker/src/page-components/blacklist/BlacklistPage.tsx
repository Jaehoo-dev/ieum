import { ReactElement, Suspense } from "react";
import Head from "next/head";
import {
  assert,
  formatPhoneNumberInput,
  krHyphenToKr,
  krToKrHyphen,
} from "@ieum/utils";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function BlacklistPage() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      phoneNumber: "",
    },
  });
  const utils = api.useUtils();
  const { mutateAsync: add } = api.basicMemberRouter.addToBlacklist.useMutation(
    {
      onSuccess: () => {
        return utils.basicMemberRouter.getBlacklist.invalidate();
      },
    },
  );

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex flex-col gap-12">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async ({ phoneNumber }) => {
            await add({
              memberId: member.id,
              phoneNumber: krHyphenToKr(phoneNumber),
            });

            reset();
          })}
        >
          <h2 className="text-lg font-semibold text-gray-700">
            블랙리스트 추가
          </h2>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">전화번호</span>
            <div className="flex flex-row gap-2">
              <Controller
                control={control}
                name="phoneNumber"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <input
                    className={`flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-primary-500 ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="010-0000-0000"
                    value={value}
                    onChange={({ target: { value } }) => {
                      onChange(formatPhoneNumberInput(value));
                    }}
                  />
                )}
                rules={{
                  required: "전화번호를 입력해주세요",
                  pattern: {
                    value: /^010-\d{4}-\d{4}$/,
                    message: "올바른 전화번호를 입력해주세요",
                  },
                }}
              />
              <button className="rounded-lg bg-primary-500 px-5 py-2 font-medium text-white hover:bg-primary-700">
                등록
              </button>
            </div>
          </label>
          <Description />
        </form>
        <Suspense>
          <Resolved />
        </Suspense>
      </div>
    </>
  );
}

function Description() {
  return (
    <div className="flex w-full items-start gap-1">
      <p className="text-sm text-gray-500">※</p>
      <p className="text-sm text-gray-500">
        블랙리스트에 추가한 전화번호의 주인은 소개 후보군에서 제외합니다.
      </p>
    </div>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [blacklist] = api.basicMemberRouter.getBlacklist.useSuspenseQuery({
    memberId: member.id,
  });
  const utils = api.useUtils();
  const { mutateAsync: remove } =
    api.basicMemberRouter.removeFromBlacklist.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.getBlacklist.invalidate();
      },
    });

  return blacklist.length > 0 ? (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-700">블랙리스트</h2>
      <div className="flex flex-col gap-3">
        {blacklist.map((phoneNumber, index) => (
          <>
            <div
              key={phoneNumber}
              className="flex flex-row items-center justify-between"
            >
              <p className="font-medium text-gray-700">
                {krToKrHyphen(phoneNumber)}
              </p>
              <button
                onClick={async () => {
                  await remove({ memberId: member.id, phoneNumber });
                }}
              >
                <DeleteIcon className="text-red-500" fontSize="small" />
              </button>
            </div>
            {index < blacklist.length - 1 ? <hr /> : null}
          </>
        ))}
      </div>
    </div>
  ) : null;
}

BlacklistPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="블랙리스트">{page}</Layout>;
};
