interface Props {
  onBackClick: () => void;
  onNextClick: () => void;
}

export function Buttons({ onBackClick, onNextClick }: Props) {
  return (
    <div className="flex flex-row gap-2">
      <button
        onClick={onBackClick}
        className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-lg font-medium text-white hover:bg-gray-600"
      >
        이전
      </button>
      <button
        onClick={onNextClick}
        className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-lg font-medium text-white hover:bg-primary-700"
      >
        다음
      </button>
    </div>
  );
}
