export const MatchesEmpty = {
  Basic: BasicMatchesEmpty,
  Receiver: MegaphoneMatchesAsReceiverEmpty,
  Sender: MegaphoneMatchesAsSenderEmpty,
} as const;

function BasicMatchesEmpty() {
  return (
    <div className="my-4 flex w-full flex-col items-center">
      <p className="text-xl font-medium text-primary-500">
        이상형을 찾고 있어요 💘
      </p>
      <p className="text-xl font-medium text-primary-500">
        잠시만 기다려주세요 🙏
      </p>
    </div>
  );
}

function MegaphoneMatchesAsReceiverEmpty() {
  return (
    <div className="my-4 flex w-full flex-col items-center">
      <p className="text-xl font-medium text-primary-500">
        새로 도착한 프로필이 없어요 📭
      </p>
    </div>
  );
}

function MegaphoneMatchesAsSenderEmpty() {
  return (
    <div className="my-4 flex w-full flex-col items-center">
      <p className="text-xl font-medium text-primary-500">선수락 받은 매칭이</p>
      <p className="text-xl font-medium text-primary-500">아직 없어요 📭</p>
    </div>
  );
}
