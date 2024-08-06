import { forwardRef } from "react";
import type { InputHTMLAttributes, Ref } from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: boolean;
  errorText?: string;
}

function _TextInput(
  {
    label,
    description,
    error = false,
    errorText,
    autoComplete = "off",
    ...props
  }: Props,
  ref: Ref<HTMLInputElement>,
) {
  const hasErrorText = error && !isEmptyStringOrNil(errorText);
  const hasDescription = !isEmptyStringOrNil(description);
  const hasSublabel = hasErrorText || hasDescription;

  return (
    <label className="flex flex-col gap-1 text-gray-800" htmlFor={label}>
      <span className="text-lg font-medium">
        {`${label}${props.required ? "*" : ""}`}
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
      <input
        id={label}
        ref={ref}
        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        type={props.type ?? "text"}
        autoComplete={autoComplete}
        {...props}
      />
    </label>
  );
}

export const TextInput = forwardRef(_TextInput);
