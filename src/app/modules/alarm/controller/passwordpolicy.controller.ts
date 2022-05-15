import express from "express";
import * as _ from "lodash";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { PasswordPolicy } from "../models/passwordpolicy.model";
import PasswordPolicyService from "../service/passwordpolicy.service";

const router = express.Router();

router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<PasswordPolicy> = new ActionRes<PasswordPolicy>({
      item: new PasswordPolicy(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_VIEW_PASSWORD_POLICY],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var password_policy_service: PasswordPolicyService =
        new PasswordPolicyService();
      var password_policy_list =
        await password_policy_service.getPasswordPolicy();
      var result: ActionRes<Array<PasswordPolicy>> = new ActionRes<
        Array<PasswordPolicy>
      >({
        item: password_policy_list,
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
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_PASSWORD_POLICY],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var password_policy_service: PasswordPolicyService =
        new PasswordPolicyService();
      var password_policy: PasswordPolicy =
        await password_policy_service.insertPasswordPolicy(req.body.item);
      var result: ActionRes<PasswordPolicy> = new ActionRes<PasswordPolicy>({
        item: password_policy,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_PASSWORD_POLICY],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  async (req, res, next) => {
    try {
      var password_policy_service: PasswordPolicyService =
        new PasswordPolicyService();
      var password_policy: PasswordPolicy =
        await password_policy_service.updatePasswordPolicy(req.body.item);
      var result: ActionRes<PasswordPolicy> = new ActionRes<PasswordPolicy>({
        item: password_policy,
      });
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

export { router as PasswordPolicyController };
