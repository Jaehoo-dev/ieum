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
  const hasDescription = !isEmptyStringOrNil(description);
  const hasErrorText = error && !isEmptyStringOrNil(errorText);

  return (
    <label className="flex flex-col gap-1 text-gray-800" htmlFor={label}>
      <span className="text-lg font-medium">
        {label}
        {props.required ? <span className="text-blind-500">*</span> : null}
      </span>
      {hasDescription ? (
        <span className="text-sm text-gray-500">{description}</span>
      ) : null}
      {hasErrorText ? (
        <span className="text-sm text-red-500">{errorText}</span>
      ) : null}
      <input
        id={label}
        ref={ref}
        className={`focus:ring-blind-500 mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
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
