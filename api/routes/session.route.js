import express from "express";
import {
  createSession,
  checkSession,
  expireSession,
  getTableStatus,
  streamTableStatus,
} from "../controller/session.controller.js";

const router = express.Router();

router.post("/create-session", createSession);
router.post("/check-session", checkSession);
router.post("/expire-session", expireSession);
// router.get("/table-status/:restaurantId", getTableStatus);
router.get("/stream-table-status/:restaurantId", streamTableStatus);

export default router;
