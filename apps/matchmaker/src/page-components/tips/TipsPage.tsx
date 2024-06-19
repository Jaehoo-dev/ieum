import { ReactElement, ReactNode, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MATCHMAKER_URL } from "@ieum/constants";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function TipsPage() {
  const router = useRouter();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `소개팅 꿀팁 모음 페이지 진입\n${navigator.userAgent}\nfrom: ${router.query.from}\nreferrer: ${document.referrer}`,
    );
  }, [router.query.from, sendMessage]);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="소개팅 서비스 운영자가 알려주는 소개팅 꿀팁 모음"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="소개팅 꿀팁 모듬 | 이음" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta
          property="og:description"
          content="소개팅 서비스 운영자가 알려주는 소개팅 꿀팁 모음"
        />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <div className="p-2">
        <div className="flex flex-col gap-10">
          <Section
            title="첫 만남 이전"
            posts={[
              {
                title: "중요! 소개팅 사진 고르는 방법",
                href: "https://m.blog.naver.com/ieum-love/223459288593",
              },
              {
                title:
                  "[데이터 분석] 소개팅에서 남녀가 중요하게 생각하는 조건 TOP 5",
                href: "https://m.blog.naver.com/ieum-love/223464787723",
              },
              {
                title: "소개팅 잘 받는 방법 - 지인 편",
                href: "https://m.blog.naver.com/ieum-love/223476695454",
              },
              {
                title: "소개팅 잘 받는 방법 - 업체 편",
                href: "https://m.blog.naver.com/ieum-love/223482036559",
              },
              {
                title: "매칭 수락률 높은 프로필 작성 방법 - 인적사항 편",
                href: "https://m.blog.naver.com/ieum-love/223484378089",
              },
            ]}
          />
          <Section
            title="첫 만남"
            posts={[
              {
                title:
                  "[데이터 분석] 소개팅에서 이런 점을 어필해야 승산이 높습니다",
                href: "https://m.blog.naver.com/ieum-love/223461508202",
              },
            ]}
          />
          <Section
            title="기타"
            posts={[
              {
                title: "결정사 가격 정리 (듀오, 가연, 바로연)",
                href: "https://m.blog.naver.com/ieum-love/223474470406",
              },
              {
                title: "선재앓이로 분석하는 인기 많은 남자 특징",
                href: "https://m.blog.naver.com/ieum-love/223470528169",
              },
            ]}
          />
        </div>
        <Spacing size={48} />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-center text-gray-700">
              소개팅 준비하는 친구한테 공유하세요!
            </p>
            <button
              className="rounded-lg border border-gray-700 p-3 text-xl font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}${window.location.pathname}?from=share`,
                );
              }}
            >
              링크 복사
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-center text-gray-700">
              이음 소개팅이 궁금하다면?
            </p>
            <Link
              href={`${MATCHMAKER_URL}/demo?from=tips`}
              className="rounded-lg bg-primary-500 p-3 text-center text-xl font-medium text-white hover:bg-primary-700"
            >
              매칭 구경하기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  posts,
}: {
  title: string;
  posts: Array<{ title: string; href: string }>;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
      <ul className="flex flex-col gap-2">
        {posts.map((post) => {
          return (
            <li
              key={`${post.title}-${post.href}`}
              className="flex flex-row gap-2"
            >
              <span>&#8729;</span>
              <Link
                className="text-lg text-[#0000EE] underline visited:text-[#551A8B]"
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {post.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

TipsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="소개팅 꿀팁">{page}</Layout>;
};

TipsPage.auth = false;
