import express from "express";
import { getClearTokenCookieOptions } from "../services/cookie-options";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  res.clearCookie("token", getClearTokenCookieOptions());
  res.send({});
});

export { router as signoutRouter };
