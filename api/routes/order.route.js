import express from "express";
import Order from "../models/order.model.js";

const router = express.Router();

// Place an Order
router.post("/orders", async (req, res) => {
  try {
    const { dishes, tableNo, restaurantId, sessionId, paymentId, status } =
      req.body;

    // Create a new order
    const newOrder = new Order({
      dishes: dishes.map((dish) => ({
        menuItem: dish.menuItem, // This should be the ObjectId of the Menu item
        quantity: dish.quantity,
      })),
      restaurantId,
      tableNo,
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

/// Get All Orders for Admin
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

// Get All Orders for Restaurant Owners
router.get("/orders/restaurant/:restaurantId", async (req, res) => {
  const restaurantId = req.params.restaurantId;
  try {
    const orders = await Order.find({
      restaurantId: restaurantId,
    }).populate("dishes.menuItem"); // Populate menu item details

    if (!orders.length) {
      return res.status(200).json({ message: "No orders found." });
    }

    const formattedOrders = orders.map((order) => ({
      OrderId: order._id,
      Items: order.dishes.map((dish) => ({
        Name: dish.menuItem.name,
        Quantity: dish.quantity,
      })),
      TableNo: order.tableNo,
      SessionId: order.sessionId,
      PaymentId: order.paymentId,
      Status: order.status,
    }));

    res.status(200).json(formattedOrders);
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

// Update Order Status by Owners
router.put("/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // New status should be sent in the request body

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({
      message: "Order status updated successfully.",
      updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status." });
  }
});

// Delete Orders by Menu Item ID
router.delete("/orders/menu/:menuId", async (req, res) => {
  const { menuId } = req.params;

  try {
    // Find and delete orders that contain the specified menu item
    const result = await Order.deleteMany({
      "dishes.menuItem": menuId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No orders found with this menu item." });
    }

    res.status(200).json({
      message: "Orders with the specified menu item deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete orders." });
  }
});

export default router;
