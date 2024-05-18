import { forwardRef } from "react";
import type { DetailedHTMLProps, Ref, TextareaHTMLAttributes } from "react";
import { nanoid } from "nanoid/non-secure";

interface Props
  extends DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  label?: string;
  error?: boolean;
}

function _TextareaInput(
  { label, error = false, ...props }: Props,
  ref: Ref<HTMLTextAreaElement>,
) {
  const fieldId = `${label}-${nanoid(8)}`;

  return (
    <label className="flex flex-col" htmlFor={fieldId}>
      {label}
      <textarea
        id={fieldId}
        ref={ref}
        className={`rounded border border-gray-300 px-2 py-1 ${
          error ? "border-2 border-red-500" : ""
        }`}
        {...props}
      />
    </label>
  );
}

export const TextareaInput = forwardRef(_TextareaInput);
