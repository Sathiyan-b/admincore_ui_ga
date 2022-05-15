import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import {
  EntHierarchyModel,
  EntHierarchyCriteria,
} from "../models/enthierarchy.model";
import { EntHierarchyService } from "../service/enthierarchy.service";
import * as _ from "lodash";
const router = express.Router();

router.get("/entity", async (req, res, next) => {
  try {
    var result: ActionRes<EntHierarchyModel> = new ActionRes<EntHierarchyModel>(
      {
        item: new EntHierarchyModel(),
      }
    );
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get("/getPointOfCare", async (req, res, next) => {
  try {
    var result: ActionRes<Array<EntHierarchyCriteria>> = new ActionRes<
      Array<EntHierarchyCriteria>
    >();
    var service: EntHierarchyService = new EntHierarchyService();
    result.item = await service.getPointOfCare();
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get("/getEnterprise", async (req, res, next) => {
  try {
    var result: ActionRes<Array<EntHierarchyCriteria>> = new ActionRes<
      Array<EntHierarchyCriteria>
    >();
    var service: EntHierarchyService = new EntHierarchyService();
    result.item = await service.getEnterprise();
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/getChildren", async (req, res, next) => {
  try {
    var result: ActionRes<Array<EntHierarchyCriteria>> = new ActionRes<
      Array<EntHierarchyCriteria>
    >();
    var _req: EntHierarchyCriteria = req.body.item;
    var service: EntHierarchyService = new EntHierarchyService();
    if (_req.multilevel) {
      result.item = await service.getChildrenHierarchy(req.body.item);
    } else {
      result.item = await service.getChildren(req.body.item);
    }
    next(result);
  } catch (error) {
    next(error);
  }
});

export { router as EntHierarchyController };
