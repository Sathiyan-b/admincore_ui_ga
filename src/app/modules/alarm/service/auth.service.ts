import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { Auth } from "../models/auth.model";
import { UsersService } from "./users.service";
import { Users, UsersWrapper } from "../models/users.model";
import { ErrorResponse } from "../../global/models/errorres.model";
import bcrypt from "bcrypt";
import { UserSessionsService } from "./usersessions.service";
import {
  UserSessions,
  UserSessionsWrapper,
} from "../models/usersessions.model";
import moment from "moment";
import {
  RoleProfiles,
  RoleProfilesWrapper,
} from "../models/roleprofiles.model";
import { RoleProfilesService } from "./roleprofiles.service";
// import {
//   RegdApplications,
//   ApplicationWrapper,
// } from "../models/regdapplications.model";
// import { RegdApplicationsService } from "./regdapplications.service";

import { Application, ApplicationWrapper } from "../models/application.model";
import { ApplicationService } from "./application.service";
import { Mailer } from "../../global/utils/mailer";
import { PrivilegePermissions } from "../../auth/models/permissions.model";
import { PrivilegesWrapper } from "../models/privileges.model";
import { GuardianUserSessionsService } from "./guardianusersessions.service";
import {
  GuardianUserSessions,
  GuardianUserSessionsWrapper,
} from "../models/guardianusersessions.model";

export class AuthService extends BaseService {
  //   JWT_SECRET = _.get(process, "env.JWT_SECRET", "SECRET");
  //   getToken(user: UserModel) {
  //     var token = "";
  //     try {
  //       var token_expires_in = new this.utils.Environment().TOKEN_EXPIRES_IN;
  //       var expires_in = `${token_expires_in.value}${token_expires_in.unit}`;
  //       token = jwt.sign({ id: user.id }, this.JWT_SECRET, {
  //         expiresIn: expires_in,
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //     return token;
  //   }
  //   async getRefreshToken(user: UserModel, auth: Auth) {
  //     var refresh_token = "";
  //     try {
  //       var usersession_service = new UserSessionService();
  //       var user_session = await usersession_service.insert(
  //         new UserSessionModel({
  //           user_id: user.id,togglesuspendinbulk  
  //           push_notification_token: _.get(auth, "push_notification_token", ""),
  //         })
  //       );
  //       refresh_token = user_session.refresh_token;
  //     } catch (error) {
  //       throw error;
  //     }
  //     return refresh_token;
  //   }
  loginExternalApp = async (auth: Auth): Promise<Auth> => {
    var result: Auth = new Auth();
    try {
      var user_service = new UsersService();
      var application_service = new ApplicationService();
      if (auth.login!.length == 0) {
        throw new ErrorResponse({
          message: "provide login",
        });
      }
      if (auth.app_key!.length == 0) {
        throw new ErrorResponse({
          message: "App key should not be empty",
        });
      }
      var _app: Application = await application_service.verifyApplicationByKey(
        auth.app_key || ""
      );
      if (_app.id == 0) {
        throw new ErrorResponse({
          message: "Please provide valid app_key",
        });
      }
      var _user_req: UsersWrapper = new UsersWrapper();
      _user_req.login = auth.login;
      var user_list = await user_service.getUserWithConfidentialInfo(_user_req);
      if (user_list.length <= 0) {
        throw new ErrorResponse({
          message: "Invalid User ID",
        });
      }
      var user = user_list[0];
      if (user.is_active == false) {
        throw new ErrorResponse({
          message: "User Account is not Active",
        });
      }
      if (user.is_suspended == true) {
        throw new ErrorResponse({
          message: "User Account is in locked status",
        });
      }
      if (user.app_id != _app.id) {
        throw new ErrorResponse({
          message: "User not associated with the application",
        });
      }
      var secret = _.get(process, "env.SECRET", "secret");
      var is_verified = bcrypt.compareSync(
        auth.password + secret,
        user.password
      );
      if (is_verified) {
        let user_session = new UserSessions();
        user_session.user_id = user.id;
        user_session.app_id = user.app_id;
        user_session.push_notification_token = auth.push_notification_token
          ? auth.push_notification_token
          : "";
        var usersession_service = new UserSessionsService();
        user_session = await usersession_service.insert(user_session);

        (result.token = user_session.access_token),
          (result.user = user),
          (result.refresh_token = user_session.refresh_token);
      } else {
        throw new ErrorResponse({
          message: "Invalid Password",
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  };
  login = async (_req: Auth): Promise<Auth> => {
    var result: Auth = new Auth();
    try {
      var user_service = new UsersService();
      if (_req.login!.length == 0) {
        throw new ErrorResponse({
          message: "Provide login",
        });
      }
      var _userreq: UsersWrapper = new UsersWrapper();
      _userreq.login = _req.login;
      var user_list = await user_service.getUserWithConfidentialInfo(_userreq);
      if (user_list.length <= 0) {
        throw new ErrorResponse({
          message: "Invalid User Id",
        });
      }
      var user = user_list[0];
      if (user.is_active == false) {
        throw new ErrorResponse({
          message: "User Account is not Active",
        });
      }
      if (user.is_suspended == true) {
        throw new ErrorResponse({
          message: "User Account is in locked status",
        });
      }
      var secret = _.get(process, "env.SECRET", "secret");
      var is_verified = bcrypt.compareSync(
        _req.password + secret,
        user.password
      );
      if (is_verified) {
        let user_session = new UserSessionsWrapper();
        user_session.user_id = user.id;
        user_session.app_id = user.app_id;
        user_session.push_notification_token = _req.push_notification_token
          ? _req.push_notification_token
          : "";
        var usersession_service = new UserSessionsService();
        user_session = await usersession_service.insert(user_session);

        result.token = user_session.access_token;
        result.user = user;
        result.refresh_token = user_session.refresh_token;
      } else if(user.id > 0 && !is_verified){
        throw new ErrorResponse({
          message: "Invalid password",
        });
      } else {
        throw new ErrorResponse({
          message: "Invalid credentials",
        });
      }
    } catch (error) {
      var e = error;
      throw error;
    }
    return result;
  };
  loginWithLdap = async (auth: Auth): Promise<Auth> => {
    var result: Auth = new Auth();
    try {
      var user_service = new UsersService();
      if (auth.login!.length == 0) {
        throw new ErrorResponse({
          message: "Provide login",
        });
      }
      var user_list = await user_service.getUserWithConfidentialInfo(
        new UsersWrapper({ login: auth.login })
      );
      if (user_list.length <= 0) {
        throw new ErrorResponse({
          message: "Invalid user",
        });
      }
      var user = user_list[0];
      var is_super_user = false;
      var is_ldap_verified = false;
      if (user.user_type_id == 0 && user.is_factory) {
        is_super_user = true;
      } else {
        await using(new this.utils.Ldap(), async (ldap) => {
          await ldap.init();
          is_ldap_verified = await ldap
            .authenticateUser({
              user_name: user.login,
              password: auth.password as string,
            })
            .then(() => {
              return true;
            })
            .catch(() => {
              return false;
            });
        });
      }
      if (is_super_user || is_ldap_verified) {
        if (is_ldap_verified) user = await this.getUserInfoForLdapUser(user);
        let user_session = new UserSessionsWrapper();
        user_session.user_id = user.id;
        user_session.push_notification_token = auth.push_notification_token
          ? auth.push_notification_token
          : "";
        var usersession_service = new UserSessionsService();
        user_session = await usersession_service.insert(user_session);

        result.token = user_session.access_token;
        result.user = user;
        result.refresh_token = user_session.refresh_token;
      } else {
        if (is_super_user) {
          throw new ErrorResponse({
            message: "Invalid Credentials",
          });
        }
        if (!is_ldap_verified) {
          throw new ErrorResponse({
            message: "Invalid LDAP Credentials",
          });
        }
      }
    } catch (transaction_error) {
      let error: any = transaction_error;
      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: auth,
        exception: error.stack,
      });
    }
    return result;
  };
  async getUserInfoForLdapUser(_user: UsersWrapper): Promise<UsersWrapper> {
    var result = new UsersWrapper();
    try {
      var user_service = new UsersService();
      var role_profile_service = new RoleProfilesService();
      /* get ldap groups of user */
      var ldap_groups_of_user: Array<RoleProfilesWrapper> | Array<string> =
        await user_service.getLDAPGroupsForLDAPUser({
          user_dn: _user.active_directory_dn,
        });
      /* transform ldap groups to array of strings */
      ldap_groups_of_user = _.map(ldap_groups_of_user, (v) => {
        return v.dn;
      });
      /* get Roleprolfile list */
      var role_profile_list: Array<RoleProfilesWrapper> =
        await role_profile_service.getRoleProfiles();
      /* filter roleprofile which is mapped with any one of user's ldap groups */
      var role_profile_list_mapped_with_user_ldap_group_list: Array<RoleProfilesWrapper> =
        _.filter(role_profile_list, (v) => {
          var is_role_profile_mapped_with_any_of_ldap_groups =
            _.intersection(v.ldap_config, ldap_groups_of_user as Array<string>)
              .length > 0;
          if (is_role_profile_mapped_with_any_of_ldap_groups == true) return v;
        }) as Array<RoleProfilesWrapper>;
      /* update role profile list for ldap user */
      _user.roleprofile = _.map(
        role_profile_list_mapped_with_user_ldap_group_list,
        (v) => {
          var role_profile_temp = new RoleProfilesWrapper();
          role_profile_temp.id = v.id;
          role_profile_temp.display_text = v.display_text;

          return role_profile_temp;
        }
      );
      /* update user roleprofile */
      await user_service.updateUser(_user);
      /* get Updated user info with privileges */
      var req = new UsersWrapper();
      req.login = _user.login;
      var updated_user_info: Array<UsersWrapper> | UsersWrapper =
        await user_service.getUserWithConfidentialInfo(req);

      updated_user_info = updated_user_info[0];
      /* remove user's confidential info */
      updated_user_info.otp = "";
      updated_user_info.password = "";
      result = updated_user_info;
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getOtp(_user: UsersWrapper): Promise<UsersWrapper> {
    var result = new UsersWrapper();
    try {
      var user_service = new UsersService();
      var user_list: Array<UsersWrapper> = await user_service.getUsers(_user);
      if (_.get(user_list, "0", null) != null) {
        _user = user_list[0];
        _user.otp = this.utils.random_string_generator.generate(
          4,
          "1234567890"
        );
        await this.updateUserOTP(_user);
        await Mailer.getInstance().sendMail(
          _user.email,
          this.environment.mail_subject,
          `Dear Customer, ${_user.otp} is your OTP. Please enter the OTP to validate your login.\n `
        );
        // await this.utils.mailer.transporter?.sendMail({
        //   from: this.utils.mailer.host_email,
        //   to: _user.email,
        //   subject: "Alarm",
        //   text: `Dear Customer, ${_user.otp} is your OTP. Please enter the OTP to validate your login.\n `,
        // });
        _user.otp = "";
        result = _user;
      } else {
        throw new ErrorResponse({
          message: `${_user.email} is not associated with any users`,
        });
      }
    } catch (error) {
      var e = error;
      throw error;
    }
    return result;
  }
  public async updateUserOTP(_user: UsersWrapper): Promise<UsersWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var user_service = new UsersService();
        _user = await user_service.updateUserOTPTransaction(db, _user);
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _user,
        exception: error.stack,
      });
    }
    return _user;
  }
  async resetpasswordwithotp(_user: UsersWrapper): Promise<UsersWrapper> {
    var result = new UsersWrapper();
    try {
      var user_service = new UsersService();
      var user_list: Array<UsersWrapper> = await user_service.getUsers(
        _user,
        true
      );
      if (_.get(user_list, "0", null) != null) {
        await user_service.updatePassword(_user);

        var user_temp = user_list[0];
        _user.id = user_temp.id;
        if (user_temp.otp != "" && user_temp.otp == _user.otp) {
          await user_service.updatePassword(_user);
          user_temp.otp = "";
          user_temp.password = "";
          result = user_temp;
        } else {
          throw new ErrorResponse({
            message: "Invalid OTP",
          });
        }
      } else {
        throw new ErrorResponse({
          message: `User not found`,
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  async refreshTokenExtrnalApp(_auth: Auth) {
    var result = new Auth();
    try {
      /* get session against refresh token */
      var usersession_service = new UserSessionsService();
      var application_service = new ApplicationService();
      if (_auth.app_key!.length == 0) {
        throw new ErrorResponse({
          message: "App key should not be empty",
        });
      }
      var _app: Application = await application_service.verifyApplicationByKey(
        _auth.app_key || ""
      );

      if (_app.id == 0) {
        throw new ErrorResponse({
          message: "Please provide valid app_key",
        });
      }
      var _usersession_req = new UserSessions();
      _usersession_req.refresh_token = _auth.refresh_token;
      var user_session: UserSessions | Array<UserSessions> =
        await usersession_service.get(_usersession_req);
      if (!_.has(user_session, "0")) {
        throw new ErrorResponse({
          code: ErrorResponse.CODES.INVALID_SESSION,
          message: "Session not found",
        });
      }
      user_session = user_session[0] as UserSessions;

      /* check expiration */
      var is_session_expired =
        usersession_service.isSessionExpired(user_session);
      is_session_expired;
      if (is_session_expired == false) {
        /* create response */
        var auth = new Auth();
        var _user_wrapper_req = new UsersWrapper();
        _user_wrapper_req.id = user_session.user_id;
        var user_service = new UsersService();
        var user: UsersWrapper | Array<UsersWrapper> =
          await user_service.getUserWithConfidentialInfo(_user_wrapper_req);
        if (!_.has(user, "0")) {
          throw new ErrorResponse({
            code: ErrorResponse.CODES.INVALID_SESSION,
            message: "User not found",
          });
        }
        user = user[0];
        user_session = await usersession_service.generateNewAccessToken(
          user_session
        );
        result.user = user;
        result.token = user_session.access_token;
        result.refresh_token = _auth.refresh_token;
        // result.session = user_session;
      } else {
        /* session expired */
        user_session.is_expired = true;
        user_session.end_time = new Date();
        await usersession_service.update(user_session);

        throw new ErrorResponse({
          code: ErrorResponse.CODES.INVALID_SESSION,
          message: "Session Expired",
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  async refreshToken(_auth: Auth) {
    var result = new Auth();
    try {
      /* get session against refresh token */
      var usersession_service = new UserSessionsService();
      var req = new UserSessionsWrapper();
      req.refresh_token = _auth.refresh_token;
      var user_session: UserSessionsWrapper | Array<UserSessionsWrapper> =
        await usersession_service.get(req);
      var req = new UserSessionsWrapper();
      req.refresh_token = _auth.refresh_token;

      if (!_.has(user_session, "0")) {
        throw new ErrorResponse({
          code: ErrorResponse.CODES.INVALID_SESSION,
          message: "Session not found",
        });
      }
      user_session = user_session[0] as UserSessionsWrapper;

      /* check expiration */
      var is_session_expired =
        usersession_service.isSessionExpired(user_session);
      is_session_expired;
      if (is_session_expired == false) {
        /* create response */
        var auth = new Auth();
        var user_service = new UsersService();
        var _req = new UsersWrapper();
        _req.id = user_session.user_id;
        var user: UsersWrapper | Array<UsersWrapper> =
          await user_service.getUserWithConfidentialInfo(_req);

        if (!_.has(user, "0")) {
          throw new ErrorResponse({
            code: ErrorResponse.CODES.INVALID_SESSION,
            message: "User not found",
          });
        }
        user = user[0];
        user_session = await usersession_service.generateNewAccessToken(
          user_session
        );
        result.user = user;
        result.token = user_session.access_token;
        result.refresh_token = _auth.refresh_token;
        result.session = user_session;
      } else {
        /* session expired */
        user_session.is_expired = true;
        user_session.end_time = new Date();
        await usersession_service.update(user_session);

        throw new ErrorResponse({
          code: ErrorResponse.CODES.INVALID_SESSION,
          message: "Session Expired",
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  async logout(_req: Auth) {
    var result: boolean = false;
    try {
      var usersession_service = new UserSessionsService();
      var req = new UserSessionsWrapper();
      req.refresh_token = _req.refresh_token;
      var user_session: UserSessionsWrapper | Array<UserSessionsWrapper> =
        await usersession_service.get(req);

      if (!_.has(user_session, "0")) {
        throw new ErrorResponse({
          message: "Session not found",
        });
      }
      user_session = user_session[0] as UserSessionsWrapper;
      user_session.is_expired = true;
      user_session.end_time = new Date();
      await usersession_service.update(user_session);
      result = true;
    } catch (error) {
      throw error;
    }
    return result;
  }
  async isAccessTokenValid(access_token: string) {
    let result: UserSessionsWrapper = new UserSessionsWrapper();
    try {
      let usersession_service = new UserSessionsService();
      let usersession = new UserSessionsWrapper();
      usersession.access_token = access_token;
      let usersession_list = await usersession_service.get(usersession);
      if (usersession_list.length == 0) {
        throw new ErrorResponse({
          code: ErrorResponse.CODES.UNAUTHORIZED,
          message: "Session invalid",
        });
      }
      usersession = usersession_list[0];
      if (
        moment().isAfter(moment(usersession.access_token_valid_till as Date))
      ) {
        throw new ErrorResponse({
          code: ErrorResponse.CODES.UNAUTHORIZED,
          message: "Token expired",
        });
      }
      result = usersession;
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getUserInfo(_req: ApplicationWrapper) {
    let result = new Auth();
    try {
      let application_service = new ApplicationService();
      let application_list = await application_service.select(_req, false);
      if (application_list.length != 1) {
        throw new ErrorResponse({
          message: "Invalid Application",
        });
      }
      result = this.user_context;
    } catch (error) {
      throw error;
    }
    return result;
  }

  matchPermissions(
    requested_privilege_list: Array<PrivilegePermissions.PERMISSIONS>,
    user_privilege_list: Array<PrivilegesWrapper>,
    mode: PrivilegePermissions.PERMISSION_CHECK_MODE
  ) {
    var result: boolean = false;
    try {
      var user_data = this.user_context.user;
      if (user_privilege_list.length > 0) {
        let privilege_key_list: Array<string> = _.map(
          user_privilege_list,
          (v) => {
            return v.identifier;
          }
        );
        switch (mode) {
          case PrivilegePermissions.PERMISSION_CHECK_MODE.SOME:
            result = _.some(requested_privilege_list, (v) => {
              return privilege_key_list.includes(v);
            });
            break;
          case PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY:
            result = _.every(requested_privilege_list, (v) => {
              return privilege_key_list.includes(v);
            });
            break;
          default:
            break;
        }
      } else {
        if (user_data.is_factory) result = true;
      }
    } catch (e) {
      var error = e;
      throw error;
    }
    return result;
  }
  async isAccesstokenValid(access_token: string) {
    let result = new GuardianUserSessions();
    try {
      let usersession_service = new GuardianUserSessionsService();
      let usersession = new GuardianUserSessions();
      usersession.access_token = access_token;
      let user_session_list = await usersession_service.get(usersession);
      if (user_session_list.length == 0) {
        let error = new ErrorResponse();
        error.code = ErrorResponse.CODES.UNAUTHORIZED;
        error.message = "Session invalid";
        throw error;
      }
      usersession = user_session_list[0];
      if (
        moment().isAfter(moment(usersession.access_token_valid_till as Date))
      ) {
        let res = new ErrorResponse();
        res.code = ErrorResponse.CODES.UNAUTHORIZED;
        res.message = "Token expired";
        throw res;
      }
      result = usersession;
    } catch (error) {
      throw error;
    }
    return result;
  }
}
