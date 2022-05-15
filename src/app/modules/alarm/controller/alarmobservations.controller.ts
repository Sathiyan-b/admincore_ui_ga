import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import {
  AlarmObservations,
  AlarmObservationsWrapper
} from "../models/alarmobservations.model";
import { AlarmObservationsService } from "../service/alarmobservations.service";
import * as _ from "lodash";
import { Devices } from "../models/devices.model";
import { AlarmService } from "../service/alarm.service";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<AlarmObservations> = new ActionRes<
      AlarmObservations
    >();
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<AlarmObservations>> = new ActionRes<
      Array<AlarmObservations>
    >();
    var service: AlarmObservationsService = new AlarmObservationsService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<AlarmObservations> = new ActionRes<
      AlarmObservations
    >();
    var service: AlarmObservationsService = new AlarmObservationsService();
    result.item = await service.insert(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/update",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<AlarmObservations> = new ActionRes<
      AlarmObservations
    >();
    var service: AlarmObservationsService = new AlarmObservationsService();
    result.item = await service.update(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/delete",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<AlarmObservations> = new ActionRes<
      AlarmObservations
    >();
    var service: AlarmObservationsService = new AlarmObservationsService();
    result.item = await service.delete(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get("/GetDevicesAndAlarms",checkToken, async (req, res, next) => {
  try {
    var _service: AlarmObservationsService = new AlarmObservationsService();
    // var id = _.get(req, "params.id", 0);
    var result: ActionRes<Array<Devices>> = new ActionRes<Array<Devices>>();
    result.item = await _service.getDevicesAndAlarms();

    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/createOrder",checkToken, async (req, res, next) => {
  try {
    var alarm_service: AlarmService = new AlarmService();
    await alarm_service.processMessages(req.body.item);
    var result: ActionRes<boolean> = new ActionRes<boolean>();
    // result.item = resp;
    result.item = true;
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/createAlarm",checkToken, async (req, res, next) => {
  try {
    var alarm_service: AlarmObservationsService = new AlarmObservationsService();
    await alarm_service.createAlarm(req.body.item);
    // var _req = new AlarmObservations();
    // _req.id = _.get(req.body, "item.id", 0);
    // var resp = await alarm_service.sendNotification(_req, 0);
    var result: ActionRes<boolean> = new ActionRes<boolean>();
    // result.item = resp;
    result.item = true;
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});
export { router as AlarmObservationsController };
