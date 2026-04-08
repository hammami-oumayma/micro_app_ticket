export const resolveAdminEmails = (): string[] => {
  const configured = process.env.ADMIN_EMAIL?.trim();
  if (!configured || configured === "*") {
    return [];
  }

  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const isAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const admins = resolveAdminEmails();
  return admins.includes(email.toLowerCase());
};
