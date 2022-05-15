import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { RoleProfilesService } from "../service/roleprofiles.service";
import {
  RoleProfiles,
  RoleProfilesWrapper,
} from "../models/roleprofiles.model";
import * as _ from "lodash";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";
import { checkToken } from "../middleware/auth.middleware";

const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<RoleProfilesWrapper> =
      new ActionRes<RoleProfilesWrapper>({
        item: new RoleProfilesWrapper(),
      });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/all",checkToken,
  // checkPermissions(
  //   [PrivilegePermissions.PERMISSIONS.CAN_VIEW_ROLEPROFILE],
  //   PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  // ),
  async (req, res, next) => {
    try {
      var roleprofile_service: RoleProfilesService = new RoleProfilesService();
      // var id = _.get(req, "params.id", 0);
      var _role = new RoleProfilesWrapper();
      _role.is_active = true;
      if (_.get(req, "query.is_active", null) != null)
        _role.is_active = req.query.is_active == "true" ? true : false;

      var roleprofile_list = await roleprofile_service.getRoleProfiles(_role);
      var result: ActionRes<Array<RoleProfilesWrapper>> = new ActionRes<
        Array<RoleProfilesWrapper>
      >({
        item: roleprofile_list,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/load",checkToken, async (req, res, next) => {
  try {
    var roleprofile_service: RoleProfilesService = new RoleProfilesService();
    // var id = _.get(req, "params.id", 0);
    var roleprofile_list = await roleprofile_service.loadRoleProfiles();
    var result: ActionRes<Array<RoleProfilesWrapper>> = new ActionRes<
      Array<RoleProfilesWrapper>
    >({
      item: roleprofile_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id",checkToken, async (req, res, next) => {
  try {
    var roleprofile_service: RoleProfilesService = new RoleProfilesService();
    var _req = new RoleProfilesWrapper();
    var id = _.get(req, "params.id", 0);
    _req.id = id;
    var roleprofile_list = await roleprofile_service.getRoleProfilebyid(_req);

    var result: ActionRes<Array<RoleProfilesWrapper>> = new ActionRes<
      Array<RoleProfilesWrapper>
    >({
      item: roleprofile_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/validator",checkToken, async (req, res, next) => {
  try {
    var _req = new RoleProfilesWrapper();
    var user_service: RoleProfilesService = new RoleProfilesService();
    var user_list = await user_service.RoleProfileValidation(req.body.item);
    var result: ActionRes<Array<RoleProfilesWrapper>> = new ActionRes<
      Array<RoleProfilesWrapper>
    >({
      item: user_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_ROLEPROFILE],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var roleprofile_service: RoleProfilesService = new RoleProfilesService();
      var roleprofile: RoleProfilesWrapper =
        await roleprofile_service.updateRoleProfile(req.body.item);
      var result: ActionRes<RoleProfilesWrapper> =
        new ActionRes<RoleProfilesWrapper>({
          item: roleprofile,
        });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_ROLEPROFILE],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var roleprofile_service: RoleProfilesService = new RoleProfilesService();
      var roleprofile: RoleProfilesWrapper =
        await roleprofile_service.insertRoleProfile(req.body.item);
      var result: ActionRes<RoleProfilesWrapper> =
        new ActionRes<RoleProfilesWrapper>({
          item: roleprofile,
        });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/deleteinbulk", checkToken,
checkPermissions(
  [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_ROLEPROFILE],
  PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
),
async (req, res, next) => {
  try {
    var roleprofile_service: RoleProfilesService = new RoleProfilesService();
    var request: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    _.forEach(req.body.item, (v) => {
      var _req = new RoleProfilesWrapper();
      _req.id = _.get(v, "id", 0);
      _req.is_active = _.get(v, "is_active", false);
      request.push(_req);
    });
    var role_list: Array<RoleProfilesWrapper> =
      await roleprofile_service.deleteRoleProfileInBulk(request);
    var result: ActionRes<Array<RoleProfilesWrapper>> = new ActionRes<
      Array<RoleProfilesWrapper>
    >({
      item: role_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.put("/togglesuspendinbulk",checkToken, async (req, res, next) => {
  try {
    var roleprofile_service: RoleProfilesService = new RoleProfilesService();
    var request: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    _.forEach(req.body.item, (v) => {
      request.push(new RoleProfilesWrapper(v));
    });
    var user_list: Array<RoleProfilesWrapper> =
      await roleprofile_service.togglesuspendRoleInBulk(request);
    var result: ActionRes<Array<RoleProfilesWrapper>> = new ActionRes<
      Array<RoleProfilesWrapper>
    >({
      item: user_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

export { router as RoleProfileController };
