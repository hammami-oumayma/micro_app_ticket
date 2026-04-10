import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
  category?: string;
  venue?: string;
  eventDate?: Date;
  approvalStatus?: "pending" | "approved" | "rejected";
  lat?: number;
  lng?: number;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
  category: string;
  venue: string;
  eventDate?: Date;
  approvalStatus: "pending" | "approved" | "rejected";
  lat?: number;
  lng?: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
    category: {
      type: String,
      default: 'Général',
    },
    venue: {
      type: String,
      default: '',
    },
    eventDate: {
      type: Date,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  {
    toJSON: {
      transform(doc, ret: any) {
      ret.id = ret._id;
        delete ret?._id;
      },
    },
  }
);
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
