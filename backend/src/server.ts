import cors from "cors";
import express from "express";
import ticketRoutes from "./routes/ticketRoutes";
import { errorHandler } from "./middleware/errorHandler";

const allowedOrigins = [
  "http://localhost:5173",
  "https://mini-support-web.vercel.app",
];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  }),
);
app.use(express.json());

app.use("/tickets", ticketRoutes);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
