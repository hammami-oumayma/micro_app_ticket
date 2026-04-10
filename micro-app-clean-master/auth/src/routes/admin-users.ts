import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
  requireAuth,
  BadRequestError,
  NotFoundError,
} from "@eftickets/common";
import { User } from "../models/user";
import { assertReqIsAdmin } from "../services/admin";

const router = express.Router();

router.get(
  "/api/users/admin/list",
  requireAuth,
  async (req: Request, res: Response) => {
    await assertReqIsAdmin(req);
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    const safe = users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    res.send(safe);
  }
);

router.delete(
  "/api/users/admin/:userId",
  requireAuth,
  async (req: Request, res: Response) => {
    await assertReqIsAdmin(req);
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user id");
    }
    if (userId === req.currentUser!.id) {
      throw new BadRequestError("Cannot delete your own account");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError();
    }
    await User.deleteOne({ _id: userId });
    res.status(204).send({});
  }
);

export { router as adminUsersRouter };
