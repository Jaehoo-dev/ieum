import { isEmptyStringOrNil } from "@ieum/utils";

interface Props<T extends string | number = string> {
  label: string;
  options: Array<{
    label: string;
    value: T;
  }>;
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
  const hasSublabel = hasErrorText || hasDescription;

  return (
    <div className="flex flex-col gap-1 text-gray-800">
      <span className="text-lg font-medium">
        {`${label}${required ? "*" : ""}`}
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
      <div
        className={`grid gap-1.5 ${
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
        {options.map(({ label, value }) => {
          return (
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

                console.log(selectedValues, max);

                if (추가하는가 && max != null && selectedValues.length >= max) {
                  return;
                }

                const newValue = 추가하는가
                  ? [...selectedValues, value]
                  : selectedValues.filter((v) => v !== value);

                onChange(newValue);
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
