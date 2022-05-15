import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { UsersService } from "../service/users.service";
// import { EnterpriseService } from "../service/enterprise.service";
import { Users, UsersWrapper } from "../models/users.model";
import {
  RoleProfiles,
  RoleProfilesWrapper,
} from "../models/roleprofiles.model";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { UserValidator } from "../validator/user.validator";
import { usersocketservice } from "../service/usersocket.service";
import httpContext from "express-http-context";
import {
  UserSessions,
  UserSessionsWrapper,
} from "../models/usersessions.model";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";
import { checkToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: new UsersWrapper(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get("/UserInfo",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: new UsersWrapper(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
/* router.get("/getLDAPUsers", async (req, res, next) => {
	try {
		console.log("inside User - Controller for LDAP");
		var user_service: UsersService = new UsersService();
		var user_list = await user_service.getLDAPUsers();
		// var user_list = await user_service.LDAPTest();
		var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
			Array<UsersWrapper>
		>({
			item: user_list
		});
		next (result);
	} catch (error) {
		next(error);
	}
}); */

router.post("/getLDAPGroups",checkToken, async (req, res, next) => {
  try {
    // console.log("inside User - Controller for LDAP");
    var user_service: UsersService = new UsersService();
    // var user_list = await user_service.getLDAPUsers();
    var group_list = await user_service.getLDAPGroups(req.body.item);
    var result: ActionRes<Array<any>> = new ActionRes<Array<any>>({
      item: group_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/getLDAPUsers",checkToken, async (req, res, next) => {
  try {
    // console.log("inside User - Controller for LDAP");
    var user_service: UsersService = new UsersService();
    // var user_list = await user_service.getLDAPUsers();
    var user_list = await user_service.getLDAPUsers(req.body.item);
    var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
      Array<UsersWrapper>
    >({
      item: user_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/getLDAPGroupsForLDAPUser",checkToken, async (req, res, next) => {
  try {
    // console.log("inside User - Controller for LDAP");
    var user_service: UsersService = new UsersService();
    // var user_list = await user_service.getLDAPUsers();
    var user_list = await user_service.getLDAPGroupsForLDAPUser(req.body.item);
    console.log("getLDAPGroupsForLDAPUser", req.body.item);
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

router.get(
  "/all",checkToken,
  // checkPermissions(
  //   [PrivilegePermissions.PERMISSIONS.CAN_VIEW_USER],
  //   PrivilegePermissions.PERMISSION_CHECK_MODE.SOME
  // ),
  async (req, res, next) => {
    try {
      var user_service: UsersService = new UsersService();

      var _user = new UsersWrapper();
      _user.is_active = true;
      if (
        _.get(req, "query.is_active", null) != null &&
        _.get(req, "query.is_active", null) != undefined
      ) {
        _user.is_active = req.query.is_active == "true" ? true : false;
      }
      _user.is_suspended = false;
      if (_.get(req, "query.is_suspended", null) != null)
        _user.is_suspended = req.query.is_suspended == "true" ? true : false;
      _user.user_type_id = _.get(req, "query.user_type_id", 0);

      // _user.is_factory = false;

      var user_list = await user_service.getUsers(_user);
      var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
        Array<UsersWrapper>
      >({
        item: user_list,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_USER],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      console.log("inside User - Controller");
      var _req = new UsersWrapper();
      var user_service: UsersService = new UsersService();
      var id = _.get(req, "params.id", 0);
      _req.id = id;
      var user_list = await user_service.getUserbyid(_req);
      var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
        Array<UsersWrapper>
      >({
        item: user_list,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/validator",checkToken, async (req, res, next) => {
  try {
    var _req = new UsersWrapper();
    var user_service: UsersService = new UsersService();
    var user_list = await user_service.UserValidation(req.body.item);
    var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
      Array<UsersWrapper>
    >({
      item: user_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/getUser",checkToken, async (req, res, next) => {
  try {
    console.log("inside User - Controller");
    var user_service: UsersService = new UsersService();
    var user_list = await user_service.UserValidation(req.body.item);
    var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
      Array<UsersWrapper>
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
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_USER],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var user_service: UsersService = new UsersService();
      var user: UsersWrapper = await user_service.updateUser(req.body.item);
      var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
        item: user,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.put(
  "/deleteinbulk",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_USER],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var user_service: UsersService = new UsersService();
      var request: Array<UsersWrapper> = new Array<UsersWrapper>();
      _.forEach(req.body.item, (v) => {
        var _req = new UsersWrapper();
        _req.id = _.get(v, "id", 0);
        _req.is_active = _.get(v, "is_active", false);
        request.push(_req);
      });
      var user_list: Array<UsersWrapper> = await user_service.deleteUserInBulk(
        request
      );
      var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
        Array<UsersWrapper>
      >({
        item: user_list,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);
router.put("/togglesuspendinbulk",checkToken, async (req, res, next) => {
  try {
    var user_service: UsersService = new UsersService();
    var request: Array<UsersWrapper> = new Array<UsersWrapper>();
    _.forEach(req.body.item, (v) => {
      var _req = new UsersWrapper();
      _req.id = v.id != 0 ? parseInt(v.id) : 0;
      _req.is_suspended = v.is_suspended;
      request.push(_req);
    });
    var user_list: Array<UsersWrapper> =
      await user_service.togglesuspendUserInBulk(request);
    var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
      Array<UsersWrapper>
    >({
      item: user_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/",checkToken, async (req, res, next) => {
  try {
    var user_service: UsersService = new UsersService();
    var user: UsersWrapper = await user_service.insertUser(req.body.item);
    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: user,
    });
    next(result);
  } catch (error) {
    //console.log("User controller error: ", error);
    next(error);
    /* 		next(new ErrorResponse<UsersWrapper>({
			success: false,
			code: error.code,
			error: error.detail,
			message: error.message,
			item: req.body.item,
			exception: error.stack
		})); */
  }
});
router.post("/createinbulk",checkToken, async (req, res, next) => {
  try {
    var user_service: UsersService = new UsersService();
    var request: Array<UsersWrapper> = new Array<UsersWrapper>();
    _.forEach(req.body.item, (v) => {
      var _req = new UsersWrapper();
      _req.dob = v != null && v.dob != "" ? v.dob : "";
      _req.first_name = v != null && v.first_name != "" ? v.first_name : "";
      _req.middle_name = v != null && v.middle_name != "" ? v.middle_name : "";
      _req.last_name = v != null && v.last_name != "" ? v.last_name : "";
      _req.title_id = v.title_id != 0 ? parseInt(v.title_id) : 0;
      _req.gender_id = v.gender_id != 0 ? parseInt(v.gender_id) : 0;
      _req.user_type_id = v.user_type_id != 0 ? parseInt(v.user_type_id) : 0;
      _req.identifier_type_id =
        v.identifier_type_id != 0 ? parseInt(v.identifier_type_id) : 0;
      _req.identifier = v != null && v.identifier != "" ? v.identifier : "";
      _req.phone_number =
        v != null && v.phone_number != "" ? v.phone_number : "";
      _req.mobile_number =
        v != null && v.mobile_number != "" ? v.mobile_number : "";
      _req.email = v != null && v.email != "" ? v.email : "";
      _req.email_as_login_id = v.email_as_login_id;
      _req.login = v != null && v.login != "" ? v.login : "";
      _req.active_directory_dn =
        v != null && v.active_directory_dn != "" ? v.active_directory_dn : "";
      _req.last_password_change = v.last_password_change;
      _req.force_password_change = v.force_password_change;
      _req.login_attemps = v.login_attemps != 0 ? parseInt(v.login_attemps) : 0;
      _req.user_image_id = v.user_image_id != 0 ? parseInt(v.user_image_id) : 0;
      _req.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
      _req.enterprise_id = v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
      _req.ent_location_id =
        v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
      _req.lang_code = v != null && v.lang_code != "" ? v.lang_code : "";
      _req.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
      _req.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
      _req.created_on = v.created_on;
      _req.modified_on = v.modified_on;
      _req.is_active = v.is_active;
      _req.is_suspended = v.is_suspended;
      _req.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
      _req.is_factory = v.is_factory;
      _req.notes = v != null && v.notes != "" ? v.notes : "";
      request.push(_req);
    });
    var user_list: Array<UsersWrapper> = await user_service.insertUserInBulk(
      request
    );
    var result: ActionRes<Array<UsersWrapper>> = new ActionRes<
      Array<UsersWrapper>
    >({
      item: user_list,
    });
    next(result);
  } catch (error) {
    //console.log("User controller error: ", error);
    next(error);
    /* 		next(new ErrorResponse<UsersWrapper>({
			success: false,
			code: error.code,
			error: error.detail,
			message: error.message,
			item: req.body.item,
			exception: error.stack
		})); */
  }
});
router.post("/changepassword",checkToken, async (req, res, next) => {
  try {
    var user_validator: UserValidator = new UserValidator();
    user_validator.changePassword(req.body.item);
    var request: UsersWrapper = new UsersWrapper();
    request.password = req.body.item.password;
    request.id = req.body.item.id;
    request.app_id = req.body.app_id;
    var user_service: UsersService = new UsersService();
    var _user = await user_service.updatePassword(request);

    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: _user,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/updateImage",checkToken, async (req, res, next) => {
  try {
    var user_service: UsersService = new UsersService();
    var user: UsersWrapper = await user_service.updateImage(
      new UsersWrapper(req.body.item)
    );
    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: user,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/testsocket",checkToken, async (req, res, next) => {
  try {
    let user_context: UserSessionsWrapper = httpContext.get("user_context");
    usersocketservice.sendNotification(user_context.user_id, req.body.item);
    var result: ActionRes<boolean> = new ActionRes<any>({
      item: true,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

export { router as UserController };
