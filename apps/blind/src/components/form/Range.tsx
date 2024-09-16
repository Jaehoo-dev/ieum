import { InputHTMLAttributes } from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props {
  label: string;
  description?: string;
  error?: boolean;
  errorText?: string;
  required?: boolean;
  from?: InputHTMLAttributes<HTMLInputElement>;
  to?: InputHTMLAttributes<HTMLInputElement>;
}

export function Range({
  label,
  description,
  error = false,
  errorText,
  required,
  from,
  to,
}: Props) {
  const hasErrorText = error && !isEmptyStringOrNil(errorText);
  const hasDescription = !isEmptyStringOrNil(description);

  return (
    <div className="flex flex-col gap-1 text-gray-800">
      <span className="text-lg font-medium">
        {label}
        {required ? <span className="text-blind-500">*</span> : null}
      </span>
      {hasDescription ? (
        <span className="text-sm text-gray-500">{description}</span>
      ) : null}
      {hasErrorText ? (
        <span className="text-sm text-red-500">{errorText}</span>
      ) : null}
      <div className="mt-1 flex flex-row items-center gap-2">
        <input
          className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blind-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          type="number"
          autoComplete="off"
          {...from}
        />
        ~
        <input
          className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blind-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          type="number"
          autoComplete="off"
          {...to}
        />
      </div>
    </div>
  );
}
