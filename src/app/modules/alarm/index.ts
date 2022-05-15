import express from "express";
import { AlarmRoutes } from "./controller";
import { ErrorResponse } from "../global/models/errorres.model";
import { logger } from "./utils";
import log4js from "log4js";
import { ActionRes } from "../global/models/actionres.model";
import * as _ from "lodash";
import { json_custom_stringifier } from "../global/utils";
const router = express.Router();
router.use(
  log4js.connectLogger(logger, {
    level: "auto",
  })
);
router.use("/v1/", AlarmRoutes);
/* response handler */
router.use((data: any, req: any, res: any, next: any) => {
  if (data instanceof ActionRes) {
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
    (req.body
      ? "\t[REQUEST_BODY] " + json_custom_stringifier.stringify(req.body)
      : "") +
    "\t[ERROR_OBJECT] " +
    json_custom_stringifier.stringify(err);
  if (err instanceof ErrorResponse) {
    var TAG = "[HANDLED_FAILURE]\t";
    logger.error(TAG + error_log_data);
    delete err.item;
    switch (err.code) {
      case ErrorResponse.ErrorCodes.UNAUTHORIZED:
        res.status(401).send(err);
        break;
      case ErrorResponse.ErrorCodes.FORBIDDEN:
        res.status(403).send(err);
        break;
      default:
        res.status(400).send(err);
        break;
    }
  } else {
    var TAG = "[UNHANDLED_FAILURE]\t";
    logger.error(TAG + error_log_data);
    next(err);
  }
});

export { router as ALARMModule };
