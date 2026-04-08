import dotenv from "dotenv";
dotenv.config();

import { rabbitWrapper } from "./rabbit-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import mongoose from "mongoose";
import express from "express";

const start = async () => {
  console.log("🔹 Starting Expiration Service...");

  if (!process.env.RABBITMQ_URL) throw new Error("RABBITMQ client must be defined");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined");

  try {
    // MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // RabbitMQ avec retry
    const maxRetries = 5;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await rabbitWrapper.connect(process.env.RABBITMQ_URL);
        console.log("✅ Connected to RabbitMQ");
        break;
      } catch (err) {
        attempt++;
        console.log(`❌ RabbitMQ connection failed (attempt ${attempt}), retrying in 2s...`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    // Listener
    new OrderCreatedListener(rabbitWrapper.client).consumeMessage();

    // Signals
    process.on("SIGINT", async () => {
      await rabbitWrapper.client.close();
      await mongoose.connection.close();
      process.exit();
    });
    process.on("SIGTERM", async () => {
      await rabbitWrapper.client.close();
      await mongoose.connection.close();
      process.exit();
    });

    // Health check HTTP
    const app = express();
    app.get("/health", (req, res) => res.send("Expiration Service is healthy ✅"));
    const port = Number(process.env.PORT || 3007);
    app.listen(port, () =>
      console.log(`🚀 HTTP server running on port ${port}`)
    );
  } catch (err) {
    console.error("❌ Error starting service:", err);
  }
};

start();