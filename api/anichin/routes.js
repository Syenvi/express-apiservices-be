import { Router } from "express";
import { getDetailMovie, index } from "./controller.js";

const router = Router();

router.get("/anichin", index);
router.get("/anichin/:link", getDetailMovie);

export default router;
