import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  // Billets approuvés et non réservés.
  const tickets = await Ticket.find({
    approvalStatus: "approved",
    $or: [{ orderId: { $exists: false } }, { orderId: null }],
  });

  res.send(tickets);
});

export { router as indexTicketRouter };
