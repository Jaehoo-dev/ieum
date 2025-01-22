import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HOMEPAGE_URL } from "@ieum/constants";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { Review } from "~/components/Review";
import { api } from "~/utils/api";

type OrderBy = "PRIORITY" | "WRITTEN_AT";

export default function Home() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [pageGroup, setPageGroup] = useState(0);
  const [orderBy, setOrderBy] = useState<OrderBy>("WRITTEN_AT");
  const { data } = api.reviewRouter.getFripReviews.useQuery({
    skip: page * 페이지당_후기_개수,
    take: 페이지당_후기_개수,
    orderBy,
  });

  const iframeParentTarget = (router.query.origin ?? HOMEPAGE_URL) as string;
  const parentDevice = (router.query.device ?? "mobile") as Device;

  useEffect(() => {
    const height = document.documentElement.offsetHeight;

    if (height === 0) {
      return;
    }

    sendHeightToParent({
      height,
      target: iframeParentTarget,
      device: parentDevice,
    });
  }, [iframeParentTarget, parentDevice]);

  if (data == null) {
    return null;
  }

  const { reviews, count } = data;
  const hasPreviousPageGroup = pageGroup > 0;
  const hasNextPageGroup =
    pageGroup <
    Math.floor(count / 페이지당_후기_개수 / 페이지그룹당_페이지_개수);

  return (
    <div className="mt-4 flex flex-col gap-3 text-[#363636]">
      <div className="flex flex-row items-end justify-between">
        <div className="flex flex-row items-center gap-0.5">
          <p className="font-semibold">프립 후기</p>
          <p className="text-sm text-frip-primary-500">{`(${count})`}</p>
        </div>
        <select
          className="rounded-lg border border-gray-200 p-2 text-sm font-bold"
          value={orderBy}
          onChange={(event) => {
            setOrderBy(event.target.value as OrderBy);
            setPage(0);
          }}
        >
          <option value="PRIORITY">추천순</option>
          <option value="WRITTEN_AT">최신순</option>
        </select>
      </div>
      <div className="flex flex-col gap-6">
        <div className="border-b border-b-gray-500" />
        <div className="flex flex-col gap-4">
          {reviews.map((review) => {
            return <Review key={review.id} data={review} />;
          })}
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const oldPageGroup = pageGroup;

              setPageGroup(oldPageGroup - 1);
              setPage(oldPageGroup * 페이지그룹당_페이지_개수 - 1);

              sendScrollTriggerToParent({
                target: iframeParentTarget,
                device: parentDevice,
              });
            }}
            disabled={!hasPreviousPageGroup}
          >
            <ChevronLeftIcon className="pb-0.5 text-gray-400" />
          </button>
          {Array.from({
            length: Math.min(
              페이지그룹당_페이지_개수,
              Math.ceil(count / 페이지당_후기_개수) -
                pageGroup * 페이지그룹당_페이지_개수,
            ),
          }).map((_, index) => {
            const pageNumber = pageGroup * 페이지그룹당_페이지_개수 + index;
            const isCurrentPage = page === pageNumber;

            return (
              <button
                key={pageNumber}
                disabled={pageNumber * 페이지당_후기_개수 >= count}
                onClick={() => {
                  setPage(pageNumber);
                  sendScrollTriggerToParent({
                    target: iframeParentTarget,
                    device: parentDevice,
                  });
                }}
                className={`${
                  isCurrentPage
                    ? "font-semibold text-gray-700"
                    : "text-sm text-gray-400 "
                }`}
              >
                {pageNumber + 1}
              </button>
            );
          })}
          <button
            onClick={() => {
              const newPageGroup = pageGroup + 1;

              setPageGroup(newPageGroup);
              setPage(newPageGroup * 페이지그룹당_페이지_개수);

              sendScrollTriggerToParent({
                target: iframeParentTarget,
                device: parentDevice,
              });
            }}
            disabled={!hasNextPageGroup}
          >
            <ChevronRightIcon className="pb-0.5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

const 페이지당_후기_개수 = 10;
const 페이지그룹당_페이지_개수 = 5;

function sendHeightToParent({
  height,
  target,
  device,
}: {
  height: number;
  target: string;
  device: Device;
}) {
  window.parent.postMessage(
    {
      event: "HEIGHT",
      data: {
        height,
        device,
      },
    },
    target,
  );
}

function sendScrollTriggerToParent({
  target,
  device,
}: {
  target: string;
  device: Device;
}) {
  window.parent.postMessage(
    {
      event: "SCROLL",
      data: {
        device,
      },
    },
    target,
  );
}

type Device = "pc" | "mobile";
