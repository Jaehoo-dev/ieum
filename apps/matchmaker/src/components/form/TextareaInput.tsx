import { ComponentPropsWithRef, forwardRef } from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props extends ComponentPropsWithRef<"textarea"> {
  label?: string;
  description?: string;
  error?: boolean;
  errorText?: string;
}

function _TextareaInput(
  {
    label,
    description,
    error = false,
    errorText,
    autoComplete = "off",
    ...props
  }: Props,
  ref: typeof props.ref,
) {
  const hasErrorText = error && !isEmptyStringOrNil(errorText);
  const hasDescription = !isEmptyStringOrNil(description);

  return (
    <label className="flex flex-col gap-1 text-gray-800" htmlFor={label}>
      {label != null || props.required ? (
        <span className="text-lg font-medium">
          {label}
          {props.required ? <span className="text-primary-500">*</span> : null}
        </span>
      ) : null}
      {hasDescription ? (
        <span className="text-sm text-gray-500">{description}</span>
      ) : null}
      {hasErrorText ? (
        <span className="text-sm text-red-500">{errorText}</span>
      ) : null}
      <textarea
        ref={ref}
        id={label}
        className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        autoComplete={autoComplete}
        rows={4}
        {...props}
      />
    </label>
  );
}

export const TextareaInput = forwardRef(_TextareaInput);
