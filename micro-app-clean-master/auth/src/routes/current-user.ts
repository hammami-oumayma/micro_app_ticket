import express from "express";
import { isAuthenticated } from "@eftickets/common";
import { isAdminEmail } from "../services/admin";

const router = express.Router();

router.get("/api/users/currentuser", isAuthenticated, (req, res) => {
  if (!req.currentUser) {
    res.send({ currentUser: null });
    return;
  }

  res.send({
    currentUser: {
      ...req.currentUser,
      isAdmin: isAdminEmail(req.currentUser.email),
    },
  });
});

export { router as currentUserRouter };
