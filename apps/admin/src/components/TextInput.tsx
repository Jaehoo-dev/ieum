import { forwardRef } from "react";
import type { InputHTMLAttributes, Ref } from "react";
import { nanoid } from "nanoid/non-secure";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

function _TextInput(
  { label, error = false, ...props }: Props,
  ref: Ref<HTMLInputElement>,
) {
  const fieldId = `${label}-${nanoid(8)}`;

  return (
    <label className="flex flex-col" htmlFor={fieldId}>
      {label}
      <input
        id={fieldId}
        ref={ref}
        className={`rounded px-2 py-1 ${
          error ? "border-2 border-red-500" : "border border-gray-300"
        }`}
        type="text"
        {...props}
      />
    </label>
  );
}

export const TextInput = forwardRef(_TextInput);
