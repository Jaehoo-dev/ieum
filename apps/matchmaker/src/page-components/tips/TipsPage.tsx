import { ReactElement, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { HOMEPAGE_URL, MATCHMAKER_URL } from "@ieum/constants";

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
                href: "https://ieum-love.tistory.com/entry/%EC%86%8C%EA%B0%9C%ED%8C%85-%EC%84%B1%EC%82%AC%EB%90%98%EB%A0%A4%EB%A9%B4-%EC%9D%B4%EB%9F%B0-%EC%82%AC%EC%A7%84-%EC%93%B0%EC%84%B8%EC%9A%94-%EC%86%8C%EA%B0%9C%ED%8C%85-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%9A%B4%EC%98%81%EC%9E%90%EC%9D%98-%EC%86%8C%EA%B0%9C%ED%8C%85-%EA%BF%80%ED%8C%81-1%ED%8E%B8",
              },
              {
                title:
                  "[데이터 분석] 소개팅에서 남녀가 중요하게 생각하는 조건 TOP 5",
                href: "https://ieum-love.tistory.com/entry/%EB%82%A8%EB%85%80%EA%B0%80-%EC%9D%B4%EC%84%B1%EC%9D%84-%EB%B3%BC-%EB%95%8C-%ED%8F%AC%EA%B8%B0-%EB%AA%BB%ED%95%98%EB%8A%94-%EC%A1%B0%EA%B1%B4-Top-5-%EC%86%8C%EA%B0%9C%ED%8C%85-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%9A%B4%EC%98%81%EC%9E%90%EC%9D%98-%EC%86%8C%EA%B0%9C%ED%8C%85-%EA%BF%80%ED%8C%81-3%ED%8E%B8",
              },
              {
                title: "소개팅 잘 받는 방법 - 지인 편",
                href: "https://ieum-love.tistory.com/entry/%EC%9D%B4%EC%84%B1-%EC%86%8C%EA%B0%9C%EB%A5%BC-%EC%9E%98-%EB%B0%9B%EC%9C%BC%EB%A0%A4%EB%A9%B4-%EC%86%8C%EA%B0%9C%ED%8C%85-%EC%9E%98-%EB%B0%9B%EB%8A%94-%EB%B0%A9%EB%B2%95-%EC%A7%80%EC%9D%B8-%ED%8E%B8-%EC%86%8C%EA%B0%9C%ED%8C%85-%EA%BF%80%ED%8C%81",
              },
              {
                title: "소개팅 잘 받는 방법 - 업체 편",
                href: "https://m.blog.naver.com/ieum-love/223482036559",
              },
              {
                title: "매칭 수락률 높은 프로필 작성 방법 - 인적사항 편",
                href: "https://m.blog.naver.com/ieum-love/223484378089",
              },
              {
                title: "매칭 수락률 높은 프로필 작성 방법 - 자기소개 편",
                href: "https://m.blog.naver.com/ieum-love/223487620440",
              },
            ]}
          />
          <Section
            title="첫 만남"
            posts={[
              {
                title:
                  "[데이터 분석] 소개팅에서 이런 점을 어필해야 승산이 높습니다",
                href: "https://ieum-love.tistory.com/entry/%EC%86%8C%EA%B0%9C%ED%8C%85%EC%97%90%EC%84%9C-%E3%85%87%E3%85%87%ED%95%9C-%EB%A9%B4%EC%9D%84-%EB%B6%80%EA%B0%81%ED%95%B4%EC%95%BC-%EC%8A%B9%EC%82%B0%EC%9D%B4-%EC%9E%88%EC%8A%B5%EB%8B%88%EB%8B%A4-%EC%86%8C%EA%B0%9C%ED%8C%85-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%9A%B4%EC%98%81%EC%9E%90%EC%9D%98-%EC%86%8C%EA%B0%9C%ED%8C%85-%EA%BF%80%ED%8C%81-2%ED%8E%B8",
              },
            ]}
          />
          <Section
            title="기타"
            posts={[
              {
                title: "자만추 힘들고 소개팅 끊겼을 때 이성 만나는 방법 3가지",
                href: "https://m.blog.naver.com/ieum-love/223492312491",
              },
              {
                title: "2024년 결정사 가격 정리 (듀오, 가연, 바로연)",
                href: "https://m.blog.naver.com/ieum-love/223474470406",
              },
              {
                title: "선재앓이로 분석하는 인기 많은 남자 특징",
                href: "https://ieum-love.tistory.com/entry/%EC%86%8C%EA%B0%9C%ED%8C%85-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%9A%B4%EC%98%81%EC%9E%90%EC%9D%98-%EC%84%A0%EC%9E%AC%EC%95%93%EC%9D%B4-%EB%B6%84%EC%84%9D-feat-%EB%B3%80%EC%9A%B0%EC%84%9D",
              },
            ]}
          />
        </div>
        <Spacing size={48} />
        <div className="flex flex-col gap-4">
          <button
            className="rounded-lg border border-gray-700 p-3 text-xl font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${window.location.origin}${window.location.pathname}?from=share`,
              );
              alert("링크를 복사했어요!");
            }}
          >
            친구한테 공유하기
          </button>
          <Link
            href={HOMEPAGE_URL}
            className="rounded-lg bg-primary-600 p-3 text-center text-xl font-semibold text-white hover:bg-primary-700"
          >
            나도 소개받기
          </Link>
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
  const { sendMessage } = useSlackNotibot();

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
                onClick={() => {
                  sendMessage(
                    `소개팅 꿀팁 모음 페이지 - ${post.title} 링크 클릭`,
                  );
                }}
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
