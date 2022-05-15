import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import * as _ from "lodash";
import {
  PatientVisits,
  PatientVisitsWrapper
} from "../models/patientvisits.model";
import { PatientVisitsService } from "../service/patientvisits.service";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();
router.get("/entity", async (req, res, next) => {
  try {
    var result: ActionRes<PatientVisits> = new ActionRes<PatientVisits>();
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/getPatientAndVisit/:_patient_identifier",
  async (req, res, next) => {
    try {
      var result: ActionRes<Array<PatientVisits>> = new ActionRes<
        Array<PatientVisits>
      >();
      var _patient_identifier = _.get(req, "params._patient_identifier", "");
      var service: PatientVisitsService = new PatientVisitsService();
      result.item = await service.getPatientAndVisit(_patient_identifier);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  "/getPatientAndVisitForOrderCode/:order_code",
  async (req, res, next) => {
    try {
      var result: ActionRes<Array<PatientVisitsWrapper>> = new ActionRes<
        Array<PatientVisitsWrapper>
      >();
      var _order_code = _.get(req, "params.order_code", "");
      var service: PatientVisitsService = new PatientVisitsService();
      result.item = await service.getPatientAndVisitForOrderCode(_order_code);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/getAssociatedOrdersForDevices/:device_id",
  async (req, res, next) => {
    try {
      var result: ActionRes<Array<PatientVisitsWrapper>> = new ActionRes<
        Array<PatientVisitsWrapper>
      >();
      var device_id = _.get(req, "params.device_id", 0);
      var service: PatientVisitsService = new PatientVisitsService();
      result.item = await service.getAssociatedOrdersForDevice(device_id);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
// router.use(checkToken);

router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<PatientVisits>> = new ActionRes<
      Array<PatientVisits>
    >();
    var service: PatientVisitsService = new PatientVisitsService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientVisits> = new ActionRes<PatientVisits>();
    var service: PatientVisitsService = new PatientVisitsService();
    result.item = await service.insert(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/update",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientVisits> = new ActionRes<PatientVisits>();
    var service: PatientVisitsService = new PatientVisitsService();
    result.item = await service.update(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/delete",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientVisits> = new ActionRes<PatientVisits>();
    var service: PatientVisitsService = new PatientVisitsService();
    result.item = await service.delete(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/GetPatientsAndLatestVisit/:patient_visit_id",checkToken,
  async (req, res, next) => {
    try {
      var _service: PatientVisitsService = new PatientVisitsService();
      var patient_visit_id = parseInt(
        _.get(req, "params.patient_visit_id", "0")
      );
      var result: ActionRes<Array<PatientVisits>> = new ActionRes<
        Array<PatientVisits>
      >();
      result.item = await _service.getPatientsAndLatestVisit(patient_visit_id);

      next(result);
    } catch (error) {
      next(error);
    }
  }
);
export { router as PatientVisitsController };
