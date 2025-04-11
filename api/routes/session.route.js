import express from "express";
import {
  createSession,
  checkSession,
  expireSession,
  getTableStatus,
} from "../controller/session.controller.js";

const router = express.Router();

router.post("/create-session", createSession);
router.post("/check-session", checkSession);
router.post("/expire-session", expireSession);
router.get("/table-status/:restaurantId", getTableStatus);

export default router;
