import Menu from "../models/menu.model.js";

export const getDishes = async (req, res) => {
  console.log("get Menu called");
  const restaurantId = req.params.restaurantid;
  try {
    const menu = await Menu.find({ restaurantid: restaurantId });

    const resArr = [];

    for (let i = 0; i < menu.length; i++) {
      let { restaurantid, createdAt, updatedAt, __v, ...rest } = menu[i]._doc;
      resArr.push({ ...rest });
    }

    res.json(resArr);
  } catch (error) {}
};

export const placeOrder = async (req, res) => {
  const { dishes } = req.body; // Assuming you pass an array of dishes in the request body

  try {
    const updatedDishes = []; // Array to hold the updated dish information

    for (const item of dishes) {
      const { menuItem, quantity } = item;

      // Find the dish by its ID
      const dish = await Menu.findById(menuItem);

      if (!dish) {
        return res
          .status(404)
          .json({ message: `Dish with ID ${menuItem} not found` });
      }

      // Check if enough stock is available
      if (dish.stock < quantity) {
        return res
          .status(400)
          .json({
            message: `Not enough stock available for dish ${dish.name}`,
          });
      }

      // Update the stock by reducing the quantity ordered
      dish.stock -= quantity;

      // Save the updated dish
      await dish.save();

      // Push updated dish information to the array
      updatedDishes.push({ id: dish._id, name: dish.name, quantity });
    }

    res
      .status(200)
      .json({ message: "Order placed successfully", updatedDishes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while placing the order" });
  }
};

export const test = async (req, res) => {
  res.json({ Message: "Api is working" });
};
