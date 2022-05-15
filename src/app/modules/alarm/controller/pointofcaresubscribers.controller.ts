import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { PointofCareSubscribers, PointofCareSubscribersWrapper } from "../models/pointofcaresubscribers.model";
import { PointofCareSubscribersService } from "../service/pointofcaresubscribers.service";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareSubscribers> = new ActionRes<PointofCareSubscribers>({
            item: new PointofCareSubscribers(),
          });
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<PointofCareSubscribers>> = new ActionRes<
      Array<PointofCareSubscribers>
    >();
    var service: PointofCareSubscribersService = new PointofCareSubscribersService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareSubscribers> = new ActionRes<PointofCareSubscribers>();
          var service: PointofCareSubscribersService = new PointofCareSubscribersService();
          result.item = await service.insert(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/update",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareSubscribers> = new ActionRes<PointofCareSubscribers>();
          var service: PointofCareSubscribersService = new PointofCareSubscribersService();
          result.item = await service.update(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/delete",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<PointofCareSubscribers> = new ActionRes<PointofCareSubscribers>();
          var service: PointofCareSubscribersService = new PointofCareSubscribersService();
          result.item = await service.delete(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
      export { router as PointofCareSubscribersController}
