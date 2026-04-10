import express, { Request, Response } from "express";
import { requireAuth } from "@eftickets/common";
import { Order } from "../models/order";
import { assertReqIsAdmin } from "../services/admin";

const router = express.Router();

router.get(
  "/api/orders/admin/list",
  requireAuth,
  async (req: Request, res: Response) => {
    assertReqIsAdmin(req);
    const orders = await Order.find({})
      .populate("ticket")
      .sort({ _id: -1 })
      .limit(500);
    res.send(orders);
  }
);

export { router as adminOrderListRouter };
