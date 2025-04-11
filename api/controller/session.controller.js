import Restaurant from "../models/restaurant.model.js";
import Session from "../models/session.model.js";
import { v4 as uuidv4 } from "uuid"; // For generating session IDs

export const createSession = async (req, res) => {
  try {
    // Generate a new session ID
    const sessionId = uuidv4();

    // Create a new session document
    const newSession = new Session({ sessionId });
    await newSession.save();

    // Send the session ID back to the client
    res.status(201).json({ sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Failed to create session" });
  }
};

export const checkSession = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Check if the session ID exists in the database
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ message: "Session not found or expired" });
    }

    // If found, return the valid session information
    res.status(200).json({ message: "Session is valid", sessionId });
  } catch (error) {
    console.error("Error checking session:", error);
    res.status(500).json({ message: "Failed to check session" });
  }
};

export const expireSession = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required" });
  }

  try {
    const result = await Session.deleteOne({ sessionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.clearCookie("sessionId"); // Optional: clear the session cookie
    res.status(200).json({ message: "Session expired successfully" });
  } catch (error) {
    console.error("Error expiring session:", error);
    res.status(500).json({ message: "Failed to expire session" });
  }
};

export const getTableStatus = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const totalTables = restaurant.tables;

    // Get all active sessions for this restaurant
    const activeSessions = await Session.find({ restaurantId });

    const bookedTables = activeSessions.map((s) => s.tableNo);
    const allTables = Array.from({ length: totalTables }, (_, i) => i + 1);
    const availableTables = allTables.filter((t) => !bookedTables.includes(t));

    res.status(200).json({
      totalTables,
      bookedTables,
      availableTables,
    });
  } catch (error) {
    console.error("Error fetching table status:", error);
    res.status(500).json({ message: "Failed to fetch table status" });
  }
};
