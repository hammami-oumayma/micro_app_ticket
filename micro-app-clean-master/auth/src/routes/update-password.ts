import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  requireAuth,
  BadRequestError,
  NotFoundError,
} from "@eftickets/common";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.put(
  "/api/users/password",
  requireAuth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .trim()
      .isLength({ min: 6, max: 72 })
      .withMessage("New password must be between 6 and 72 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser!.id);
    if (!user) {
      throw new NotFoundError();
    }

    const { currentPassword, newPassword } = req.body;

    const passwordsMatch = await Password.compare(
      user.get("password"),
      currentPassword
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid current password");
    }

    user.set({ password: newPassword });
    await user.save();

    res.send({ message: "Password updated successfully" });
  }
);

export { router as updatePasswordRouter };
