export function isKrPhoneNumberWithoutHyphens(phoneNumber: string) {
  return /^010\d{8}$/.test(phoneNumber);
}
