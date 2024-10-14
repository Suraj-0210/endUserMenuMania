import Restaurant from "../models/restaurant.model.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating session IDs
import Session from "../models/session.model.js";

export const testRestaurant = async (req, res) => {
  res.json({ Success: "Restaurant Controller working successfully" });
};

export const getRestaurant = async (req, res) => {
  const restaurantId = req.params.restaurantid;
  console.log("Received cookies:", req.cookies);

  try {
    // Check for existing sessionId in cookies
    let sessionId = req.cookies.sessionId;
    console.log("The user SessionID: " + sessionId);

    if (sessionId === undefined || sessionId === null || sessionId === "") {
      console.log("User hasn't sessionId");
      try {
        // Generate a new session ID
        const newsessionId = uuidv4();
        console.log("New SessionId Generated:");

        // Create a new session document
        const newSession = new Session({ sessionId: newsessionId });
        const newsessionObj = await newSession.save();

        sessionId = newsessionObj.sessionId;
      } catch (error) {
        console.error("Error creating session:", error);
      }
    } else {
      console.log("User has SessionId ");
      try {
        // Check if the session ID exists in the database
        const session = await Session.findOne({ sessionId });

        if (session === undefined || session === null || session === "") {
          console.log("User's SessionId is not valid");
          try {
            // Generate a new session ID
            sessionId = uuidv4();

            // Create a new session document
            const newSession = new Session({ sessionId });
            const newsessionObj = await newSession.save();
            sessionId = newsessionObj.sessionId;
          } catch (error) {
            console.error("Error creating session:", error);
          }
        }

        // If found, return the valid session information
      } catch (error) {
        console.error("Error checking session:", error);
      }
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { restaurantname, address, logo } = restaurant._doc;

    // Send response with restaurant details and sessionId
    res
      .status(200)
      .cookie("sessionId", sessionId, {
        httpOnly: false,
        sameSite: "None",
        secure: true,
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
