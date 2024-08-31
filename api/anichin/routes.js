import { Router } from "express";
import {
  getDetailEpisode,
  getDetailMovie,
  getSearch,
  index,
} from "./controller.js";

const router = Router();

router.get("/", index);
router.get("/search", getSearch);
router.get("/:slug", getDetailMovie);
router.get("/:slug/episode/:episode", getDetailEpisode);

export default router;
