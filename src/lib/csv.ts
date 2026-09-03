function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface SignupCsvRow {
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
}

export function signupsToCsv(signups: SignupCsvRow[]): string {
  const header = ["Name", "Email", "Phone", "Signed Up At"];
  const rows = signups.map((s) => [
    s.name,
    s.email ?? "",
    s.phone ?? "",
    s.createdAt.toISOString(),
  ]);
  return [header, ...rows]
    .map((row) => row.map((field) => escapeCsvField(field)).join(","))
    .join("\r\n");
}
