import type { ComponentProps } from "react";
import Link from "next/link";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";

type Props = Omit<ComponentProps<typeof Link>, "href">;

export function HomepageTipsTabLink({ target, rel, onClick, ...props }: Props) {
  const { sendMessage } = useSlackNotibot();

  return (
    <Link
      href="/tips"
      className="text-gray-500 underline hover:text-gray-800 md:text-lg"
      target={target ?? "_blank"}
      rel={rel ?? "noopener noreferrer"}
      onClick={(event) => {
        sendMessage("'소개팅 꿀팁 보러 가기' 클릭");
        onClick?.(event);
      }}
      {...props}
    >
      소개팅 꿀팁 보러 가기
    </Link>
  );
}
