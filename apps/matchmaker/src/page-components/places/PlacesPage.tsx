import { ReactElement, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { HOMEPAGE_URL, MATCHMAKER_URL, 구_라벨 } from "@ieum/constants";
import { Place, SeoulDistrict } from "@ieum/prisma";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

interface Props {
  places: Record<SeoulDistrict, Place[]>;
}

export function PlacesPage({ places }: Props) {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `소개팅 장소 추천 페이지 진입\n${navigator.userAgent}\nreferrer: ${document.referrer}`,
    );
  }, [sendMessage]);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="소개팅 서비스 운영자가 추천하는 소개팅 장소 모음"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="소개팅 장소 추천 | 이음" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta
          property="og:description"
          content="소개팅 서비스 운영자가 추천하는 소개팅 장소 모음"
        />
        <meta property="og:locale" content="ko_KR" />
        <meta
          property="keywords"
          content="소개팅,소개팅 장소,소개팅 장소 추천,강남 소개팅 장소,맛집,파인다이닝,이탈리안 레스토랑,소개팅 첫만남 장소,직장인 소개팅 장소"
        />
      </Head>
      <div className="px-2">
        <div className="mb-24 flex flex-col gap-8">
          {Object.entries(places).map(([district, places]) => {
            return (
              <section key={district} className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {구_라벨[district as SeoulDistrict]}
                  </h2>
                  <Link
                    href={`/places/districts/${district.toLowerCase()}`}
                    role="button"
                    className="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-800"
                  >
                    음식 종류별로 보기
                  </Link>
                </div>
                <ul className="flex flex-col gap-2">
                  {places.map((place) => {
                    return (
                      <li key={place.id} className="flex flex-row gap-2">
                        <span>&#8729;</span>
                        <Link
                          className="text-[#0000EE] underline visited:text-[#551A8B]"
                          href={place.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            sendMessage(
                              `소개팅 장소 추천 페이지 - ${place.name} 링크 클릭`,
                            );
                          }}
                        >
                          {place.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
          <div className="w-full max-w-lg px-2">
            <Link
              className="block w-full rounded-lg bg-primary-500 p-3 text-center text-lg font-medium text-white hover:bg-primary-700"
              href={HOMEPAGE_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              이상형 소개받으러 가기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

PlacesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="소개팅 장소 추천 (알파)">{page}</Layout>;
};

PlacesPage.auth = false;
