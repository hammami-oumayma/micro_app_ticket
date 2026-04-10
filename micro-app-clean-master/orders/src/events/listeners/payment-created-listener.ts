import {
  ExchangeNames,
  Consumer,
  PaymentCreatedEvent,
  OrderStatus,
} from "@eftickets/common";

import { Order } from "../../models/order";
import { sendOrderPaidEmail } from "../../utils/mail";

export class PaymentCreatedListener extends Consumer<PaymentCreatedEvent> {
  readonly exchangeName = ExchangeNames.PaymentCreated;
  routingKey = "paymentKeyCreate";
  exchangeType = "direct";
  queueName = "paymentQueueCreate";

  async onMessage(data: PaymentCreatedEvent["data"]) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    const ticket = order.ticket as { title?: string; price?: number } | undefined;
    const title = ticket?.title || "Your ticket";
    const amount =
      order.payableAmount !== undefined && order.payableAmount !== null
        ? order.payableAmount
        : ticket?.price;
    try {
      await sendOrderPaidEmail({
        subject: `Confirmation — ${title}`,
        html: `<p>Thank you. Your order is paid.</p><p><strong>${title}</strong></p><p>Amount: <strong>${amount} USD</strong></p><p>Entry code: <strong>${order.entryCode}</strong></p>`,
      });
    } catch (err) {
      console.error("notify mail (paid) failed", err);
    }

    // msg.ack();
  }
}
