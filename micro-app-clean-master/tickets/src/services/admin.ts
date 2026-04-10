import { NotAuthorizedError } from "@eftickets/common";

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

export const assertReqIsAdmin = (req: {
  currentUser?: { email?: string };
}) => {
  const configured = process.env.ADMIN_EMAIL?.trim();
  if (!configured) {
    throw new NotAuthorizedError();
  }
  if (configured === "*") {
    return;
  }
  if (!isAdminEmail(req.currentUser?.email)) {
    throw new NotAuthorizedError();
  }
};
