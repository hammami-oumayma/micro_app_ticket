import express, { Request, Response } from "express";
import { requireAuth, NotFoundError, BadRequestError } from "@eftickets/common";
import { Ticket } from "../models/ticket";
import { assertReqIsAdmin } from "../services/admin";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { rabbitWrapper } from "../rabbit-wrapper";
import { sendTicketApprovedEmail } from "../utils/mail";

const router = express.Router();

router.get("/api/tickets/admin/pending", requireAuth, async (req: Request, res: Response) => {
  assertReqIsAdmin(req);
  const tickets = await Ticket.find({ approvalStatus: "pending" });
  res.send(tickets);
});

router.get("/api/tickets/admin/list", requireAuth, async (req: Request, res: Response) => {
  assertReqIsAdmin(req);
  const tickets = await Ticket.find({}).sort({ _id: -1 }).limit(500);
  res.send(tickets);
});

router.patch(
  "/api/tickets/admin/:id/approve",
  requireAuth,
  async (req: Request, res: Response) => {
    assertReqIsAdmin(req);

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.approvalStatus === "approved") {
      res.send(ticket);
      return;
    }
    if (ticket.approvalStatus === "rejected") {
      throw new BadRequestError("Cannot approve a rejected ticket");
    }

    ticket.set({ approvalStatus: "approved" });
    await ticket.save();

    try {
      await sendTicketApprovedEmail({
        subject: `Listing approved — ${ticket.title}`,
        html: `<p>Your event listing was approved.</p><p><strong>${ticket.title}</strong></p>`,
      });
    } catch (err) {
      console.error("notify mail (ticket approved) failed", err);
    }

    new TicketCreatedPublisher(rabbitWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      category: ticket.category,
      venue: ticket.venue,
      eventDate: ticket.eventDate ? ticket.eventDate.toISOString() : undefined,
    } as any);

    res.send(ticket);
  }
);

router.delete(
  "/api/tickets/admin/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    assertReqIsAdmin(req);

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.orderId) {
      throw new BadRequestError("Cannot delete a reserved ticket");
    }
    if (ticket.approvalStatus === "approved") {
      throw new BadRequestError("Cannot delete an approved ticket");
    }

    await Ticket.deleteOne({ _id: ticket.id });
    res.status(204).send({});
  }
);

export { router as adminTicketRouter };
