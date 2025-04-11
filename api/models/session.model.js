import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  tableNo: {
    type: Number,
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5400, // 1.5 hours = 90 minutes = 5400 seconds
  },
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
