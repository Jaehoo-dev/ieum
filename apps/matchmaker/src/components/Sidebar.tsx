import Link from "next/link";
import { useRouter } from "next/router";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const router = useRouter();

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-20 h-full w-72 transform bg-white shadow-md ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2
              role="button"
              className="text-xl font-semibold text-gray-800"
              onClick={() => {
                router.push("/");
              }}
            >
              이음
            </h2>
            <button onClick={onClose}>
              <CloseRoundedIcon className="text-gray-700" />
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            <MenuItem label="매칭 목록" href="/my-matches" onClick={onClose} />
            <MenuItem label="내 프로필" href="/my-profile" onClick={onClose} />
            <MenuItem
              label="내 이상형 조건"
              href="/my-ideal-type"
              onClick={onClose}
            />
            <MenuItem label="소개팅 꿀팁" href="/tips" onClick={onClose} />
          </ul>
        </div>
      </aside>
      {open ? (
        <div
          className="fixed inset-0 z-10 bg-black opacity-50"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}

interface MenuItemProps {
  label: string;
  href: string;
  onClick?: () => void;
}

function MenuItem({ label, href, onClick }: MenuItemProps) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`block rounded-lg px-4 py-2 text-lg text-gray-700 hover:bg-gray-200 ${
          isActive ? "bg-primary-200" : ""
        }`}
        onClick={onClick}
      >
        {label}
      </Link>
    </li>
  );
}
