import Restaurant from "../models/restaurant.model.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating session IDs

export const testRestaurant = async (req, res) => {
  res.json({ Success: "Restaurant Controller working successfully" });
};

export const getRestaurant = async (req, res) => {
  const restaurantId = req.params.restaurantid;

  try {
    // Check for existing sessionId in cookies
    let sessionId = req.cookies.sessionId;

    console.log("SessionId" + sessionId);

    // If no sessionId, generate a new one
    if (!sessionId) {
      sessionId = uuidv4(); // Generate a new session ID
    }

    const restaurant = await Restaurant.findById(restaurantId);

    console.log(sessionId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { restaurantname, address, logo } = restaurant._doc;

    // Send response with restaurant details and sessionId
    res
      .status(200)
      .cookie("sessionId", sessionId, {
        httpOnly: true,
      })
      .json({
        restaurantname,
        address,
        logo,
        sessionId,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching restaurant details" });
  }
};
