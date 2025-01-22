import React from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props<T extends string | number | boolean = string> {
  label: string;
  options: {
    label: string;
    value: T | null;
  }[];
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

  return (
    <div className="flex flex-col gap-1 text-gray-800">
      <span className="text-lg font-medium">
        {label}
        {required ? <span className="text-blind-500">*</span> : null}
      </span>
      {hasDescription || hasErrorText ? (
        <div className="mb-0.5 flex flex-col gap-1">
          {hasDescription ? (
            <span className="text-sm text-gray-500">{description}</span>
          ) : null}
          {hasErrorText ? (
            <span className="text-sm text-red-500">{errorText}</span>
          ) : null}
        </div>
      ) : null}
      <div
        className={`mt-1 grid gap-1.5 ${
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
        {options.map((option, index) => {
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              role="radio"
              key={String(option.value)}
              className={`cursor-pointer rounded-lg border border-gray-300 px-4 py-2 outline-none ${
                value === option.value
                  ? "bg-blind-100 ring-2 ring-blind-500"
                  : ""
              }`}
              onClick={() => {
                if (value == option.value) {
                  onChange(null);

                  return;
                }

                onChange(option.value);
              }}
              tabIndex={index}
              aria-checked={value == option.value}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
