import mongoose from "mongoose";

export interface PromoAttrs {
  code: string;
  percentOff: number;
  active: boolean;
  expiresAt?: Date;
  maxUses?: number;
  uses: number;
}

const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percentOff: { type: Number, required: true, min: 1, max: 90 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
    maxUses: { type: Number, min: 1 },
    uses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Promo = mongoose.model("Promo", promoSchema);

export { Promo };
