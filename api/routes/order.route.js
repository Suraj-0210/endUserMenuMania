import express from "express";
import Order from "../models/order.model.js";

const router = express.Router();

import Menu from "../models/menu.model.js"; // Make sure this import is correct

router.post("/orders", async (req, res) => {
  try {
    const {
      dishes,
      tableNo,
      restaurantId,
      sessionId,
      paymentId,
      status,
      message,
    } = req.body;

    // Step 1: Validate stock
    for (let dish of dishes) {
      const menuItem = await Menu.findById(dish.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found.` });
      }
      if (menuItem.stock < dish.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${menuItem.name}". Available: ${menuItem.stock}, Requested: ${dish.quantity}`,
        });
      }
    }

    // Step 2: Create the order
    const newOrder = new Order({
      dishes: dishes.map((dish) => ({
        menuItem: dish.menuItem,
        quantity: dish.quantity,
      })),
      restaurantId,
      tableNo,
      sessionId,
      paymentId,
      status,
      message,
    });

    await newOrder.save();

    // Step 3: Decrease stock
    for (let dish of dishes) {
      await Menu.findByIdAndUpdate(
        dish.menuItem,
        { $inc: { stock: -dish.quantity } },
        { new: true }
      );
    }

    res
      .status(201)
      .json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// orderRoutes.js

// Get All Orders for Admin
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

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const sendUpdate = async () => {
      const orders = await Order.find({
        restaurantId,
        isExpired: false,
      }).populate("dishes.menuItem");

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
        Message: order.message,
      }));

      res.write(`data: ${JSON.stringify(formattedOrders)}\n\n`);
    };

    // Send initial data
    await sendUpdate();

    // Start Change Stream
    const changeStream = Order.watch();

    console.log("Change Stream for restaurant orders initialized...");

    changeStream.on("change", async (change) => {
      // console.log("Change detected:", change);

      const affectedDocId = change.documentKey?._id;

      // Check if the change affects the orders for this restaurant
      if (affectedDocId) {
        const updatedOrder = await Order.findById(affectedDocId);

        if (
          updatedOrder &&
          updatedOrder.restaurantId.toString() === restaurantId
        ) {
          await sendUpdate();
        }
      }
    });

    changeStream.on("error", (err) => {
      console.error("Change Stream error:", err);
    });

    req.on("close", () => {
      console.log("Client closed connection, cleaning up...");
      changeStream.close();
      res.end();
    });
  } catch (error) {
    console.error("Error in SSE route:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Get All Orders for a Restaurant (No SSE)
router.get("/orders/restaurant/metrices/:restaurantId", async (req, res) => {
  const restaurantId = req.params.restaurantId;

  try {
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
      Message: order.message,
      OrderDate: order.createdAt.toISOString().split("T")[0],
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get All Orders for Customer with Session ID
router.get("/orders/:sessionid", async (req, res) => {
  const sessionId = req.params.sessionid;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Function to send updated orders
    const sendUpdate = async () => {
      const orders = await Order.find({ sessionId, isExpired: false }).populate(
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
      // console.log("Received change event:", JSON.stringify(change, null, 2));

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

// Checkout Route - returns a checkout success message and session QR code
router.get("/checkout/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const orders = await Order.find({ sessionId }).populate("dishes.menuItem");

    if (!orders.length) {
      return res.status(404).json({ message: "User hasn't Ordered anything." });
    }

    const tableNo = orders[0].tableNo;

    let totalAmount = 0;
    let paidOnline = 0;

    const formattedOrders = orders.map((order) => {
      let orderAmount = 0;

      const items = order.dishes.map((dish) => {
        const price = dish.menuItem.price;
        const quantity = dish.quantity;
        orderAmount += price * quantity;

        return {
          Name: dish.menuItem.name,
          Quantity: quantity,
          Price: price,
          Total: price * quantity,
        };
      });

      totalAmount += orderAmount;

      if (order.paymentId !== "Pay_After_Service") {
        paidOnline += orderAmount;
      }

      return {
        OrderId: order._id,
        Items: items,
        PaymentId: order.paymentId,
        Status: order.status,
        orderDateTime: order.createdAt, // 👈 Added this line
      };
    });

    res.status(200).json({
      message:
        "Please scan the qr code and only collect the amount that in cash.",
      sessionId,
      tableNo,
      totalAmount,
      paidOnline,
      remainingAmount: totalAmount - paidOnline,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Checkout failed." });
  }
});

// Expire the orders every two Hours
router.get("/cron/mark-expired-orders", async (req, res) => {
  try {
    const result = await Order.updateMany(
      { isExpired: false, expiresAt: { $lt: new Date() } },
      { $set: { isExpired: true } }
    );
    res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
