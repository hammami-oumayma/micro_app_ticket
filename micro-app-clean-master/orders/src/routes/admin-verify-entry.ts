import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  OrderStatus,
} from "@eftickets/common";
import { Order } from "../models/order";
import { assertReqIsAdmin } from "../services/admin";

const router = express.Router();

router.post(
  "/api/orders/admin/verify-entry",
  requireAuth,
  [body("entryCode").not().isEmpty().trim()],
  validateRequest,
  async (req: Request, res: Response) => {
    assertReqIsAdmin(req);
    const entryCode = (req.body.entryCode as string).trim().toUpperCase();

    const order = await Order.findOne({ entryCode }).populate("ticket");
    if (!order) {
      return res.status(200).send({ ok: false, reason: "not_found" });
    }
    if (order.status !== OrderStatus.Complete) {
      return res.status(200).send({ ok: false, reason: "not_paid" });
    }
    if (order.entryScannedAt) {
      return res.status(200).send({
        ok: false,
        reason: "already_used",
        scannedAt: order.entryScannedAt.toISOString(),
      });
    }

    order.set({ entryScannedAt: new Date() });
    await order.save();

    const ticket = order.ticket as { title?: string } | undefined;
    return res.status(200).send({
      ok: true,
      title: ticket?.title,
      entryCode: order.entryCode,
    });
  }
);

export { router as adminVerifyEntryRouter };
