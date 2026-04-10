import { NotAuthorizedError } from "@eftickets/common";
import { User } from "../models/user";

/**
 * Résout la config admin : en dev, si ADMIN_EMAIL est absent, défaut admin@example.com
 * (aligné sur le seed / docker-compose).
 */
const resolveAdminEmailConfig = (): string => {
  const raw = process.env.ADMIN_EMAIL?.trim();
  if (raw) return raw;
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "admin@example.com";
};

export const resolveAdminEmails = (): string[] => {
  const configured = resolveAdminEmailConfig();
  if (!configured || configured === "*") {
    return [];
  }

  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

/** Règle pour l’UI (current-user) : email issu du JWT. */
export const isAdminEmail = (email?: string): boolean => {
  if (!email?.trim()) return false;
  const configured = resolveAdminEmailConfig();
  if (!configured) return false;
  if (configured === "*") return true;
  return resolveAdminEmails().includes(email.toLowerCase());
};

/**
 * Pour les routes sensibles : l’email admin est relu en base à partir de l’id JWT
 * (évite les refus si le JWT ne contient pas l’email selon la version du middleware).
 */
export const assertReqIsAdmin = async (req: {
  currentUser?: { id?: string; email?: string };
}): Promise<void> => {
  const id = req.currentUser?.id;
  if (!id) {
    throw new NotAuthorizedError();
  }

  const row = await User.findById(id).select("email").lean();
  const email =
    row && typeof row === "object" && "email" in row
      ? String((row as { email: string }).email).trim().toLowerCase()
      : "";

  if (!email || !isAdminEmail(email)) {
    throw new NotAuthorizedError();
  }
};
