import express from "express";
import {
  getRestaurant,
  getRestaurantIdByUserId,
  testRestaurant,
} from "../controller/restaurant.controller.js";

const router = express.Router();

router.get("/test", testRestaurant);

router.get("/:restaurantid", getRestaurant);

router.get("/get-restaurant-id", getRestaurantIdByUserId);

export default router;
