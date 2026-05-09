import { Router, type IRouter } from "express";
import chatRouter from "./chat";
import contentRouter from "./content";
import businessRouter from "./business";
import businessStreamRouter from "./businessStream";
import websiteGeneratorRouter from "./websiteGenerator";
import chatbotBuilderRouter from "./chatbotBuilder";
import playgroundRouter from "./playground";
import generateRouter from "./generate";
import interpretRouter from "./interpret";
import generateImageRouter from "./generateImage";
import generateCodeRouter from "./generateCode";

const router: IRouter = Router();

router.use(chatRouter);
router.use(contentRouter);
router.use(businessRouter);
router.use(businessStreamRouter);
router.use(websiteGeneratorRouter);
router.use(chatbotBuilderRouter);
router.use(playgroundRouter);
router.use(generateRouter);
router.use(interpretRouter);
router.use(generateImageRouter);
router.use(generateCodeRouter);

export default router;
