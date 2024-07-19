import { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { WORLDCUP_URL } from "@ieum/constants";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white py-4 shadow-md ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4">
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
          <ul className="mt-4 space-y-2 overflow-y-auto px-4">
            <MenuItem label="매칭 목록" href="/my-matches" onClick={onClose} />
            <MenuItem label="내 프로필" href="/my-profile" onClick={onClose} />
            <MenuItem
              label="내 이상형 조건 (베타)"
              href="/my-ideal-type"
              onClick={onClose}
            />
            <MenuItem label="블랙리스트" href="/blacklist" onClick={onClose} />
            <MenuItem label="추천인 코드" href="/referral" onClick={onClose} />
            <MenuItem
              label="활성 상태 조회"
              href="/my-status"
              onClick={onClose}
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
  label: string;
}

function MenuItem({ label, href, onClick, ...props }: MenuItemProps) {
  const router = useRouter();
  const isActive = router.pathname === href;
  const { sendMessage } = useSlackNotibot();

  return (
    <li>
      <Link
        href={href}
        className={`block rounded-lg px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-200 ${
          isActive ? "bg-primary-200" : ""
        }`}
        onClick={(e) => {
          sendMessage(`메뉴 - ${label} 클릭`);
          onClick?.(e);
        }}
        {...props}
      >
        {label}
      </Link>
    </li>
  );
}

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black opacity-50" onClick={onClick} />
  );
}
