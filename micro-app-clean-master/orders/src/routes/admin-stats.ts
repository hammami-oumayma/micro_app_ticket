import express, { Request, Response } from "express";
import { requireAuth, NotAuthorizedError, OrderStatus } from "@eftickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/admin/stats",
  requireAuth,
  async (req: Request, res: Response) => {
    const configured = process.env.ADMIN_EMAIL?.trim();
    if (!configured) {
      throw new NotAuthorizedError();
    }

    // Dev mode shortcut: ADMIN_EMAIL=* lets any authenticated user access stats.
    if (configured === "*") {
      return sendStats(res);
    }

    // Supports one email or comma-separated list.
    const allowedEmails = configured
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!allowedEmails.includes(req.currentUser!.email.toLowerCase())) {
      throw new NotAuthorizedError();
    }

    return sendStats(res);
  }
);

const sendStats = async (res: Response) => {
    const totalOrders = await Order.countDocuments();

    const byStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { status: OrderStatus.Complete } },
      {
        $lookup: {
          from: "tickets",
          localField: "ticket",
          foreignField: "_id",
          as: "tk",
        },
      },
      { $unwind: "$tk" },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$tk.price" },
          paidOrders: { $sum: 1 },
        },
      },
    ]);

    const revenueRow = revenueAgg[0] || { revenue: 0, paidOrders: 0 };

    res.send({
      totalOrders,
      byStatus: byStatus.map((r) => ({ status: r._id, count: r.count })),
      revenue: revenueRow.revenue,
      completedOrderCount: revenueRow.paidOrders,
    });
};

export { router as adminStatsRouter };
