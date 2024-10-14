import { ReactElement } from "react";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function BulkNotificationPage() {
  const { mutateAsync: bulkNotify } =
    api.blindMatchRouter.bulkNotify.useMutation();

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <button
        onClick={async () => {
          const confirmed = confirm("일괄 알림을 발송하시겠습니까?");

          if (confirmed) {
            await bulkNotify();

            alert("알림 발송 완료");
          }
        }}
        className="rounded-md bg-blue-500 px-4 py-2 text-white"
      >
        일괄 알림 발송
      </button>
    </div>
  );
}

BulkNotificationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
