import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../global/models/errorres.model";
import { AuthService } from "../../alarm/service/auth.service";
import httpContext from "express-http-context";
import { PrivilegePermissions } from "../models/permissions.model";

export const checkPermissions = (
  permission_list: Array<PrivilegePermissions.PERMISSIONS>,
  mode: PrivilegePermissions.PERMISSION_CHECK_MODE
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      var permission_map_list = httpContext.get("user_context").user.privileges;
      var auth_service: AuthService = new AuthService();
      var is_allowed: boolean = auth_service.matchPermissions(
        permission_list,
        permission_map_list,
        mode
      );
      if (is_allowed) {
        next();
      } else {
        next(
          new ErrorResponse({
            // code: ErrorResponse.ErrorCodes.FORBIDDEN,
            message: "Permission Denied",
          })
        );
      }
    } catch (e) {
      var error = e;
      throw error;
    }
  };
};
