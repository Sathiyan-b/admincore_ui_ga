import jwt from "jsonwebtoken";
import { ErrorResponse } from "../../global/models/errorres.model";
import * as _ from "lodash";
import { Response } from "express";
import { AuthService } from "../service/auth.service";
import httpContext from "express-http-context";
import { Auth } from "../models/auth.model";
import { UsersService } from "../service/users.service";
import { Users, UsersWrapper } from "../models/users.model";

const checkToken = async (req: any, res: Response<any>, next: any) => {
  try {
    const JWT_SECRET = _.get(process, "env.JWT_SECRET", "SECRET");
    let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase

    if (token) {
      let authservice = new AuthService();
      let userservice = new UsersService();
      let auth = new Auth();
      auth.session = await authservice.isAccessTokenValid(token);
      auth.user = new UsersWrapper();
      auth.user.id = auth.session.user_id;
      auth.user.is_factory = false;
      var user_list = await userservice.getUserWithConfidentialInfo(auth.user);
      auth.user = user_list[0];
      auth.push_notification_token = auth.session.push_notification_token;
      httpContext.set("user_context", auth);
      // var test = httpContext.get("user_context")
      // console.log("test", test)
      next();
    } else {
      next(
        new ErrorResponse({
          code: ErrorResponse.CODES.UNAUTHORIZED,
          message: "token not supplied",
        })
      );
    }
  } catch (error) {
    next(error);
  }
};
export { checkToken };
