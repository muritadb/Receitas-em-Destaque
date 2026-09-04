import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recipesRouter from "./recipes";
import communityRouter from "./community";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recipesRouter);
router.use(communityRouter);

export default router;
