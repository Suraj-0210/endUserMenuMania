import express from "express";
import {
  createSession,
  checkSession,
  expireSession,
} from "../controller/session.controller.js";

const router = express.Router();

router.post("/create-session", createSession);
router.post("/check-session", checkSession);
router.post("/expire-session", expireSession);

export default router;
