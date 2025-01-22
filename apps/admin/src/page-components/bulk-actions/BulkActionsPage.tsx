import type { ReactElement } from "react";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function BulkActionsPage() {
  const { mutateAsync: bulkNotify } =
    api.blindMatchRouter.bulkNotify.useMutation();
  const { mutateAsync: resetHearts } =
    api.blindMemberRouter.resetHearts.useMutation();

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={async () => {
            const confirmed = confirm("일괄 알림을 발송하시겠습니까?");

            if (confirmed) {
              await bulkNotify();

              alert("알림 발송 완료");
            }
          }}
          className="rounded-md bg-red-500 px-4 py-2 text-white"
        >
          일괄 알림 발송
        </button>
        <hr className="w-1/2 border-gray-200" />
        <button
          onClick={async () => {
            const confirmed = confirm("하트 개수를 초기화하시겠습니까?");

            if (confirmed) {
              await resetHearts();

              alert("하트 개수 초기화 완료");
            }
          }}
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          하트 개수 초기화
        </button>
      </div>
    </div>
  );
}

BulkActionsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
