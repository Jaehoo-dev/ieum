export function formatUniqueMemberName(member: {
  name: string;
  phoneNumber: string;
}): string {
  return `${member.name}(${member.phoneNumber.slice(-4)})`;
}
