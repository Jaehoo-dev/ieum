import { useRouter } from "next/router";
import { MegaphoneMatch } from "@ieum/prisma";

interface Props {
  match: Pick<
    MegaphoneMatch,
    "id" | "status" | "sentToReceiverAt" | "receiverStatus" | "receiverId"
  >;
  showLabel: boolean;
  disabled: boolean;
  onClick?: () => void;
}

export function MegaphoneMatchCard({ match, onClick, disabled }: Props) {
  const router = useRouter();

  return (
    <button
      className="flex w-full rounded-lg bg-gray-100 p-5 shadow hover:bg-primary-300 disabled:cursor-not-allowed disabled:bg-gray-100"
      onClick={() => {
        onClick?.();
        void router.push(`/my-matches/megaphone/${match.id}`);
      }}
      disabled={disabled}
    ></button>
  );
}
