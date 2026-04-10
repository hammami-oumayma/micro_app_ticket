import type { CookieOptions } from "express";

/**
 * Cookie JWT : ne pas utiliser `secure: true` sur HTTP (localhost), sinon le navigateur n'envoie jamais le cookie → 401.
 * En prod HTTPS : définir COOKIE_SECURE=true dans l'environnement.
 */
export const getTokenCookieOptions = (): CookieOptions => {
  const opts: CookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    path: "/",
    sameSite: "lax",
  };
  if (process.env.COOKIE_SECURE === "true") {
    opts.secure = true;
  }
  return opts;
};

export const getClearTokenCookieOptions = (): CookieOptions => ({
  path: "/",
  sameSite: "lax",
  ...(process.env.COOKIE_SECURE === "true" ? { secure: true } : {}),
});
