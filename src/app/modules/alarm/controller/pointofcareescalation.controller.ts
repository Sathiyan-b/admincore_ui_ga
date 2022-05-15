import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { PointofCareEscalation, PointofCareEscalationWrapper } from "../models/pointofcareescalation.model";
import { PointofCareEscalationService } from "../service/pointofcareescalation.service";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareEscalation> = new ActionRes<PointofCareEscalation>({
            item: new PointofCareEscalation(),
          });
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<PointofCareEscalation>> = new ActionRes<
      Array<PointofCareEscalation>
    >();
    var service: PointofCareEscalationService = new PointofCareEscalationService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareEscalation> = new ActionRes<PointofCareEscalation>();
          var service: PointofCareEscalationService = new PointofCareEscalationService();
          result.item = await service.insert(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/update",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareEscalation> = new ActionRes<PointofCareEscalation>();
          var service: PointofCareEscalationService = new PointofCareEscalationService();
          result.item = await service.update(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/delete",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareEscalation> = new ActionRes<PointofCareEscalation>();
          var service: PointofCareEscalationService = new PointofCareEscalationService();
          result.item = await service.delete(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
      export { router as PointofCareEscalationController}
