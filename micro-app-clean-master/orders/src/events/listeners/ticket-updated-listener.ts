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
    let ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      const existing = await Ticket.findById(data.id);
      if (!existing) {
        console.warn(
          "[TicketUpdatedListener] Ticket absent in orders DB; skip",
          data.id
        );
        return;
      }
      if (existing.version >= data.version) {
        return;
      }
      if (existing.version !== data.version - 1) {
        console.warn(
          "[TicketUpdatedListener] Version gap; skip",
          data.id,
          { current: existing.version, event: data.version }
        );
        return;
      }
      ticket = existing;
    }

    const { title, price, category, venue, eventDate } = data;
    ticket.set({ title, price });
    if (category !== undefined) ticket.set({ category });
    if (venue !== undefined) ticket.set({ venue });
    if (eventDate !== undefined) ticket.set({ eventDate });
    await ticket.save();
  }
}
