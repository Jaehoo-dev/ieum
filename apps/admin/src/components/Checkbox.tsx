import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { nanoid } from "nanoid/non-secure";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  error?: boolean;
}

function _Checkbox(
  { label, error = false, ...props }: Props,
  ref: Ref<HTMLInputElement>,
) {
  const fieldId = `${label}-${nanoid(8)}`;

  return (
    <label className="flex items-center gap-1" htmlFor={fieldId}>
      <input
        id={fieldId}
        ref={ref}
        className={`rounded border border-gray-300 ${
          error ? "border-2 border-red-500" : ""
        }`}
        type="checkbox"
        {...props}
      />
      {label}
    </label>
  );
}

export const Checkbox = forwardRef(_Checkbox);
