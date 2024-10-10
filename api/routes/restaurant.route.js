import express from "express";
import {
  getRestaurant,
  testRestaurant,
} from "../controller/restaurant.controller.js";

const router = express.Router();

router.get("/restaurant/test", testRestaurant);

router.get("/restaurant/:restaurantid", getRestaurant);

export default router;
