import Menu from "../models/menu.model.js";

export const getDishes = async (req, res) => {
  console.log("get Menu called");
  const restaurantId = req.params.restaurantid;
  try {
    const menu = await Menu.find({ restaurantid: restaurantId });

    const resArr = [];

    for (let i = 0; i < menu.length; i++) {
      let {
        _id,
        restaurantid,
        createdAt,
        updatedAt,
        __v,
        description,
        ...rest
      } = menu[i]._doc;
      resArr.push({ ...rest, text: description });
    }

    res.json(resArr);
  } catch (error) {}
};

export const test = async (req, res) => {
  res.json({ Message: "Api is working" });
};
