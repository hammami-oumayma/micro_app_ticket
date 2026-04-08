import { Consumer, TicketCreatedEvent, ExchangeNames } from "@eftickets/common";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Consumer<TicketCreatedEvent> {
  readonly exchangeName = ExchangeNames.TicketCreated;
  routingKey = "ticketsKeyCreate";
  exchangeType = "direct";
  queueName = "ticketsCreateQueue";

  async onMessage(data: TicketCreatedEvent["data"] & {
    category?: string;
    venue?: string;
    eventDate?: string;
  }) {
    const { id, title, price, category, venue, eventDate } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
      category,
      venue,
      eventDate,
    });
    await ticket.save();
  }
}
