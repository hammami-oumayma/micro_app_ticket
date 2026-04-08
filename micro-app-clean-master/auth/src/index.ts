import dotenv from "dotenv";
dotenv.config();  // ← charge le .env
import mongoose from "mongoose";

import { app } from "./app";
import { User } from "./models/user";

const seedDemoUsers = async () => {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  if (process.env.SEED_DEMO_USERS === "false") {
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const demoUsers = [adminEmail || "admin@example.com", "client@example.com"];

  for (const email of demoUsers) {
    const existing = await User.findOne({ email });
    if (!existing) {
      const created = User.build({ email, password: "password" });
      await created.save();
      continue;
    }

    // Keep demo credentials predictable to avoid local login lockouts.
    existing.set({ password: "password" });
    await existing.save();
  }

  console.log(
    `Demo users ready: ${demoUsers.join(", ")} (password: password)`
  );
};

const start = async () => {
  console.log("starting......");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined!");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined!");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDb!");
    await seedDemoUsers();
  } catch (err) {
    console.error(err);
  }

  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

start();
