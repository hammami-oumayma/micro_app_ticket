import { Consumer, OrderCreatedEvent, ExchangeNames } from "@eftickets/common";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Consumer<OrderCreatedEvent> {
  readonly exchangeName = ExchangeNames.OrderCreated;
  routingKey = "ordersKeyCreate";
  exchangeType = "direct";
  queueName = "ordersQueuCreate";

  async onMessage(data: OrderCreatedEvent["data"]) {
    const payload = data as OrderCreatedEvent["data"] & { payableAmount?: number };
    const listPrice = data.ticket.price;
    const payable = payload.payableAmount ?? listPrice;
    const order = Order.build({
      id: data.id,
      price: listPrice,
      payableAmount: payable,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    // msg.ack();
  }
}
