import { ComponentPropsWithRef, forwardRef } from "react";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props extends ComponentPropsWithRef<"textarea"> {
  label: string;
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
      <textarea
        ref={ref}
        id={label}
        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 ${
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
