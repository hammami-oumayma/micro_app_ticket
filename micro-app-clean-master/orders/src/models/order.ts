import mongoose from "mongoose";
import { randomBytes } from "crypto";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@eftickets/common";
import { TicketDoc } from "./ticket";
export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  payableAmount: number;
  promoCode?: string;
  discountPercent?: number;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  payableAmount?: number;
  promoCode?: string;
  discountPercent?: number;
  entryCode?: string;
  entryScannedAt?: Date;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
    entryCode: {
      type: String,
      default: () => randomBytes(6).toString("hex").toUpperCase(),
    },
    payableAmount: {
      type: Number,
      min: 0,
    },
    promoCode: {
      type: String,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    entryScannedAt: {
      type: Date,
    },
  },
   {
    toJSON: {
      transform(_doc: mongoose.Document, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
