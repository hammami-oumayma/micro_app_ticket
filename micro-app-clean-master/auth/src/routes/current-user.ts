import express from "express";
import { isAuthenticated } from "@eftickets/common";
import { isAdminEmail } from "../services/admin";
import { User } from "../models/user";

const router = express.Router();

router.get("/api/users/currentuser", isAuthenticated, async (req, res) => {
  if (!req.currentUser) {
    res.send({ currentUser: null });
    return;
  }

  let email = req.currentUser.email;
  if (req.currentUser.id) {
    const u = await User.findById(req.currentUser.id).select("email").lean();
    if (u && typeof u === "object" && "email" in u) {
      email = (u as { email: string }).email;
    }
  }

  res.send({
    currentUser: {
      ...req.currentUser,
      email,
      isAdmin: isAdminEmail(email),
    },
  });
});

export { router as currentUserRouter };
