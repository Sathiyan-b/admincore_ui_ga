import express from "express";
import * as _ from "lodash";
import { ActionRes } from "../../global/models/actionres.model";
import { UserTeam } from "../models/userteam.model";
import UserTeamService from "../service/userteam.service";
import { checkToken } from "../middleware/auth.middleware";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";

const router = express.Router();

router.get("/entity", checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<UserTeam> = new ActionRes<UserTeam>({
      item: new UserTeam()
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/", checkToken, async (req, res, next) => {
  try {
    var userteam_service: UserTeamService = new UserTeamService();
    var userteam_list = await userteam_service.getUserTeam();
    var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
      item: userteam_list
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/all", async (req, res, next) => {
  try {
    var user_service: UserTeamService = new UserTeamService();

    var userteam_list = new UserTeam();
    userteam_list.is_active = null;
    if (_.get(req, "query.is_active", null) != null)
      userteam_list.is_active = req.query.is_active == "true" ? true : false;
    if (_.get(req, "query.id", null) != null)
      userteam_list.id = _.get(req, "query.id", 0);

    var user_list = await user_service.getAllUserTeam(userteam_list);
    var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
      item: user_list
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get(
  "/userall",
  checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_VIEW_TEAM],
    PrivilegePermissions.PERMISSION_CHECK_MODE.SOME
  ),
  async (req, res, next) => {
    try {
      var user_service: UserTeamService = new UserTeamService();

      var userteam_list = new UserTeam();
      userteam_list.is_active = null;
      if (_.get(req, "query.is_active", null) != null)
        userteam_list.is_active = req.query.is_active == "true" ? true : false;
      if (_.get(req, "query.id", null) != null)
        userteam_list.id = _.get(req, "query.id", 0);

      var user_list = await user_service.getAllUserTeam(userteam_list);
      var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
        item: user_list
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
// router.use(checkToken);

router.get("/", checkToken, async (req, res, next) => {
  try {
    var userteam_service: UserTeamService = new UserTeamService();
    var userteam_list = await userteam_service.getUserTeam();
    var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
      item: userteam_list
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_TEAM],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var userteam_service: UserTeamService = new UserTeamService();
      var userteam: UserTeam = await userteam_service.insertUserTeam(
        req.body.item
      );
      var result: ActionRes<UserTeam> = new ActionRes<UserTeam>({
        item: userteam
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/validator", checkToken, async (req, res, next) => {
  try {
    var _req = new UserTeam();
    var user_service: UserTeamService = new UserTeamService();
    var user_list = await user_service.UserTeamValidator(req.body.item);
    var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
      item: user_list
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/",
  checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_TEAM],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var userteam_service: UserTeamService = new UserTeamService();
      var userteam: UserTeam = await userteam_service.updateUserTeam(
        req.body.item
      );
      var result: ActionRes<UserTeam> = new ActionRes<UserTeam>({
        item: userteam
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.get("/getUserTeamForUser", checkToken, async (req, res, next) => {
  try {
    var userteam_service: UserTeamService = new UserTeamService();
    var userteam = await userteam_service.getUserTeamForUser();
    var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
      item: userteam
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.put("/deleteinbulk", checkToken, async (req, res, next) => {
  try {
    var userteam_service: UserTeamService = new UserTeamService();
    var request: Array<UserTeam> = new Array<UserTeam>();
    _.forEach(req.body.item, v => {
      var _req = new UserTeam();
      _req.id = v.id;
      _req.is_active = v.is_active;
      request.push(_req);
    });
    var userteam_list: Array<UserTeam> = await userteam_service.deleteinbulk(
      request
    );
    var result: ActionRes<Array<UserTeam>> = new ActionRes<Array<UserTeam>>({
      item: userteam_list
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

export { router as UserTeamController };
