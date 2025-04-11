import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  tableNo: {
    type: Number, // or String if table numbers are alphanumeric like "A5"
    required: true, // optional initially
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5400, // 1.5 hours = 90 minutes = 5400 seconds
  },
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
