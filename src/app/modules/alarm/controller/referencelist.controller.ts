import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { ReferenceListService } from "../service/referencelist.service";
import { ReferenceListModel } from "../models/referencelist.model";
import * as _ from "lodash";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<ReferenceListModel> = new ActionRes<ReferenceListModel>(
      {
        item: new ReferenceListModel(),
      }
    );
    next (result)
  } catch (error) {
    next(error);
  }
});

router.get("/localities",checkToken, async (req, res, next) => {
  try {
    var reference_list_service: ReferenceListService = new ReferenceListService();
    // var id = _.get(req, "params.id", 0);
    var locality_list = await reference_list_service.getLocalities();
    var result: ActionRes<Array<string>> = new ActionRes<Array<string>>({
      item: locality_list,
    });
    next (result)
  } catch (error) {
    next(error);
  }
});
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var referencelist_service: ReferenceListService = new ReferenceListService();
    var referencelist = await referencelist_service.getReferenceList(
    req.body.item
    );
    var result: ActionRes<Array<ReferenceListModel>> = new ActionRes<
      Array<ReferenceListModel>
    >({
      item: referencelist,
    });
    next (result)
  } catch (error) {
    next(error);
  }
});
router.get("/:reftypecode",checkToken, async (req, res, next) => {
  try {
    var referencelist_service: ReferenceListService = new ReferenceListService();
    var reftypecode = _.get(req, "params.reftypecode", "");
   var _req = new ReferenceListModel();
   _req.identifier = reftypecode;
    var referencelist = await referencelist_service.getReferenceList(_req);
    var result: ActionRes<Array<ReferenceListModel>> = new ActionRes<
      Array<ReferenceListModel>
    >({
      item: referencelist,
    });
    next (result)
  } catch (error) {
    next(error);
  }
});
// router.put("/", async (req, res, next) => {
// 	try {
// 		var referencelist_service: ReferenceListService = new ReferenceListService();
// 		var referencelist: ReferenceListModel = await referencelist_service.updateReferenceList(req.body);
// 		var result: ActionRes<ReferenceListModel> = new ActionRes<ReferenceListModel>({
// 			item: referencelist
// 		});
// 		res.set("Content-Type", "application/xml");
// 		res.status(200).send(o2x(result));
// 	} catch (error) {
// 		next(error);
// 	}
// });
// router.put("/", async (req, res, next) => {
// 	try {
// 		var referencelist_service: ReferenceListService = new ReferenceListService();
// 		var referencelist: ReferenceListModel = await referencelist_service.updateReferenceList(req.body);
// 		var result: ActionRes<ReferenceListModel> = new ActionRes<ReferenceListModel>({
// 			item: referencelist
// 		});
// 		res.set("Content-Type", "application/xml");
// 		res.status(200).send(result));
// 	} catch (error) {
// 		next(error);
// 	}
// });
router.post("/",checkToken, async (req, res, next) => {
  try {
    var referencelist_service: ReferenceListService = new ReferenceListService();
    var referencelist = await referencelist_service.insertReferenceList(
    req.body.item
    );
    var result: ActionRes<ReferenceListModel> = new ActionRes<ReferenceListModel>(
      {
        item: referencelist,
      }
    );
    next (result)
  } catch (error) {
    next(error);
  }
});
export { router as ReferenceListController };
