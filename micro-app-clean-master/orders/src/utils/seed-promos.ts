import { Promo } from "../models/promo";

/** Demo promo codes for jury / local dev (idempotent). */
export async function seedDefaultPromos(): Promise<void> {
  await Promo.updateOne(
    { code: "DEMO20" },
    {
      $setOnInsert: {
        code: "DEMO20",
        percentOff: 20,
        active: true,
        uses: 0,
      },
    },
    { upsert: true }
  );
  await Promo.updateOne(
    { code: "EARLY10" },
    {
      $setOnInsert: {
        code: "EARLY10",
        percentOff: 10,
        active: true,
        uses: 0,
      },
    },
    { upsert: true }
  );
}
