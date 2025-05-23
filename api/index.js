import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import bodyParser from "body-parser";
import dishRoute from "./routes/dish.route.js";
import restaurantRoute from "./routes/restaurant.route.js";
import ordersRoute from "./routes/order.route.js";
import sessionRoute from "./routes/session.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const razorpay = new Razorpay({
  key_id: "rzp_test_hlOwDlGGp9emrY",
  key_secret: "P5reXyu4ZkS4fGqLUPmQ47Ke",
});

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5102",
      "http://localhost:4200",
      "http://localhost:5173",
      "https://endusermenumania-1.onrender.com",
      "https://menumania.vercel.app",
      "https://endusermenumaniaangular.vercel.app",
    ], // Allow this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true, // Allow credentials if needed
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Body parser middleware (if you plan to handle JSON data)
app.use(express.json());

// Define routes after CORS setup
app.use("/api/dish", dishRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api", ordersRoute);
app.use("/api/session", sessionRoute);
app.get("/", (req, res) => {
  res.send("You are Good to GO!!");
});

app.post("/create-order", async (req, res) => {
  const options = {
    amount: req.body.amount, // Amount in smallest currency unit
    currency: "INR",
    receipt: "receipt#1",
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3001, () => {
  console.log("App is running on port 3001 ");
});
