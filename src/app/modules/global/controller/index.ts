import express from "express";
import { Environment } from "../utils";
import { CustomImageUploader } from "../utils/customimageuploader";
// import { ReferenceListController } from "./referencelist.controller";
import { SettingsController } from "./settings.controller";
import { UploadController } from "./upload.controller";
const router = express.Router();
router.use("/settings", SettingsController);
// router.use("/referencelist", ReferenceListController);
router.use("/upload", UploadController);

export { router as GlobalRoutes };
