import { Fragment, Suspense } from "react";
import {
  assert,
  formatPhoneNumberInput,
  krHyphenToKr,
  krToKrHyphen,
} from "@ieum/utils";
import { Controller, useForm } from "react-hook-form";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function BlacklistSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      phoneNumber: "",
    },
  });
  const utils = api.useUtils();
  const { mutateAsync: add } = api.blindMemberRouter.addToBlacklist.useMutation(
    {
      onSuccess: () => {
        return utils.blindMemberRouter.getBlacklist.invalidate();
      },
    },
  );

  return (
    <div className="mb-4 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-700">블랙리스트</h2>
      <Description />
      <div className="flex flex-col gap-8">
        <form
          onSubmit={handleSubmit(async ({ phoneNumber }) => {
            await add({
              memberId: member.id,
              phoneNumber: krHyphenToKr(phoneNumber),
            });

            reset();
          })}
        >
          <div className="flex flex-col gap-1">
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
                    className={`flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-blind-500 ${
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
              <button className="rounded-lg bg-blind-500 px-5 py-2 font-medium text-white hover:bg-blind-700">
                등록
              </button>
            </div>
          </div>
        </form>
        <Suspense>
          <Resolved />
        </Suspense>
      </div>
    </div>
  );
}

function Description() {
  return (
    <div className="flex w-full items-start gap-1">
      <p className="text-sm text-gray-500">※</p>
      <p className="text-sm text-gray-500">
        블랙리스트에 추가하면 서로의 목록에서 제외됩니다.
      </p>
    </div>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [blacklist] = api.blindMemberRouter.getBlacklist.useSuspenseQuery({
    memberId: member.id,
  });

  return blacklist.length > 0 ? (
    <div className="flex flex-col gap-3">
      {blacklist.map((phoneNumber, index) => (
        <Fragment key={phoneNumber}>
          <p className="font-medium text-gray-700">
            {krToKrHyphen(phoneNumber)}
          </p>
          {index < blacklist.length - 1 ? <hr /> : null}
        </Fragment>
      ))}
    </div>
  ) : null;
}
