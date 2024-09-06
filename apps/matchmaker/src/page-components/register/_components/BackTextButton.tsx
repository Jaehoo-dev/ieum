import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

interface Props {
  onClick: () => void;
}

export function BackTextButton({ onClick }: Props) {
  return (
    <div>
      <button onClick={onClick} className="flex pr-2 text-gray-500">
        <ChevronLeftRoundedIcon fontSize="small" />
        이전
      </button>
    </div>
  );
}
