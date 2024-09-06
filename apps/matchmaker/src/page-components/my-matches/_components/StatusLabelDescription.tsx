export const StatusLabelDescription = {
  Basic: BasicStatusLabelDescription,
  Receiver: ReceiverStatusLabelDescription,
} as const;

function BasicStatusLabelDescription() {
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      <span className="flex flex-row items-center gap-2">
        <p>🟡</p>
        <p>응답 대기 중</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🔴</p>
        <p>상대방 거절</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🟢</p>
        <p>소개 성사 🎉</p>
      </span>
    </div>
  );
}

function ReceiverStatusLabelDescription() {
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      <span className="flex flex-row items-center gap-2">
        <p>🟡</p>
        <p>응답 대기 중</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🔴</p>
        <p>본인 또는 상대방 거절</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🟢</p>
        <p>소개 성사 🎉</p>
      </span>
    </div>
  );
}
