import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from "@eftickets/common";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { rabbitWrapper } from "../rabbit-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
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
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket");
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    const eventDate = req.body.eventDate
      ? new Date(req.body.eventDate)
      : undefined;

    const { lat, lng } = req.body;
    ticket.set({
      title: req.body.title,
      price: req.body.price,
      category: req.body.category?.trim() || ticket.category,
      venue: req.body.venue?.trim() ?? ticket.venue,
      eventDate: eventDate ?? ticket.eventDate,
      lat:
        lat !== undefined && lat !== null && lat !== ""
          ? Number(lat)
          : ticket.lat,
      lng:
        lng !== undefined && lng !== null && lng !== ""
          ? Number(lng)
          : ticket.lng,
    });
    await ticket.save();
    new TicketUpdatedPublisher(rabbitWrapper.client).publish({
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

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
