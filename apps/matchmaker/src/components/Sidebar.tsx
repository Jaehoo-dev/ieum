import { ComponentPropsWithoutRef, ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HOMEPAGE_URL,
  KAKAOTALK_CHANNEL_CHAT_URL,
  WORLDCUP_URL,
} from "@ieum/constants";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { cn } from "~/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-md ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            role="button"
            className="text-xl font-semibold text-gray-800"
          >
            이음
          </Link>
          <button onClick={onClose}>
            <CloseRoundedIcon className="text-gray-700" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <ul className="space-y-2 px-4">
            <MenuItem label="매칭 목록" href="/my-matches" onClick={onClose} />
            <MenuItem label="내 프로필" href="/my-profile" onClick={onClose} />
            <MenuItem
              label="내 이상형 조건 (베타)"
              href="/my-ideal-type"
              onClick={onClose}
            />
            <MenuItem
              label="추천인 코드 - 캐시백 받기"
              href="/referral"
              onClick={onClose}
            />
            <MenuItem
              label="이음 블라인드 사전 신청"
              href="/blind/pre-register"
              onClick={onClose}
            />
            <MenuItem label="설정" href="/settings" onClick={onClose} />
            <MenuItem
              label="자주 묻는 질문"
              href={`${HOMEPAGE_URL}/faq`}
              target="_blank"
              rel="noopener noreferrer"
            />
            <MenuItem
              label="고객센터"
              href={KAKAOTALK_CHANNEL_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
            />
            <hr />
            <MenuItem label="소개팅 꿀팁 모음" href="/tips" onClick={onClose} />
            <MenuItem
              label="소개팅 장소 추천 (알파)"
              href="/places"
              onClick={onClose}
            />
            <MenuItem
              label="AI 이상형 월드컵"
              href={WORLDCUP_URL}
              target="_blank"
              rel="noopener"
            />
          </ul>
        </div>
      </aside>
      {open ? <Overlay onClick={onClose} /> : null}
    </>
  );
}

interface MenuItemProps extends ComponentPropsWithoutRef<typeof Link> {
  label: ReactNode;
}

function MenuItem({
  label,
  href,
  target,
  onClick,
  className,
  ...props
}: MenuItemProps) {
  const router = useRouter();
  const isActive = router.pathname === href;
  const isExternal = target === "_blank";
  const { sendMessage } = useSlackNotibot();

  return (
    <li>
      <Link
        href={href}
        className={cn(
          `block rounded-lg px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-200 ${
            isActive ? "bg-primary-200 hover:bg-primary-200" : ""
          }`,
          className,
        )}
        onClick={(e) => {
          sendMessage({ content: `메뉴 - ${label} 클릭` });
          onClick?.(e);
        }}
        target={target}
        {...props}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isExternal ? (
            <OpenInNewRoundedIcon
              fontSize="small"
              className="mb-0.5 text-gray-600"
            />
          ) : null}
        </div>
      </Link>
    </li>
  );
}

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black opacity-50" onClick={onClick} />
  );
}
