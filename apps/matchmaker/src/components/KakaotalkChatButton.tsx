import Link from "next/link";
import { KAKAOTALK_CHANNEL_CHAT_URL } from "@ieum/constants";
import ModeCommentRoundedIcon from "@mui/icons-material/ModeCommentRounded";

export function KakaotalkChatButton() {
  return (
    <Link
      href={KAKAOTALK_CHANNEL_CHAT_URL}
      className="fixed bottom-6 right-6 z-10 h-14 w-14 rounded-full bg-primary-500 p-4 shadow-lg hover:bg-primary-700"
      target="_blank"
      rel="noopener noreferrer"
    >
      <ModeCommentRoundedIcon className="text-white" />
    </Link>
  );
}
