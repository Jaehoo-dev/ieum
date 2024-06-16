import type { InputHTMLAttributes } from "react";

interface ImageFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  onChange: (file: File | undefined) => void;
  onRegister: () => void;
  error?: boolean;
}

export function ImageInput({
  label,
  onChange,
  onRegister,
  error,
  ...props
}: ImageFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <div>
        {label}
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className={`flex-1 rounded p-2 ${
              error ? "border-2 border-red-500" : "border border-gray-300"
            }`}
            onChange={(e) => {
              onChange(e.target.files?.[0]);
            }}
            {...props}
          />
          <button
            type="button"
            className="rounded bg-gray-300 px-4 py-2"
            onClick={onRegister}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
