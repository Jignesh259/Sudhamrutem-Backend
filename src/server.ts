import cors from "cors";
import express from "express";
import path from "path";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), env.uploadsDir))
);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Sudhamrutam backend running",
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Sudhamrutam API listening on ${env.apiBaseUrl}`);
});
