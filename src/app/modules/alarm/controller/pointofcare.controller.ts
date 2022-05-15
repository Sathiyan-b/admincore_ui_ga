import express from "express";
import * as _ from "lodash";
import { ActionRes } from "../../global/models/actionres.model";
import {
  Pointofcare,
  PointofcareModelCreteria,
} from "../models/pointofcare.model";
import PointofcareService from "../service/pointofcare.service";
import { checkToken } from "../middleware/auth.middleware";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";

const router = express.Router();

router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Pointofcare> = new ActionRes<Pointofcare>({
      item: new Pointofcare(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/get", async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare_list = await Pointofcare_service.getpointofcare(
      req.body.item
    );
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/pocget",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare_list = await Pointofcare_service.getpointofcare(
      req.body.item
    );
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
// router.use(checkToken);
router.get("/",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare_list = await Pointofcare_service.getpointofcare();
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/unsubscribe",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var _req = new PointofcareModelCreteria();
    _req.id = _.get(req.body, "item.id", 0);
    _req.allow_subscriber = _.get(req.body, "item.allow_subscriber", false);
    var Pointofcare_list = await Pointofcare_service.unSubscribe(_req);
    var result: ActionRes<Pointofcare> = new ActionRes<Pointofcare>({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

// router.get("/all", async (req, res, next) => {
// 	try {
// 		var user_service: PointofcareService = new PointofcareService();

// 		var Pointofcare_list = new Pointofcare();
// 		Pointofcare_list.is_active = null;
// 		if (_.get(req, "query.is_active", null) != null)
// 			Pointofcare_list.is_active =
// 				req.query.is_active == "true" ? true : false;
// 		if (_.get(req, "query.id", null) != null)
// 			Pointofcare_list.id = req.query.id;

// 		var user_list = await user_service.getAllpointofcare(Pointofcare_list);
// 		var result: ActionRes<Array<Pointofcare>> = new ActionRes<
// 			Array<Pointofcare>
// 		>({
// 			item: user_list,
// 		});
// 		next (result);
// 	} catch (error) {
// 		next(error);
// 	}
// });

router.post("/",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare: Pointofcare = await Pointofcare_service.save(
      req.body.item
    );
    var result: ActionRes<Pointofcare> = new ActionRes<Pointofcare>({
      item: Pointofcare,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.put("/",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare: Pointofcare = await Pointofcare_service.update(
      req.body.item
    );
    var result: ActionRes<Pointofcare> = new ActionRes<Pointofcare>({
      item: Pointofcare,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.put("/deleteinbulk",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var request: Array<Pointofcare> = new Array<Pointofcare>();
    _.forEach(req.body.item, (v) => {
      var _req = new Pointofcare();
      _req.id = _.get(v, "id", 0);
      _req.is_active = _.get(v, "is_active", false);
      request.push(_req);
    });
    var Pointofcare_list: Array<Pointofcare> =
      await Pointofcare_service.deleteinbulk(request);
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getUserPointofcareList",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare_list: Array<Pointofcare> =
      await Pointofcare_service.getUserPointofcareList();
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
/* Duplicate */
// router.get("/getPointofcareForUserwithdetails", async (req, res, next) => {
//   try {
//     var Pointofcare_service: PointofcareService = new PointofcareService();
//     var Pointofcare_list: Array<Pointofcare> =
//       await Pointofcare_service.getPointofcareForUserwithdetails();
//     var result: ActionRes<Array<Pointofcare>> = new ActionRes<
//       Array<Pointofcare>
//     >({
//       item: Pointofcare_list,
//     });
//     next (result);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/getPocForSubscription",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare_list: Array<Pointofcare> =
      await Pointofcare_service.getPocForSubscription();
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/getMapData",checkToken, async (req, res, next) => {
  try {
    var Pointofcare_service: PointofcareService = new PointofcareService();
    var Pointofcare: Array<Pointofcare> = await Pointofcare_service.getMapData(
      req.body.item
    );
    var result: ActionRes<Array<Pointofcare>> = new ActionRes<
      Array<Pointofcare>
    >({
      item: Pointofcare,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/updateMapData",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_ENTERPRISE],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var Pointofcare_service: PointofcareService = new PointofcareService();
      var Pointofcare: Pointofcare = await Pointofcare_service.updateMapData(
        req.body.item
      );
      var result: ActionRes<Pointofcare> = new ActionRes<Pointofcare>({
        item: Pointofcare,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.get("/getPointofcareForUser",checkToken, async (req, res, next) => {
  try {
    var _service: PointofcareService = new PointofcareService();
    var resp = await _service.getPointofcareForUser();
    var result: ActionRes<Array<PointofcareModelCreteria>> = new ActionRes<
      Array<PointofcareModelCreteria>
    >();
    result.item = resp;
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});
export { router as PointofCareController };
