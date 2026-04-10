import express, { Request, Response } from "express";
import { validateRequest, BadRequestError } from "@eftickets/common";

import { User } from "../models/user";
import { UserDocMethod } from "../types/IUser";
import { isAdminEmail } from "../services/admin";
import { getTokenCookieOptions } from "../services/cookie-options";
import { emailField, passwordSignupField } from "../validators/auth-fields";

const router = express.Router();

router.post(
  "/api/users/signup",
  [emailField(), passwordSignupField()],
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

const sendTokenResponse = async (
  user: UserDocMethod,
  codeStatus: number,
  res: any
) => {
  const token = await user.getJwtToken();
  const options = getTokenCookieOptions();

  res.status(codeStatus).cookie("token", token, options).send({
    id: user.id,
    email: user.email,
    isAdmin: isAdminEmail(user.email),
  });
};

export { router as signupRouter };
