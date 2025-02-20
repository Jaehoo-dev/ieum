import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  HOMEPAGE_URL,
  MATCHMAKER_URL,
  음식종류_라벨,
  커스텀_지역_라벨,
} from "@ieum/constants";
import type { CuisineType, CustomRegion, Place } from "@ieum/prisma";

import { ResponsiveDisplayAd } from "~/components/adsense/ResponsiveDisplayAd";
import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

interface Props {
  customRegion: CustomRegion;
  places: Place[];
}

export function PlacesByCustomRegionPage({ customRegion, places }: Props) {
  const 커스텀_지역 = 커스텀_지역_라벨[customRegion];

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${커스텀_지역} 소개팅 장소 추천 페이지 진입`,
    });
  }, [sendMessage, 커스텀_지역]);

  const placesByCuisineType = places.reduce(
    (acc, place) => {
      if (acc[place.cuisineType] == null) {
        acc[place.cuisineType] = [];
      }

      acc[place.cuisineType].push(place);

      return acc;
    },
    {} as Record<Place["cuisineType"], Place[]>,
  );

  return (
    <Layout title={`${커스텀_지역} 소개팅 장소 추천`}>
      <Head>
        <meta
          name="description"
          content={`${커스텀_지역} 소개팅 장소 추천 모음`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`${커스텀_지역} 소개팅 장소 추천 | 이음`}
        />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta
          property="og:description"
          content={`${커스텀_지역} 소개팅 장소 추천 모음`}
        />
        <meta property="og:locale" content="ko_KR" />
        <meta
          property="keywords"
          content={`소개팅,${커스텀_지역} 소개팅 장소,${커스텀_지역} 소개팅 장소 추천,${커스텀_지역} 소개팅 장소,${커스텀_지역} 소개팅 맛집 추천,${커스텀_지역} 맛집${커스텀_지역} 파인 다이닝,${커스텀_지역} 이탈리안 레스토랑,${커스텀_지역} 소개팅 첫만남 장소,${커스텀_지역} 직장인 소개팅 장소`}
        />
      </Head>
      <div className="flex flex-col gap-6 px-2">
        <div className="mb-24 flex flex-col gap-8">
          {Object.entries(placesByCuisineType).map(([cuisineType, places]) => {
            return (
              <section key={cuisineType} className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {음식종류_라벨[cuisineType as CuisineType]}
                </h2>
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
                            sendMessage({
                              content: `${커스텀_지역} 소개팅 장소 추천 페이지 - ${place.name} 링크 클릭`,
                            });
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
          <ResponsiveDisplayAd />
        </div>
        <div className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
          <div className="w-full max-w-lg px-2">
            <div className="flex flex-row gap-2">
              <Link
                className="block w-full rounded-lg bg-gray-200 p-3 text-center text-lg font-medium text-gray-700 hover:bg-gray-300"
                href="/places"
              >
                모든 지역 보기
              </Link>
              <Link
                className="block w-full rounded-lg bg-primary-500 p-3 text-center text-lg font-medium text-white hover:bg-primary-700"
                href={HOMEPAGE_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                이상형 소개받기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

PlacesByCustomRegionPage.auth = false;
