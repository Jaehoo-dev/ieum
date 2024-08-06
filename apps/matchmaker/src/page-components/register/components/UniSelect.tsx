import React from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props<T extends string | number | boolean = string> {
  label: string;
  options: Array<{
    label: string;
    value: T;
  }>;
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  required?: boolean;
  description?: string;
  error?: boolean;
  errorText?: string;
  cols?: 1 | 2 | 3 | 4 | 5;
}

export function UniSelect<T extends string | number | boolean = string>({
  label,
  options,
  value,
  onChange,
  required,
  description,
  error,
  errorText,
  cols,
}: Props<T>) {
  const hasErrorText = error && !isEmptyStringOrNil(errorText);
  const hasDescription = !isEmptyStringOrNil(description);
  const hasSublabel = hasErrorText || hasDescription;

  return (
    <div className="flex flex-col gap-1 text-gray-800">
      <span className="text-lg font-medium">
        {`${label}${required ? "*" : ""}`}
      </span>
      {hasSublabel ? (
        <span
          className={`mb-1 text-sm ${
            hasErrorText ? "text-red-500" : "text-gray-500"
          }`}
        >
          {hasErrorText ? errorText : description}
        </span>
      ) : null}
      <div
        className={`grid gap-1.5 ${
          cols === 2
            ? "grid-cols-2"
            : cols === 3
            ? "grid-cols-3"
            : cols === 4
            ? "grid-cols-4"
            : cols === 5
            ? "grid-cols-5"
            : "grid-cols-1"
        }`}
      >
        {options.map((option) => {
          return (
            <div
              role="radio"
              key={String(option.value)}
              className={`cursor-pointer rounded-lg border border-gray-300 px-4 py-2 outline-none ${
                value === option.value
                  ? "bg-primary-100 ring-2 ring-primary-500"
                  : ""
              }`}
              onClick={() => {
                if (value == option.value) {
                  onChange(null);

                  return;
                }

                onChange(option.value);
              }}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
