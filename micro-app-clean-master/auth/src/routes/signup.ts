import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest, BadRequestError } from "@eftickets/common";

import { User } from "../models/user";
import { UserDocMethod } from "../types/IUser";
import { isAdminEmail } from "../services/admin";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    await sendTokenResponse(user as any, 201, res);
  }
);

interface TokenOptions {
  maxAge: number;
  httpOnly: boolean;
  secure?: boolean;
}

const sendTokenResponse = async (
  user: UserDocMethod,
  codeStatus: number,
  res: any
) => {
  const token = await user.getJwtToken();
  const options: TokenOptions = { maxAge: 60 * 60 * 1000, httpOnly: true };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(codeStatus).cookie("token", token, options).send({
    id: user.id,
    email: user.email,
    isAdmin: isAdminEmail(user.email),
  });
};

export { router as signupRouter };
