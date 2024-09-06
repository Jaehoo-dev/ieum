import { useEffect } from "react";
import Link from "next/link";
import { WORLDCUP_URL } from "@ieum/constants";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function Ending() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: `회원가입 끝 페이지 진입`,
    });
  }, []);

  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="안녕하세요"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-8 p-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-medium text-gray-800">
            긴 설문 완료해주셔서 감사합니다!
          </h1>
          <p className="text-lg text-gray-800">
            3일 안에 연락드리겠습니다.
            <br />
            행복한 하루 보내세요. 🙂
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/tips"
            className="text-center text-primary-500 underline hover:text-primary-700"
            onClick={() => {
              sendMessage({
                content: `회원가입 끝 페이지 - 소개팅 꿀팁 보러 가기 클릭`,
              });
            }}
          >
            소개팅 꿀팁 보러 가기
          </Link>
          <Link
            href={WORLDCUP_URL}
            className="text-center text-primary-500 underline hover:text-primary-700"
            onClick={() => {
              sendMessage({
                content: `회원가입 끝 페이지 - AI 이상형 월드컵 하러 가기 클릭`,
              });
            }}
          >
            AI 이상형 월드컵 하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
