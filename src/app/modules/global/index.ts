import express from "express";
import { GlobalRoutes } from "./controller";
import { ErrorResponse } from "./models/errorres.model";
import { global_logger, json_custom_stringifier } from "./utils";
import log4js from "log4js";
import { ActionRes } from "./models/actionres.model";

const router = express.Router();
router.use(
	log4js.connectLogger(global_logger, {
		level: "auto",
	})
);
router.use("/", GlobalRoutes);
/* response handler */
router.use((data: any, req: any, res: any, next: any) => {
	if (data instanceof ActionRes) {
		data.message = "modified";
		res.status(200).send(data);
	} else {
		next(data);
	}
});
/* error response handler */
router.use((err: any, req: any, res: any, next: any) => {
	var error_log_data =
		req.connection.remoteAddress +
		`\t${req.method} ${req.url}` +
		(req.body ? "\t[REQUEST_BODY] " + json_custom_stringifier.stringify(req.body) : "") +
		"\t[ERROR_OBJECT] " +
		json_custom_stringifier.stringify(err);
	if (err instanceof ErrorResponse) {
		var TAG = "[HANDLED_FAILURE]\t";
		global_logger.error(TAG + error_log_data);
		res.status(400).send(err);
	} else {
		var TAG = "[UNHANDLED_FAILURE]\t";
		global_logger.error(TAG + error_log_data);
		next(err);
	}
});

export { router as GlobalModule };
