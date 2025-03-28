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

// Get All Orders for Restaurant Owners with SSE
router.get("/orders/restaurant/:restaurantId", async (req, res) => {
  const restaurantId = req.params.restaurantId;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Function to send updates to the client
    const sendUpdate = async () => {
      const orders = await Order.find({ restaurantId }).populate(
        "dishes.menuItem"
      );

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

      // Stream the data in SSE format
      res.write(`data: ${JSON.stringify(formattedOrders)}\n\n`);
    };

    // Send the initial order data
    await sendUpdate();

    // Poll for updates at intervals (e.g., every 5 seconds)
    const interval = setInterval(async () => {
      await sendUpdate();
    }, 5000);

    // Cleanup when the client closes the connection
    req.on("close", () => {
      clearInterval(interval); // Stop the interval
      res.end(); // End the SSE response
    });
  } catch (error) {
    console.error("Error in SSE route:", error);

    // Send the error in SSE format
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end(); // Close the connection
  }
});

/// Get All Orders for Customer with Session ID
router.get("/orders/:sessionid", async (req, res) => {
  const sessionId = req.params.sessionid;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Function to send updated orders
    const sendUpdate = async () => {
      const orders = await Order.find({ sessionId }).populate(
        "dishes.menuItem"
      );
      res.write(`data: ${JSON.stringify(orders)}\n\n`);
    };

    // Send initial data
    await sendUpdate();

    const changeStream = Order.watch();

    // Debug: Log when Change Stream is ready
    console.log("Change Stream initialized...");

    // Listen for all changes
    changeStream.on("change", (change) => {
      console.log("Received change event:", JSON.stringify(change, null, 2));

      if (
        change.operationType === "update" &&
        change.updateDescription.updatedFields.status
      ) {
        console.log(
          `Order ${change.documentKey._id} status updated to:`,
          change.updateDescription.updatedFields.status
        );
        sendUpdate();
      }
    });

    // Error handling
    changeStream.on("error", (err) => {
      console.error("Change Stream Error:", err);
    });
    // Cleanup when client disconnects
    req.on("close", () => {
      changeStream.close(); // Close MongoDB Change Stream
      res.end(); // End the response
    });
  } catch (error) {
    console.error("Error in SSE route:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
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
