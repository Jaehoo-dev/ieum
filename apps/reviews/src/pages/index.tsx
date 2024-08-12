import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  HOMEPAGE_URL,
  IMWEB_HOMEPAGE_URL,
  WWW_HOMEPAGE_URL,
} from "@ieum/constants";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { Review } from "~/components/Review";
import { api } from "~/utils/api";

export default function Home() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [pageGroup, setPageGroup] = useState(0);
  const { data } = api.reviewRouter.getFripReviews.useQuery({
    skip: page * 페이지당_후기_개수,
    take: 페이지당_후기_개수,
  });

  useEffect(() => {
    const height = document.documentElement.offsetHeight;

    if (height === 0) {
      return;
    }

    sendHeightToParent(height, (router.query.origin ?? HOMEPAGE_URL) as string);
  }, [data]);

  if (data == null) {
    return null;
  }

  const { reviews, count } = data;
  const hasPreviousPageGroup = pageGroup > 0;
  const hasNextPageGroup =
    pageGroup <
    Math.floor(count / 페이지당_후기_개수 / 페이지그룹당_페이지_개수);

  return (
    <div className="flex flex-col gap-6 border-t border-t-gray-500 pt-4">
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
          }}
          disabled={!hasNextPageGroup}
        >
          <ChevronRightIcon className="pb-0.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

const 페이지당_후기_개수 = 10;
const 페이지그룹당_페이지_개수 = 5;

const sendHeightToParent = (height: number, target: string) => {
  window.parent.postMessage(height, target);
};
