import express from "express";
import cors from "cors";
import { env } from "./env";
import { router } from "./routes/transactions";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", router);

// Centralized error handler so route handlers can just throw.
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
);

app.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port}`);
});
