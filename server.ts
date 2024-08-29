import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
dotenv.config();

const app: Application = express();
const port = process.env.PORT ?? 8000;

//using the dependencies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./route/promtRoute"));

const url: string = process.env.MONGODB_URI || "";

if (!url) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

// Database connection
mongoose
  .connect(url)
  .then(() => console.log("Database connected!"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ ping: "Server is running" });
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
