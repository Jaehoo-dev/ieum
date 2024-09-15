import { isEmptyStringOrNil } from "../isEmptyStringOrNil";

export function handleNullableStringNumber(value: string | null) {
  if (isEmptyStringOrNil(value)) {
    return null;
  }

  const valueAsNumber = Number(value);

  return isNaN(valueAsNumber) ? null : valueAsNumber;
}
