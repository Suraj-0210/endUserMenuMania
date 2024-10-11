import express from "express";
import {
  getRestaurant,
  testRestaurant,
} from "../controller/restaurant.controller.js";

const router = express.Router();

router.get("/test", testRestaurant);

router.get("/:restaurantid", getRestaurant);

export default router;
