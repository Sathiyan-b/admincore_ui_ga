import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { EnterpriseService } from "../service/enterprise.service";
import {
  EnterpriseAssociation,
  Enterprise,
  EnterpriseHierarchyListModel,
} from "../models/enterprise.model";
import * as _ from "lodash";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";
import { checkToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Enterprise> = new ActionRes<Enterprise>({
      item: new Enterprise(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/",checkToken, async (req, res, next) => {
  try {
    var enterprise_service: EnterpriseService = new EnterpriseService();
    // var id = _.get(req, "params.id", 0);
    var enterprise_list = await enterprise_service.getEnterprises();
    var result: ActionRes<Array<Enterprise>> = new ActionRes<Array<Enterprise>>(
      {
        item: enterprise_list,
      }
    );
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/load",checkToken, async (req, res, next) => {
  try {
    var enterprise_service: EnterpriseService = new EnterpriseService();
    // var id = _.get(req, "params.id", 0);
    var enterprise_list = await enterprise_service.loadEnterprises();
    var result: ActionRes<Array<EnterpriseAssociation>> = new ActionRes<
      Array<EnterpriseAssociation>
    >({
      item: enterprise_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get(
  "/enterpriseHierarchyList",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_VIEW_ENTERPRISE],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var enterprise_service: EnterpriseService = new EnterpriseService();
      // var id = _.get(req, "params.id", 0);
      var enterprise_list =
        await enterprise_service.getEnterpriseHierarchyList();
      var result: ActionRes<Array<EnterpriseHierarchyListModel>> =
        new ActionRes<Array<EnterpriseHierarchyListModel>>({
          item: enterprise_list,
        });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.get("/:id",checkToken, async (req, res, next) => {
  try {
    var enterprise_service: EnterpriseService = new EnterpriseService();
    var _req = new Enterprise();
    var id = _.get(req, "params.id", 0);
    _req.id = id;
    var enterprise_list = await enterprise_service.getEnterpriseById(_req);
    var result: ActionRes<Enterprise> = new ActionRes<Enterprise>({
      item: enterprise_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

// router.put("/", xmltodom(), async (req, res, next) => {
// 	try {
// 		var enterprise_service: EnterpriseService = new EnterpriseService();
// 		var enterprise: Enterprise = await enterprise_service.updateEnterprise(req.body);
// 		var result: ActionRes<Enterprise> = new ActionRes<Enterprise>({
// 			item: enterprise
// 		});
// 		res.set("Content-Type", "application/xml");
// 		res.status(200).send(o2x(result));
// 	} catch (error) {
// 		next(error);
// 	}
// });
router.put("/",checkToken, async (req, res, next) => {
  try {
    var enterprise_service: EnterpriseService = new EnterpriseService();
    var enterprise = await enterprise_service.updateEnterprise(req.body.item);
    var result: ActionRes<Enterprise> = new ActionRes<Enterprise>({
      item: enterprise,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/",checkToken, async (req, res, next) => {
  try {
    var enterprise_service: EnterpriseService = new EnterpriseService();
    var enterprise = await enterprise_service.insertEnterprise(req.body.item);
    var result: ActionRes<Enterprise> = new ActionRes<Enterprise>({
      item: enterprise,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/updateImage",checkToken, async (req, res, next) => {
  try {
    var enterprise_service: EnterpriseService = new EnterpriseService();
    var enter: Enterprise = await enterprise_service.updateImage(req.body.item);
    var result: ActionRes<Enterprise> = new ActionRes<Enterprise>({
      item: enter,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
export { router as EnterpriseController };
