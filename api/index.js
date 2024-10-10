import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dishRoute from "./routes/dish.route.js";
import restaurantRoute from "./routes/restaurant.route.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use("/api", dishRoute);
app.use("/api", restaurantRoute);
app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.listen(3001, () => {
  console.log("App is running on port 3001 ");
});
