import express from "express";
import { getDishes, test, placeOrder } from "../controller/dish.controller.js";

const router = express.Router();

router.get("/dish/test", test);

// Route to fetch all dishes for a restaurant
router.get("/:restaurantid", getDishes);

// Route to place an order and reduce stock
router.post("/order", placeOrder);

export default router;
