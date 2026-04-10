import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import {
  errorHandler,
  isAuthenticated,
  NotFoundError,
} from "@eftickets/common";
import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes/index";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { adminStatsRouter } from "./routes/admin-stats";
import { adminOrderListRouter } from "./routes/admin-list";
import { adminVerifyEntryRouter } from "./routes/admin-verify-entry";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(cookieParser());

app.use(isAuthenticated);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(adminStatsRouter);
app.use(adminOrderListRouter);
app.use(adminVerifyEntryRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
