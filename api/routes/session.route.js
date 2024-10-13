import express from "express";
import {
  createSession,
  checkSession,
} from "../controller/session.controller.js";

const router = express.Router();

router.post("/create-session", createSession);
router.post("/check-session", checkSession);

export default router;
