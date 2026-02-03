import express from "express";
import ticketRoutes from "./routes/ticketRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

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
