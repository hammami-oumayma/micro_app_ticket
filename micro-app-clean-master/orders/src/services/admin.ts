import { NotAuthorizedError } from "@eftickets/common";

export const isAdminEmail = (email?: string): boolean => {
  const configured = process.env.ADMIN_EMAIL?.trim();
  if (!configured || configured === "*") {
    return false;
  }
  if (!email) return false;
  const allowed = configured
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
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
