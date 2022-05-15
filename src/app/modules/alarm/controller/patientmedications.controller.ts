import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import * as _ from "lodash";
import {
  PatientMedications,
  PatientMedicationsWrapper
} from "../models/patientmedications.model";
import { PatientMedicationsService } from "../service/patientmedications.service";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();
router.get("/entity", async (req, res, next) => {
  try {
    var result: ActionRes<PatientMedications> = new ActionRes<
      PatientMedications
    >();
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getMedicationByOrderCode/:order_code", async (req, res, next) => {
  try {
    var _service: PatientMedicationsService = new PatientMedicationsService();
    var order_code = _.get(req, "params.order_code", "0");
    var result: ActionRes<Array<PatientMedications>> = new ActionRes<
      Array<PatientMedications>
    >();
    result.item = await _service.getMedicationByOrderCode(order_code);

    next(result);
  } catch (error) {
    next(error);
  }
});

// router.use(checkToken);

router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<PatientMedications>> = new ActionRes<
      Array<PatientMedications>
    >();
    var service: PatientMedicationsService = new PatientMedicationsService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientMedications> = new ActionRes<
      PatientMedications
    >();
    var service: PatientMedicationsService = new PatientMedicationsService();
    result.item = await service.insert(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/update",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientMedications> = new ActionRes<
      PatientMedications
    >();
    var service: PatientMedicationsService = new PatientMedicationsService();
    result.item = await service.update(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/delete",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PatientMedications> = new ActionRes<
      PatientMedications
    >();
    var service: PatientMedicationsService = new PatientMedicationsService();
    result.item = await service.delete(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/getmedicationsforPatient",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<PatientMedicationsWrapper>> = new ActionRes<
      Array<PatientMedicationsWrapper>
    >();
    var service: PatientMedicationsService = new PatientMedicationsService();
    result.item = await service.getMedicationsForPatient(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/GetLatestMedicationDeviceWise/:device_id/:patient_id?/:patient_order_id?",checkToken,
  async (req, res, next) => {
    try {
      var _service: PatientMedicationsService = new PatientMedicationsService();
      var result: ActionRes<Array<PatientMedications>> = new ActionRes<
        Array<PatientMedications>
      >();
      var _device_id = parseInt(_.get(req, "params.device_id", 0));
      var _patient_id = parseInt(_.get(req, "params.patient_id", 0));
      var _patient_order_id = parseInt(
        _.get(req, "params.patient_order_id", 0)
      );
      result.item = await _service.getLatestMedicationDeviceWise(
        _device_id,
        _patient_id,
        _patient_order_id
      );

      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/GetMedicationsPatientWise/:patient_visit_id",checkToken,
  async (req, res, next) => {
    try {
      var _service: PatientMedicationsService = new PatientMedicationsService();
      var patient_visit_id = parseInt(
        _.get(req, "params.patient_visit_id", "0")
      );
      var result: ActionRes<Array<PatientMedications>> = new ActionRes<
        Array<PatientMedications>
      >();
      result.item = await _service.getMedicationsPatientWise(patient_visit_id);

      next(result);
    } catch (error) {
      next(error);
    }
  }
);

export { router as PatientMedicationsController };
