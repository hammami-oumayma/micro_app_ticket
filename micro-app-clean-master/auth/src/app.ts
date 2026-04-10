import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import { errorHandler, NotFoundError, isAuthenticated } from "@eftickets/common";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { updatePasswordRouter } from "./routes/update-password";
import { adminUsersRouter } from "./routes/admin-users";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(cookieParser());
// Décode le JWT cookie sur chaque requête (comme orders/tickets) — requis pour requireAuth.
app.use(isAuthenticated);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(updatePasswordRouter);
app.use(adminUsersRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
