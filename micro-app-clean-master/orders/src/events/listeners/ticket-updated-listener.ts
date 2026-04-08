import { ExchangeNames, Consumer, TicketUpdatedEvent } from "@eftickets/common";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Consumer<TicketUpdatedEvent> {
  readonly exchangeName = ExchangeNames.TicketUpdated;
  routingKey = "ticketsKeyUpdate";
  exchangeType = "direct";
  queueName = "ticketsUpdateQueue";

  async onMessage(data: TicketUpdatedEvent["data"] & {
    category?: string;
    venue?: string;
    eventDate?: string;
  }) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const { title, price, category, venue, eventDate } = data;
    ticket.set({ title, price });
    if (category !== undefined) ticket.set({ category });
    if (venue !== undefined) ticket.set({ venue });
    if (eventDate !== undefined) ticket.set({ eventDate });
    await ticket.save();
  }
}
