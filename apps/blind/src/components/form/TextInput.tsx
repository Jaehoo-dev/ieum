import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: boolean;
  errorText?: string;
  right?: ReactNode;
}

function _TextInput(
  {
    label,
    description,
    error = false,
    errorText,
    right,
    autoComplete = "off",
    ...props
  }: Props,
  ref: Ref<HTMLInputElement>,
) {
  const hasDescription = !isEmptyStringOrNil(description);
  const hasErrorText = error && !isEmptyStringOrNil(errorText);

  return (
    <label className="flex flex-1 flex-col gap-1 text-gray-800" htmlFor={label}>
      <span className="text-lg font-medium">
        {label}
        {props.required ? <span className="text-blind-500">*</span> : null}
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
      <div className="relative w-full">
        <input
          id={label}
          ref={ref}
          className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blind-300 ${
            error ? "border-red-500" : "border-gray-300"
          } ${right ? "pr-10" : ""}`}
          type={props.type ?? "text"}
          autoComplete={autoComplete}
          {...props}
        />
        {right != null ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {right}
          </div>
        ) : null}
      </div>
    </label>
  );
}

export const TextInput = forwardRef(_TextInput);
