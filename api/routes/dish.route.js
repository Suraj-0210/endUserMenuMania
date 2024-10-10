import express from "express";
import { getDishes, test } from "../controller/dish.controller.js";

const router = express.Router();

router.get("/dish/test", test);

router.get("/dish/:restaurantid", getDishes);

export default router;
