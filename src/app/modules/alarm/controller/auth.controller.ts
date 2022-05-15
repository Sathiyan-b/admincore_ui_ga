import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { UsersService } from "../service/users.service";
import { Users, UsersWrapper } from "../models/users.model";
import * as _ from "lodash";
import { Auth } from "../models/auth.model";
import { AuthService } from "../service/auth.service";
import { AuthValidator } from "../validator/auth.validator";
// import { UserSessionsService } from "../service/usersessions.service";
// import { UserSessions, UserSessionsWrapper } from "../models/usersessions.model";
// import { PushNotificationModel } from "../models/pushnotification.model";
// import { PushNotificationService } from "../service/pushnotification.service";
// import { PointofcareModel } from "../models/pointofcare.model";
// import { usersocketservice } from "../service/usersocket.service";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();

router.get("/entity", async (req, res, next) => {
  try {
    var result: ActionRes<Auth> = new ActionRes<Auth>({
      item: new Auth({ login: "", password: "", token: "" }),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/userInfo", checkToken, async (req, res, next) => {
  try {
    let authservice = new AuthService();
    let auth = await authservice.getUserInfo(req.body.item);
    var result: ActionRes<Auth> = new ActionRes<Auth>({
      item: auth,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    var auth_service = new AuthService();
    var auth_mode = _.get(process, "env.AUTH_MODE", "NATIVE").trim();
    var authenticated_user = new Auth();
    var _req: Auth = new Auth();
    _req.login = req.body.item.login;
    _req.password = req.body.item.password;
    if (auth_mode == "NATIVE")
      authenticated_user = await auth_service.login(_req);
    else if (auth_mode == "LDAP")
      authenticated_user = await auth_service.loginWithLdap(
        (req.body.item)
      );
    var result: ActionRes<Auth> = new ActionRes<Auth>({
      item: authenticated_user,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/signIn", async (req, res, next) => {
  try {
    var auth_service = new AuthService();
    var auth_mode = _.get(process, "env.AUTH_MODE", "NATIVE").trim();
    var authenticated_user = new Auth();
    var _req :Auth = new Auth();
    _req.app_key = _.get(req.body,"item.app_key","") 
    _req.login = _.get(req.body,"item.login","") 
    _req.password = _.get(req.body,"item.password","") 
    _req.push_notification_token = _.get(req.body,"item.push_notification_token","") 

    if (auth_mode == "NATIVE")
      authenticated_user = await auth_service.loginExternalApp(_req);
    else if (auth_mode == "LDAP")
      authenticated_user = await auth_service.loginWithLdap(
        new Auth(req.body.item)
      );
    var result: ActionRes<Auth> = new ActionRes<Auth>({
      item: authenticated_user,
    });
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});


router.post("/refreshToken", async (req, res, next) => {
  try {
    var auth_validator: AuthValidator = new AuthValidator();
    auth_validator.token(req.body.item);
    var auth_service: AuthService = new AuthService();
    var _req : Auth = new Auth();
    _req.app_key = _.get(req.body,"item.app_key","") 
    _req.refresh_token = _.get(req.body,"item.refresh_token","") 
    var _user = await auth_service.refreshTokenExtrnalApp(_req);

    var result: ActionRes<Auth> = new ActionRes<Auth>({
      item: _user,
    });
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/getotp", async (req, res, next) => {
  try {
    var auth_validator: AuthValidator = new AuthValidator();
    auth_validator.getotp(req.body.item);
    var auth_service: AuthService = new AuthService();
    var _user = await auth_service.getOtp(req.body.item);

    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: _user,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/resetpasswordwithotp", async (req, res, next) => {
  try {
    var auth_validator: AuthValidator = new AuthValidator();
    auth_validator.resetpasswordwithotp(req.body.item);
    var auth_service: AuthService = new AuthService();
    var _user = await auth_service.resetpasswordwithotp(
      req.body.item
    );
    var result: ActionRes<UsersWrapper> = new ActionRes<UsersWrapper>({
      item: _user,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/token", async (req, res, next) => {
  try {
    var auth_validator: AuthValidator = new AuthValidator();
    auth_validator.token(req.body.item);
    var auth_service: AuthService = new AuthService();
    var _user = await auth_service.refreshToken(req.body.item);

    var result: ActionRes<Auth> = new ActionRes<Auth>({
      item: _user,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/logout", async (req, res, next) => {
  try {
    var auth_validator: AuthValidator = new AuthValidator();
    auth_validator.logout(req.body.item);
    var auth_service: AuthService = new AuthService();
    var is_logged_out = await auth_service.logout(req.body.item);

    var result: ActionRes<boolean> = new ActionRes<boolean>({
      item: is_logged_out,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

export { router as AuthController };
