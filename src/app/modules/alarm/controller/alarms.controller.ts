import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { AlarmsModel } from "../models/alarms.model";
import { AlarmService } from "../service/alarm.service";
const router = express.Router();

router.get("/",checkToken, async (req, res, next) => {
    try {
      var result: ActionRes<Array<AlarmsModel>> = new ActionRes<
        Array<AlarmsModel>
      >();
      var service: AlarmService = new AlarmService();
      result.item = await service.select();
      next(result);
    } catch (error) {
      next(error);
    }
  });

export { router as alarmsController };