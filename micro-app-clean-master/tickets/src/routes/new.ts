import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
} from "@eftickets/common";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { rabbitWrapper } from "../rabbit-wrapper";
import { isAdminEmail } from "../services/admin";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be 0 or greater"),
    body("category").optional().isString().isLength({ max: 80 }),
    body("venue").optional().isString().isLength({ max: 120 }),
    body("eventDate").optional({ values: "falsy" }).isISO8601(),
    body("lat").optional().isFloat({ min: -90, max: 90 }),
    body("lng").optional().isFloat({ min: -180, max: 180 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price, category, venue, eventDate, lat, lng } = req.body;
    const approvalStatus = isAdminEmail(req.currentUser?.email)
      ? "approved"
      : "pending";

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
      category: category?.trim() || "Général",
      venue: venue?.trim() || "",
      eventDate: eventDate ? new Date(eventDate) : undefined,
      approvalStatus,
      lat: lat !== undefined && lat !== null ? Number(lat) : undefined,
      lng: lng !== undefined && lng !== null ? Number(lng) : undefined,
    });
    await ticket.save();

    if (ticket.approvalStatus === "approved") {
      new TicketCreatedPublisher(rabbitWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
        category: ticket.category,
        venue: ticket.venue,
        eventDate: ticket.eventDate
          ? ticket.eventDate.toISOString()
          : undefined,
      } as any);
    }

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
