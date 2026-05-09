import { Router, type IRouter } from "express";
import chatRouter from "./chat";
import contentRouter from "./content";
import businessRouter from "./business";
import businessStreamRouter from "./businessStream";
import websiteGeneratorRouter from "./websiteGenerator";
import chatbotBuilderRouter from "./chatbotBuilder";
import playgroundRouter from "./playground";

const router: IRouter = Router();

router.use(chatRouter);
router.use(contentRouter);
router.use(businessRouter);
router.use(businessStreamRouter);
router.use(websiteGeneratorRouter);
router.use(chatbotBuilderRouter);
router.use(playgroundRouter);

export default router;
