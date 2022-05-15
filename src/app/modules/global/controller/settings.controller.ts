import express from "express";
import { ActionRes } from "../models/actionres.model";
import { Settings } from "../models/settings.model";
import { SettingsService } from "../service/settings.service";
const router = express.Router();
router.get("/entity", async (req, res, next) => {
	try {
		var result: ActionRes<Settings> = new ActionRes<Settings>({
			item: new Settings({}),
		});
		next(result);
	} catch (error) {
		next(error);
	}
});
router.post("/get", async (req, res, next) => {
	try {
		var settings_service = new SettingsService();
		var settings = settings_service.get();
		var result: ActionRes<Settings> = new ActionRes<Settings>({
			item: settings
		});
		next(result);
	} catch (error) {
		next(error);
	}
});

export { router as SettingsController };
