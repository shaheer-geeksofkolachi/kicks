export function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function parseSizesInput(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
