import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "45m", // Automatically remove the document after 45 minutes
  },
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
