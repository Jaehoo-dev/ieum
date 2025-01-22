import { isEmptyStringOrNil } from "@ieum/utils";

interface Props<T extends string | number = string> {
  label: string;
  options: {
    label: string;
    value: T;
  }[];
  selectedValues: T[];
  onChange: (value: T[]) => void;
  required?: boolean;
  description?: string;
  error?: boolean;
  errorText?: string;
  cols?: 1 | 2 | 3 | 4 | 5;
  max?: number;
}

export function MultiSelect<T extends string | number = string>({
  label,
  options,
  selectedValues,
  onChange,
  required,
  description,
  error,
  errorText,
  cols,
  max,
}: Props<T>) {
  const hasErrorText = error && !isEmptyStringOrNil(errorText);
  const hasDescription = !isEmptyStringOrNil(description);

  return (
    <div className="flex flex-col gap-1 text-gray-800">
      <span className="text-lg font-medium">
        {label}
        {required ? <span className="text-primary-500">*</span> : null}
      </span>
      {hasDescription ? (
        <span className="text-sm text-gray-500">{description}</span>
      ) : null}
      {hasErrorText ? (
        <span className="text-sm text-red-500">{errorText}</span>
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
        {options.map(({ label, value }, index) => {
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              role="checkbox"
              key={String(value)}
              className={`cursor-pointer rounded-lg border border-gray-300 px-4 py-2 outline-none ${
                selectedValues.includes(value)
                  ? "bg-primary-100 ring-2 ring-primary-500"
                  : ""
              }`}
              onClick={() => {
                const 추가하는가 = !selectedValues.includes(value);

                if (추가하는가 && max != null && selectedValues.length >= max) {
                  return;
                }

                const newValue = 추가하는가
                  ? [...selectedValues, value]
                  : selectedValues.filter((v) => v !== value);

                onChange(newValue);
              }}
              tabIndex={index}
              aria-checked={selectedValues.includes(value)}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
