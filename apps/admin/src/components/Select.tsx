import type { InputHTMLAttributes, Ref } from "react";
import { forwardRef } from "react";
import { nanoid } from "nanoid/non-secure";

interface Props extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: boolean;
}

function _Select(
  { label, error = false, ...props }: Props,
  ref: Ref<HTMLSelectElement>,
) {
  const fieldId = `${label}-${nanoid(4)}`;

  return (
    <label className="flex flex-col" htmlFor={fieldId}>
      {label}
      <select
        id={fieldId}
        ref={ref}
        className={`rounded border border-gray-300 p-1 ${
          error ? "border-2 border-red-500" : ""
        }`}
        {...props}
      />
    </label>
  );
}

export const Select = forwardRef(_Select);
