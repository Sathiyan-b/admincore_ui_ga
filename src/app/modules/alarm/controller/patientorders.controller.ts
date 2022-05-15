import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import * as _ from "lodash";
import {
  PatientOrders,
  PatientOrdersWrapper,
} from "../models/patientorders.model";
import { PatientOrdersService } from "../service/patientorders.service";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientOrders> = new ActionRes<PatientOrders>();
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<PatientOrders>> = new ActionRes<
      Array<PatientOrders>
    >();
    var service: PatientOrdersService = new PatientOrdersService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientOrders> = new ActionRes<PatientOrders>();
    var service: PatientOrdersService = new PatientOrdersService();
    result.item = await service.insert(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/update",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientOrders> = new ActionRes<PatientOrders>();
    var service: PatientOrdersService = new PatientOrdersService();
    result.item = await service.update(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/delete",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientOrders> = new ActionRes<PatientOrders>();
    var service: PatientOrdersService = new PatientOrdersService();
    result.item = await service.delete(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/startorder",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientOrders> = new ActionRes<PatientOrders>();
    var service: PatientOrdersService = new PatientOrdersService();
    result.item = await service.changeOrderStatus(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
export { router as PatientOrdersController };
