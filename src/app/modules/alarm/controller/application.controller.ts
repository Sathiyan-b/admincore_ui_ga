import express from "express";
import _ from "lodash";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { Application } from "../models/application.model";
import { ApplicationService } from "../service/application.service";
const router = express.Router();

router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Application> = new ActionRes<Application>({
      item: new Application(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post(
  "/get",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_VIEW_REGISTERED_APPLICATIONS],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var result: ActionRes<Array<Application>> = new ActionRes<
        Array<Application>
      >();
      var service: ApplicationService = new ApplicationService();
      result.item = await service.select(req.body.item);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.post("/getSecret",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<Application>> = new ActionRes<
      Array<Application>
    >();
    var service: ApplicationService = new ApplicationService();
    result.item = await service.select(req.body.item, false);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/generateAppKey",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<Application>> = new ActionRes<
      Array<Application>
    >();
    var service: ApplicationService = new ApplicationService();
    result.item = await service.genarateAppKey(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post(
  "/insert",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_REGISTERED_APPLICATIONS],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var result: ActionRes<Application> = new ActionRes<Application>();
      var service: ApplicationService = new ApplicationService();
      var _req = new Application();
      _req.ad_baseDN = _.get(req.body, "item.ad_baseDN", "");
      _req.ad_username = _.get(req.body, "item.ad_username", "");
      _req.ad_password = _.get(req.body, "item.ad_password", "");
      _req.root_userid = _.get(req.body, "item.root_userid", 0);
      result.item = await service.insert(req.body.item);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/update",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_REGISTERED_APPLICATIONS],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var result: ActionRes<Application> = new ActionRes<Application>();
      var service: ApplicationService = new ApplicationService();
      result.item = await service.update(req.body.item);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/delete",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_REGISTERED_APPLICATIONS],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var result: ActionRes<Application> = new ActionRes<Application>();
      var service: ApplicationService = new ApplicationService();
      result.item = await service.delete(req.body.item);
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

export { router as ApplicationController };
