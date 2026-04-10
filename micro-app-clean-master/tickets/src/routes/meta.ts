import express, { Request, Response } from "express";
import { requireAuth } from "@eftickets/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/mine", requireAuth, async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ userId: req.currentUser!.id }).sort({
    _id: -1,
  });
  res.send(tickets);
});

router.get("/api/tickets/categories", async (_req: Request, res: Response) => {
  const raw = await Ticket.distinct("category", {
    approvalStatus: "approved",
    $or: [{ orderId: { $exists: false } }, { orderId: null }],
  });
  const categories = raw
    .map((c) => (typeof c === "string" ? c.trim() : String(c)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
  res.send(categories);
});

export { router as ticketMetaRouter };
