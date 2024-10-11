import express from "express";
import Order from "../models/order.model.js";

const router = express.Router();

// Place an Order
router.post("/orders", async (req, res) => {
  try {
    const { dishes, sessionId, paymentId, status } = req.body;

    // Create a new order
    const newOrder = new Order({
      dishes: dishes.map((dish) => ({
        menuItem: dish.menuItem, // This should be the ObjectId of the Menu item
        quantity: dish.quantity,
      })),
      sessionId,
      paymentId,
      status,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// orderRoutes.js

/// Get All Orders for Restaurant Owner
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("dishes.menuItem"); // Populate menu item details

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve orders" });
  }
});

/// Get All Orders for Customer with Session ID
router.get("/orders/:sessionid", async (req, res) => {
  const sessionId = req.params.sessionid;
  try {
    const orders = await Order.find({ sessionId: sessionId }).populate(
      "dishes.menuItem"
    ); // Populate menu item details

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve orders" });
  }
});

export default router;
