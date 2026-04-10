import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@eftickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { Promo } from "../models/promo";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { rabbitWrapper } from "../rabbit-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 2 * 60;

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
    body("promoCode")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ min: 1, max: 32 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const rawPromo = req.body.promoCode as string | undefined;
    const promoCode = rawPromo?.trim().toUpperCase();

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    const basePrice = roundMoney(Number(ticket.price));
    let payableAmount = basePrice;
    let appliedPromoCode: string | undefined;
    let discountPercent: number | undefined;

    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode });
      if (!promo || !promo.active) {
        throw new BadRequestError("Invalid or inactive promo code");
      }
      if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
        throw new BadRequestError("Promo code has expired");
      }
      if (promo.maxUses != null && promo.uses >= promo.maxUses) {
        throw new BadRequestError("Promo code usage limit reached");
      }
      const off = roundMoney((basePrice * promo.percentOff) / 100);
      payableAmount = roundMoney(Math.max(0, basePrice - off));
      appliedPromoCode = promo.code;
      discountPercent = promo.percentOff;
      promo.uses += 1;
      await promo.save();
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
      payableAmount,
      promoCode: appliedPromoCode,
      discountPercent,
    });
    await order.save();

    const publishPayload = {
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      payableAmount: order.payableAmount,
    };

    new OrderCreatedPublisher(rabbitWrapper.client).publish(
      publishPayload as any
    );

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
