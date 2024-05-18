import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: boolean;
}

export function Select({ label, error = false, ...props }: Props) {
  return (
    <label className="flex flex-col">
      {label}
      <select
        className={`rounded border border-gray-300 p-1 ${
          error ? "border-2 border-red-500" : ""
        }`}
        {...props}
      />
    </label>
  );
}
