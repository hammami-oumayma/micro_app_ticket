import express, { Request, Response } from "express";
import { requireAuth } from "@eftickets/common";
import { Payment } from "../models/payment";
import { assertReqIsAdmin } from "../services/admin";

const router = express.Router();

router.get(
  "/api/payments/admin/list",
  requireAuth,
  async (req: Request, res: Response) => {
    assertReqIsAdmin(req);
    const payments = await Payment.find({}).sort({ _id: -1 }).limit(500);
    res.send(payments);
  }
);

export { router as adminPaymentListRouter };
