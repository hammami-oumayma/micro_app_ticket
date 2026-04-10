import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";

const router = express.Router();

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/api/tickets", async (req: Request, res: Response) => {
  const base = {
    approvalStatus: "approved" as const,
    $or: [{ orderId: { $exists: false } }, { orderId: null }],
  };

  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  let filter: Record<string, unknown>;

  if (category && category !== "all") {
    filter = { ...base, category };
  } else {
    filter = { ...base };
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter = {
      $and: [
        filter,
        {
          $or: [{ title: rx }, { venue: rx }],
        },
      ],
    };
  }

  let query = Ticket.find(filter);
  const sort = typeof req.query.sort === "string" ? req.query.sort : "";
  if (sort === "price_asc") {
    query = query.sort({ price: 1 });
  } else if (sort === "price_desc") {
    query = query.sort({ price: -1 });
  } else {
    query = query.sort({ _id: -1 });
  }

  const tickets = await query;
  res.send(tickets);
});

export { router as indexTicketRouter };
