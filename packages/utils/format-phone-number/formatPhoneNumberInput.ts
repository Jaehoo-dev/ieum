import { isEmptyStringOrNil } from "../isEmptyStringOrNil";

export function formatPhoneNumberInput(phoneNumber: string) {
  return phoneNumber
    .replace(/[^0-9]/g, "")
    .slice(0, 11)
    .replace(
      /(\d{1,3})(\d{1,4})?(\d{1,4})?/,
      // @ts-expect-error: p1, p2, p3 can be undefined
      (_, p1?: string, p2?: string, p3?: string) => {
        if (!isEmptyStringOrNil(p3)) {
          return `${p1}-${p2}-${p3}`;
        }

        if (!isEmptyStringOrNil(p2)) {
          return `${p1}-${p2}`;
        }

        return p1;
      },
    );
}
