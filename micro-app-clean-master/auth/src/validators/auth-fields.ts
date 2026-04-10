import { body } from "express-validator";

/**
 * Sans normalizeEmail() (souvent capricieux en express-validator v7) : trim + lower case manuel dans le handler.
 */
export const emailField = () =>
  body("email")
    .customSanitizer((v) => String(v ?? "").trim().toLowerCase())
    .notEmpty()
    .withMessage("Email requis")
    .isEmail()
    .withMessage("Email invalide");

export const passwordSigninField = () =>
  body("password")
    .customSanitizer((v) => String(v ?? ""))
    .notEmpty()
    .withMessage("Mot de passe requis");

export const passwordSignupField = () =>
  body("password")
    .customSanitizer((v) => String(v ?? ""))
    .isLength({ min: 4, max: 20 })
    .withMessage("Le mot de passe doit faire entre 4 et 20 caractères");
