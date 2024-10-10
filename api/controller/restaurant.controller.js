import Restaurant from "../models/restaurant.model.js";

export const testRestaurant = async (req, res) => {
  res.json({ Success: "Restaurant Controller working successfully" });
};

export const getRestaurant = async (req, res) => {
  const restaurantId = req.params.restaurantid;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    const { restaurantname, address, logo, ...rest } = restaurant._doc;
    res.json({ restaurantname: restaurantname, address: address, logo: logo });
  } catch (error) {
    console.log(error);
  }
};
