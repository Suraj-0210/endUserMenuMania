import mongoose from "mongoose";

// Import the Menu model
import Menu from "./menu.model.js";

const orderSchema = new mongoose.Schema({
  dishes: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      }, // Reference to Menu model
      quantity: { type: Number, required: true },
    },
  ],
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  tableNo: { type: Number, required: true },
  sessionId: { type: String, required: true }, // For tracking customer sessions
  paymentId: { type: String, required: true }, // Payment ID
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "In Progress", "Completed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from creation
  },
});

// Set TTL index on expiresAt field
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create a pre-save hook to validate menu items
orderSchema.pre("save", async function (next) {
  const dishPromises = this.dishes.map(async (dish) => {
    const menuItem = await Menu.findById(dish.menuItem);
    if (!menuItem) {
      throw new Error(`Menu item with id ${dish.menuItem} does not exist`);
    }
    return dish; // Return the dish if valid
  });

  try {
    await Promise.all(dishPromises);
    next(); // Proceed if all menu items are valid
  } catch (error) {
    next(error); // Pass error to next middleware
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
