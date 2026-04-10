import mongoose from 'mongoose';

export type PaymentModeType = "stripe" | "manual" | "cash_on_delivery";

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
  paymentMode?: PaymentModeType;
  amount?: number;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  paymentMode: PaymentModeType;
  amount?: number;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
    paymentMode: {
      type: String,
      enum: ["stripe", "manual", "cash_on_delivery"],
      default: "stripe",
    },
    amount: {
      type: Number,
      min: 0,
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

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
