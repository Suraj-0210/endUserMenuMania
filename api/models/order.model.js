import mongoose from "mongoose";
import Menu from "./menu.model.js";

const orderSchema = new mongoose.Schema({
  dishes: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  tableNo: { type: Number, required: true },
  sessionId: { type: String, required: true },
  paymentId: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "In Progress", "Completed"],
    default: "Pending",
  },
  message: {
    type: String,
    default: "",
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
});

// ❌ Removed TTL index
// ✅ Add a regular index if needed for querying (optional)
orderSchema.index({ expiresAt: 1 });

orderSchema.pre("save", async function (next) {
  const dishPromises = this.dishes.map(async (dish) => {
    const menuItem = await Menu.findById(dish.menuItem);
    if (!menuItem) {
      throw new Error(`Menu item with id ${dish.menuItem} does not exist`);
    }
    return dish;
  });

  try {
    await Promise.all(dishPromises);
    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
