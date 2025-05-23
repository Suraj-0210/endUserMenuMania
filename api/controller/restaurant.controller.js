import Restaurant from "../models/restaurant.model.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating session IDs
import Session from "../models/session.model.js";
import { broadcastTableStatus } from "./session.controller.js";

export const testRestaurant = async (req, res) => {
  res.json({ Success: "Restaurant Controller working successfully" });
};

export const getRestaurant = async (req, res) => {
  const restaurantId = req.params.restaurantid;
  const tableNo = req.query.tableNo ? Number(req.query.tableNo) : null;
  console.log("Table No:", tableNo, typeof tableNo); // for debugging

  let sessionId = req.cookies.sessionId;
  console.log("Received sessionId cookie:", sessionId);

  try {
    let session;

    // ✅ STEP 1: Try finding an active session by tableNo
    if (tableNo) {
      session = await Session.findOne({
        tableNo,
        restaurantId,
        isExpired: false,
      });

      if (session) {
        console.log("Found existing session for table:", session.sessionId);
        sessionId = session.sessionId;
      }
    }

    // ✅ STEP 2: If session not found by tableNo, fallback to sessionId in cookie
    if (!session && sessionId) {
      session = await Session.findOne({
        sessionId,
        restaurantId,
        isExpired: false,
      });

      if (!session) {
        console.log("SessionId from cookie not found in DB. Creating new.");
        sessionId = null;
      } else if (tableNo !== null && session.tableNo !== tableNo) {
        console.log(
          "SessionId found but tableNo mismatch. Creating new session."
        );
        sessionId = uuidv4();
        session = new Session({ sessionId, tableNo, restaurantId });
        await session.save();
        await broadcastTableStatus(session.restaurantId);
      } else {
        console.log("Valid session from cookie:", sessionId);
      }
    }

    // ✅ STEP 3: If still no session found, create a new one
    if (!session) {
      sessionId = uuidv4();
      const newSession = new Session({ sessionId, tableNo, restaurantId });
      await newSession.save();
      await broadcastTableStatus(session.restaurantId);
      console.log("New session created:", sessionId);
    }

    // ✅ STEP 4: Fetch restaurant details
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { restaurantname, address, logo } = restaurant._doc;

    // ✅ STEP 5: Send response with session cookie
    res
      .status(200)
      .cookie("sessionId", sessionId, {
        httpOnly: false,
        sameSite: "None",
        secure: true,
        maxAge: 90 * 60 * 1000, // 1.5 hours
      })
      .json({
        restaurantname,
        address,
        logo,
        sessionId,
      });
  } catch (error) {
    console.error("Error in getRestaurant:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching restaurant details" });
  }
};

// controllers/restaurantController.js

export const getRestaurantIdByUserId = async (req, res) => {
  try {
    const userId = req.body.user_id || req.query.user_id || req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const restaurant = await Restaurant.findOne({ user_id: userId });

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant not found for this user." });
    }

    return res.status(200).json({ restaurantId: restaurant._id });
  } catch (error) {
    console.error("Error fetching restaurant ID:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
