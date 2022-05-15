import _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DB, Environment, using } from "../../global/utils";
import { PrivilegesWrapper } from "../models/privileges.model";
import { RoleProfilesWrapper } from "../models/roleprofiles.model";
import { UserRoleProfilesWrapper } from "../models/userroleprofiles.model";
import { Users, UsersWrapper } from "../models/users.model";
import { BaseService } from "./base.service";
import bcrypt from "bcrypt";
import { UserRoleProfilesService } from "./userroleprofiles.service";
import { AppSettingsService } from "./appsettings.service";
import { AppSettingsModel } from "../models/appsettings.model";
import { SettingsModel } from "../models/settings.model";

export class UsersService extends BaseService {
  sql_get_users: string = `SELECT	users.id, users.first_name, users.middle_name, users.last_name, users.mobile_number, users.login, users.email, 
        users.created_on, users.modified_on, users.otp, users.is_suspended, users.is_active, users.user_type_id, 
        users.active_directory_dn, users.app_id, users.is_factory, UserRoleProfiles.roleprofile_id,roleProfiles.id roleProfile_id,
        RoleProfiles.display_text roleProfile_name
        from users
        left join UserRoleProfiles on users.id = UserRoleProfiles.user_id
        left join RoleProfiles on UserRoleProfiles.roleprofile_id = roleprofiles.id `;

  sql_get_users_confidential: string = `SELECT users.id,
        users.first_name,
        users.mobile_number,
        users.login,
        users.email,
        users.password,
        users.is_active,
        users.is_suspended,
        users.is_factory,
        users.created_on,
        users.modified_on,
        users.user_type_id,
        users.active_directory_dn,
        users.user_image_id,
        users.app_id,
        privileges.id privilege_id,
        privileges.identifier,
        privileges.display_text privilege_display_text
      from users 
      left join userroleprofiles on userroleprofiles.user_id = users.id
      left join Roleprofileprivileges on Roleprofileprivileges.roleprofile_id = userroleprofiles.roleprofile_id
      left join privileges on privileges.id = Roleprofileprivileges.privilege_id
          `;

  sql_get_user_by_id: string = `
  SELECT users.id,
          users.first_name,
          users.middle_name,
          users.last_name,
          users.mobile_number,
          users.email,
          users.login,
          users.password,
          users.email_as_login_id,
          users.created_on,
          users.modified_on,
          users.is_suspended,
          users.is_active,
          users.user_type_id,
          users.active_directory_dn,
          users.user_image_id,
          users.app_id,
          users.lang_code,
          roleprofiles.id roleprofile_id,
          roleprofiles.display_text roleprofile_name,
          appsettings.lang_code as lang_as_setting
         from users
         left join userroleprofiles on userroleprofiles.user_id = users.id
         left join roleprofiles on roleprofiles.id = userroleprofiles.roleprofile_id
         left join appsettings on appsettings.user_id = users.id
         WHERE users.id = @id`;

  sql_get_user_with_params: string = `
  SELECT users.id,
    users.first_name,
    users.middle_name,
    users.last_name,
    users.mobile_number,
    users.email,
    users.login,
    users.password,
    users.email_as_login_id,
    users.created_on,
    users.modified_on,
    users.is_suspended,
    users.is_active,
    users.user_type_id,
    users.active_directory_dn,
    users.user_image_id,
    users.app_id,
    roleprofiles.id roleprofile_id,
    roleprofiles.display_text roleprofile_name
  from users
  left join userroleprofiles on userroleprofiles.user_id = users.id
  left join roleprofiles on roleprofiles.id = userroleprofiles.roleprofile_id`;

  sql_update_password: string = `update users set password = @password ,force_password_change='false' @condition`;

  sql_delete_user: string = `
  update users set
      is_active = @is_active,
      is_suspended = false
  where id = @id RETURNING *
`;

  sql_toggle_suspend_user: string = `
		update users set
			is_suspended = @issuspend
		where id = @id RETURNING *
	`;

  sql_image_user: string = `
		update users set
			user_image_id = @user_image_id
		where id = @id RETURNING *
	`;

  sql_updateUserSession:string = `  BEGIN TRANSACTION;
  UPDATE UserSessions
  SET UserSessions.is_expired = 1
  FROM UserSessions
  T1, GuardianUserSessions T2
  WHERE T1.user_id = T2.user_id
  and T1.user_id = @user_id;
  
  UPDATE GuardianUserSessions
  SET GuardianUserSessions.is_expired = 1
  FROM UserSessions T1, GuardianUserSessions T2
  WHERE T1.user_id = T2.user_id
  and T1.user_id = @user_id;

  RETURNING *
  
  COMMIT;`;

  /* not used */

  //   sql_update_user_status: string = `update users set is_active = @is_active, is_suspended = @is_suspended, version = version + 1 where id = @id RETURNING *`;

  /* not used */
  //   sql_mssql_get_users_confidential = `
  //   SELECT users.id,
  //   users.first_name,
  //     users.mobile_number,
  //     users.login,
  //     users.email,
  //     users.password,
  //     users.is_active,
  //     users.is_suspended,
  //     users.is_factory,
  //     users.created_on,
  //     users.modified_on,
  //     users.user_type_id,
  //     users.active_directory_dn,
  //     users.user_image_id,
  //     users.app_id
  // from users`;

  //   sql_select : string = `
  //   SELECT users.id, users.dob, users.first_name, users.middle_name, users.last_name, users.title_id, users.gender_id, users.user_type_id, users.identifier_type_id, users.identifier, users.phone_number, users.mobile_number, users.email, users.email_as_login_id, users.login, users.password, users.active_directory_dn, users.last_password_change, users.force_password_change, users.login_attemps, users.user_image_id, users.app_id, users.enterprise_id, users.ent_location_id, users.lang_code, users.created_by, users.modified_by, users.created_on, users.modified_on, users.is_active, users.is_suspended, users.parent_id, users.is_factory, users.notes
  //   FROM users
  //   @condition;
  //   `;

  sql_insert_user: string = `
INSERT INTO users(dob, first_name, middle_name, last_name, title_id, gender_id, user_type_id, identifier_type_id, identifier, phone_number, mobile_number, email, email_as_login_id, login, password, active_directory_dn, last_password_change, force_password_change, login_attemps, user_image_id, app_id, enterprise_id, ent_location_id, lang_code, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
VALUES (@dob, @first_name, @middle_name, @last_name, @title_id, @gender_id, @user_type_id, @identifier_type_id, @identifier, @phone_number, @mobile_number, @email, @email_as_login_id, @login, @password, @active_directory_dn, @last_password_change, @force_password_change, @login_attemps, @user_image_id, @app_id, @enterprise_id, @ent_location_id, @lang_code, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes)
RETURNING *;  
`;

  sql_update_user: string = `
    UPDATE users
    SET  dob = @dob, first_name = @first_name, middle_name = @middle_name, last_name = @last_name, title_id = @title_id, gender_id = @gender_id, user_type_id = @user_type_id, identifier_type_id = @identifier_type_id, identifier = @identifier, phone_number = @phone_number, mobile_number = @mobile_number, email = @email, email_as_login_id = @email_as_login_id, login = @login, password = @password, active_directory_dn = @active_directory_dn, last_password_change = @last_password_change, force_password_change = @force_password_change, login_attemps = @login_attemps, user_image_id = @user_image_id, app_id = @app_id, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, lang_code = @lang_code, modified_by = @modified_by, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes, otp = @otp
    WHERE id = @id
    RETURNING *;
  `;
  sql_updateOTP_user: string = `UPDATE users SET otp = @otp WHERE id = @id OR email = @email  RETURNING *`;

  sql_delete: string = ` DELETE FROM users
   WHERE id = @id
   RETURNING *; `;

  sql_update_rootuser: string = `update Users set password = @password, mobile_number = @mobile_number, email = @email, modified_on = @modified_on where app_id = @app_id and id = @id`;

  async getUsers(
    _user: UsersWrapper,
    with_otp = false
  ): Promise<Array<UsersWrapper>> {
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        var qb = new this.utils.QueryBuilder(this.sql_get_users);
        if (_user.email != "") {
          qb.addParameter("users.email", _user.email, "=");
        }
        if (_user.is_active != null) {
          qb.addParameter("users.is_active", _user.is_active, "=");
        }
        if (_user.is_suspended != null) {
          qb.addParameter("users.is_suspended", _user.is_suspended, "=");
        }
        if (_user.user_type_id != 0) {
          qb.addParameter("users.user_type_id", _user.user_type_id, "=");
        }
        if (_user.id != 0) {
          qb.addParameter("users.id", _user.id, "=");
          // if (_user.is_factory != null) {
          //   qb.addParameter("is_factory", _user.is_factory, "=");
          // }
        }
        if (_user.app_id != 0) {
          qb.addParameter("users.app_id", _user.app_id, "=");
        }
        if (_user.login != "") {
          let login = _user.login.replace(/'/g, "''");
          qb.addParameter("users.login", login, "=");
        }
        const rows = await db.executeQuery(qb.getQuery());
        _.forEach(rows, (v: any, k: any) => {
          if (with_otp == false) {
            v.otp = "";
          }
          let user_id = v.id != null ? parseInt(v.id) : 0;
          let index = _.findIndex(result, (v2) => {
            return v2.id == user_id;
          });
          let is_new = index == -1;

          var user = new UsersWrapper();
          if (is_new) {
            user.id = v.id != 0 ? parseInt(v.id) : 0;
            user.otp = v != null && v.otp != "" ? v.otp : "";
            user.first_name =
              v != null && v.first_name != "" ? v.first_name : "";
            user.middle_name =
              v != null && v.middle_name != "" ? v.middle_name : "";
            user.last_name = v != null && v.last_name != "" ? v.last_name : "";
            user.mobile_number =
              v != null && v.mobile_number != "" ? v.mobile_number : "";
            user.login = v != null && v.login != "" ? v.login : "";
            user.email = v != null && v.email != "" ? v.email : "";
            user.created_on =
              v != null && v.created_on != "" ? v.created_on : "";
            user.modified_on =
              v != null && v.modified_on != "" ? v.modified_on : "";
            user.is_suspended = v.is_suspended;
            user.is_active = v.is_active;
            user.is_factory = v.is_factory;
            user.user_type_id =
              v.user_type_id != 0 ? parseInt(v.user_type_id) : 0;
            user.active_directory_dn =
              v != null && v.active_directory_dn != ""
                ? v.active_directory_dn
                : "";
            user.app_id = v.user_type_id != 0 ? parseInt(v.user_type_id) : 0;
            user.roleprofile = [];
          } else {
            user = result[index];
          }

          let roleProfile = new RoleProfilesWrapper();
          roleProfile.id = v.roleProfile_id != 0 ? v.roleProfile_id : 0;
          roleProfile.display_text =
            v.roleProfile_name != "" ? v.roleProfile_name : "";
          if (roleProfile.id > 0) {
            user.roleprofile.push(roleProfile);
          }
          if (is_new) {
            result.push(user);
          } else {
            result[index] = user;
          }

          // result.push(user);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: null,
        exception: error.stack,
      });
    }
    return result;
  }

  async getUserWithConfidentialInfo(
    _user: UsersWrapper
  ): Promise<Array<UsersWrapper>> {
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_get_users_confidential);

        if (_user.id > 0) qb.addParameter("users.id", _user.id, "=");
        if (_user.login.length > 0) {
          qb.addParameter("LOWER(login)", _user.login.toLowerCase(), "=");
        }
        var query = qb.getQuery();

        const rows = await db.executeQuery(query);
        /* const { login } = _user;
				const rows = await db.executeQuery(
					this.sql_get_users_confidential,
					[
						login.toLowerCase()
					]
				); */
        if (rows.length > 0) {
          _.forEach(rows, (row: any, k: any) => {
            let user_id = row.id != null ? parseInt(row.id) : 0;
            let user_index = _.findIndex(result, (u) => {
              return u.id == user_id;
            });
            let is_new = user_index == -1;
            var user: UsersWrapper;
            if (is_new) {
              user = new UsersWrapper();
              user.id = row.id != 0 ? parseInt(row.id) : 0;
              user.first_name =
                row != null && row.first_name != "" ? row.first_name : "";
              user.mobile_number =
                row != null && row.mobile_number != "" ? row.mobile_number : "";
              user.login = row != null && row.login != "" ? row.login : "";
              user.email = row != null && row.email != "" ? row.email : "";
              user.password =
                row != null && row.password != "" ? row.password : "";
              user.is_active = row.is_active;
              user.is_suspended = row.is_suspended;
              user.is_factory = row.is_factory;
              user.created_on =
                row != null && row.created_on != "" ? row.created_on : "";
              user.modified_on =
                row != null && row.modified_on != "" ? row.modified_on : "";
              user.user_type_id =
                row.user_type_id != 0 ? parseInt(row.user_type_id) : 0;
              user.active_directory_dn =
                row != null && row.active_directory_dn != ""
                  ? row.active_directory_dn
                  : "";
              user.user_image_id =
                row.user_image_id != 0 ? parseInt(row.user_image_id) : 0;
              user.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
              user.privileges = [];
            } else {
              user = result[user_index];
            }

            let privilege_temp = new PrivilegesWrapper();
            privilege_temp.id =
              row.privilege_id != null ? parseInt(row.privilege_id) : 0;
            privilege_temp.identifier = row.identifier;
            privilege_temp.display_text = row.privilege_display_text;

            if (privilege_temp.id > 0) {
              user.privileges?.push(privilege_temp);
            }

            if (is_new) {
              result.push(user);
            } else {
              result[user_index] = user;
            }
          });
        }
        // await db.executeQuery("COMMIT");
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
    return result;
  }

  async getUserbyid(_user: UsersWrapper): Promise<Array<UsersWrapper>> {
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_get_user_by_id, {
          id: _user.id,
        });
        _.forEach(rows, (row: any, k: any) => {
          let user_id = row.id != null ? parseInt(row.id) : 0;
          let index = _.findIndex(result, (v) => {
            return v.id == user_id;
          });
          let is_new = index == -1;
          let user: UsersWrapper;

          if (is_new) {
            user = new UsersWrapper();
            user.id = row.id != 0 ? parseInt(row.id) : 0;
            user.first_name =
              row != null && row.first_name != "" ? row.first_name : "";
            user.middle_name =
              row != null && row.middle_name != "" ? row.middle_name : "";
            user.last_name =
              row != null && row.last_name != "" ? row.last_name : "";
            user.mobile_number =
              row != null && row.mobile_number != "" ? row.mobile_number : "";
            user.email = row != null && row.email != "" ? row.email : "";
            user.login = row != null && row.login != "" ? row.login : "";
            user.password =
              row != null && row.password != "" ? row.password : "";
            user.email_as_login_id = row.email_as_login_id;
            if(row.lang_code == row.lang_as_setting) {
              user.lang_code = row.lang_code;
            }
            else user.lang_code = row.lang_as_setting != null ? row.lang_as_setting : "en-GB";
            user.created_on =
              row != null && row.created_on != "" ? row.created_on : "";
            user.modified_on =
              row != null && row.modified_on != "" ? row.modified_on : "";
            (user.is_suspended = row.is_suspended),
              (user.is_active = row.is_active),
              (user.user_type_id =
                row.user_type_id != 0 ? parseInt(row.user_type_id) : 0);
            user.active_directory_dn =
              row != null && row.active_directory_dn != ""
                ? row.active_directory_dn
                : "";
            user.user_image_id =
              row.user_image_id != 0 ? parseInt(row.user_image_id) : 0;
            user.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
            user.roleprofile = [];
          } else {
            user = result[index];
          }

          let roleprofile = new RoleProfilesWrapper();
          roleprofile.id =
            row.roleprofile_id != null ? parseInt(row.roleprofile_id) : 0;
          roleprofile.display_text = row.roleprofile_name;
          if (roleprofile.id > 0) {
            user.roleprofile.push(roleprofile);
          }
          if (is_new) {
            result.push(user);
          } else {
            result[index] = user;
          }
        });
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
    return result;
  }

  public async UserValidation(
    _req: UsersWrapper
  ): Promise<Array<UsersWrapper>> {
    var result: Array<UsersWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.UserValidationTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async UserValidationTransaction(
    db: DB,
    _req: UsersWrapper,
    is_dto: boolean = true
  ): Promise<Array<UsersWrapper>> {
    var result: Array<UsersWrapper> = [];
    try {
      var qb = new this.utils.QueryBuilder(this.sql_get_user_with_params);
      if (_req.id > 0) {
        qb.addParameter("users.id", _req.id, "!=");
      }
      if (_req.email && _req.email.length > 0) {
        qb.addParameter("users.email", _req.email, "=");
      }
      if (_req.login && _req.login.length > 0) {
        let login = _req.login.replace(/'/g, "''");
        qb.addParameter("users.login", login, "=");
      }
      const rows = await db.executeQuery(qb.getQuery());
      if (rows.length > 0) {
        _.forEach(rows, (row: any, k: any) => {
          let user_id = row.id != null ? parseInt(row.id) : 0;
          let index = _.findIndex(result, (v) => {
            return v.id == user_id;
          });
          let is_new = index == -1;
          let user: UsersWrapper;

          if (is_new) {
            user = new UsersWrapper();
            user.id = row.id != 0 ? parseInt(row.id) : 0;
            user.first_name =
              row != null && row.first_name != "" ? row.first_name : "";
            user.middle_name =
              row != null && row.middle_name != "" ? row.middle_name : "";
            user.last_name =
              row != null && row.last_name != "" ? row.last_name : "";
            user.mobile_number =
              row != null && row.mobile_number != "" ? row.mobile_number : "";
            user.email = row != null && row.email != "" ? row.email : "";
            user.login = row != null && row.login != "" ? row.login : "";
            user.password =
              row != null && row.password != "" ? row.password : "";
            user.email_as_login_id = row.email_as_login_id;
            user.created_on =
              row != null && row.created_on != "" ? row.created_on : "";
            user.modified_on =
              row != null && row.modified_on != "" ? row.modified_on : "";
            user.is_suspended = row.is_suspended;
            user.is_active = row.is_active;
            user.user_type_id =
              row.user_type_id != 0 ? parseInt(row.user_type_id) : 0;
            user.active_directory_dn =
              row != null && row.active_directory_dn != ""
                ? row.active_directory_dn
                : "";
            user.user_image_id =
              row.user_image_id != 0 ? parseInt(row.user_image_id) : 0;
            user.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
            user.roleprofile = [];
          } else {
            user = result[index];
          }

          let roleprofile = new RoleProfilesWrapper();
          roleprofile.id =
            row.roleprofile_id != null ? parseInt(row.roleprofile_id) : 0;
          roleprofile.display_text = row.roleprofile_name;
          if (roleprofile.id > 0) {
            user.roleprofile.push(roleprofile);
          }
          if (is_new) {
            result.push(user);
          } else {
            result[index] = user;
          }
        });
      }
    } catch (error) {
      var e = error;
      throw error;
    }
    return result;
  }

  async deleteUserInBulk(
    _req: Array<UsersWrapper>
  ): Promise<Array<UsersWrapper>> {
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _req.length; i < length; i++) {
            const { id } = _req[i];

            var isactive: boolean = true;
            var temp = _req[i].is_active;
            isactive = temp == true ? false : true;
            console.log(temp);
            console.log(isactive);

            const rows = await db.executeQuery(this.sql_delete_user, {
              id,
              is_active: isactive,
            });
            if (rows.length > 0) {
              result.push(_req[i]);
              await this.updateUserSessionForDelete(_req[i])
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }

  async togglesuspendUserInBulk(
    _req: Array<UsersWrapper>
  ): Promise<Array<UsersWrapper>> {
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _req.length; i < length; i++) {
            const { id, is_suspended } = _req[i];
            var issuspend: boolean | null;
            issuspend = !_req[i].is_suspended;
            // issuspend = !_req.is_suspended
            // var temp = _req[i].is_suspended;
            // temp ? (issuspend = false) : (issuspend = true);
            const rows = await db.executeQuery(this.sql_toggle_suspend_user, {
              id,
              issuspend,
            });
            if (rows.length > 0) {
              result.push(_req[i]); 
              await this.updateUserSessionForDelete(_req[i])
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return result;
  }

  async updatePassword(_req: UsersWrapper): Promise<UsersWrapper> {
    try {
      let get_user_req: Users = new Users();
      var secret = _.get(process, "env.SECRET", "secret");
      get_user_req.password = bcrypt.hashSync(_req.password + secret, 10);
      let password1: string = get_user_req.password;

      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();

        var query: string = this.sql_update_password;
        var condition_list: Array<string> = [];
        if (_req.login != "") {
          condition_list.push(`login = '${_req.login}'`);
        }
        if (_req.email != "") {
          condition_list.push(`email = '${_req.email}'`);
        }

        if (condition_list.length > 0) {
          query = query.replace(
            /@condition/g,
            `WHERE ${condition_list.join(" and ")}`
          );
        } else {
          query = query.replace(/@condition/g, "");
        }

        query = query.replace(/@password/g, `'${password1}'`);

        const { id, email } = _req;

        var secret = _.get(process, "env.SECRET", "secret");
        var password = bcrypt.hashSync(_req.password + secret, 10);

        // await db.executeQuery("BEGIN");

        const rows = await db.executeQuery(query, {
          password: password,
          id,
          email,
        });
        // if (rows.length > 0) {
        //   let row = rows[0];
        //   _req.id = row.id != null ? parseInt(row.id) : 0;
        // }

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }

  //   public async select(_req: Users): Promise<Array<Users>> {
  //     var result: Array<Users> = [];
  //     try {
  //       await using(this.db_provider.getDisposableDB(), async (db) => {
  //         await db.connect();
  //         result = await this.selectTransaction(db, _req);
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //     return result;
  //   }

  //   public async selectTransaction(db: DB, _req: Users): Promise<Array<Users>> {
  //     var result: Array<Users> = [];
  //     try {
  //       var query: string = this.sql_select;
  //       var condition_list: Array<string> = [];
  //       if (_req.id > 0) {
  //         condition_list.push(`Users.id = ${_req.id}`);
  //       }
  //       if (condition_list.length > 0) {
  //         query = query.replace(
  //           /@condition/g,
  //           `WHERE ${condition_list.join(" and ")}`
  //         );
  //       } else {
  //         query = query.replace(/@condition/g, "");
  //       }
  //       var rows = await db.executeQuery(query);
  //       if (rows.length > 0) {
  //         _.forEach(rows, (v) => {
  //           var temp: Users = new Users();
  //           temp.id = v.id != 0 ? parseInt(v.id) : 0;
  //           temp.dob = v != null && v.dob.length != 0 ? v.dob : "";
  //           temp.first_name =
  //             v != null && v.first_name.length != 0 ? v.first_name : "";
  //           temp.middle_name =
  //             v != null && v.middle_name.length != 0 ? v.middle_name : "";
  //           temp.last_name =
  //             v != null && v.last_name.length != 0 ? v.last_name : "";
  //           temp.title_id = v.title_id != 0 ? parseInt(v.title_id) : 0;
  //           temp.gender_id = v.gender_id != 0 ? parseInt(v.gender_id) : 0;
  //           temp.user_type_id =
  //             v.user_type_id != 0 ? parseInt(v.user_type_id) : 0;
  //           temp.identifier_type_id =
  //             v.identifier_type_id != 0 ? parseInt(v.identifier_type_id) : 0;
  //           temp.identifier =
  //             v != null && v.identifier.length != 0 ? v.identifier : "";
  //           temp.phone_number =
  //             v != null && v.phone_number.length != 0 ? v.phone_number : "";
  //           temp.mobile_number =
  //             v != null && v.mobile_number.length != 0 ? v.mobile_number : "";
  //           temp.email = v != null && v.email.length != 0 ? v.email : "";
  //           temp.email_as_login_id = v.email_as_login_id;
  //           temp.login = v != null && v.login.length != 0 ? v.login : "";
  //           temp.password = v != null && v.password.length != 0 ? v.password : "";
  //           temp.active_directory_dn =
  //             v != null && v.active_directory_dn.length != 0
  //               ? v.active_directory_dn
  //               : "";
  //           temp.last_password_change = v.last_password_change;
  //           temp.force_password_change = v.force_password_change;
  //           temp.login_attemps =
  //             v.login_attemps != 0 ? parseInt(v.login_attemps) : 0;
  //           temp.user_image_id =
  //             v.user_image_id != 0 ? parseInt(v.user_image_id) : 0;
  //           temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
  //           temp.enterprise_id =
  //             v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
  //           temp.ent_location_id =
  //             v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
  //           temp.lang_code =
  //             v != null && v.lang_code.length != 0 ? v.lang_code : "";
  //           temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
  //           temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
  //           temp.created_on = v.created_on;
  //           temp.modified_on = v.modified_on;
  //           temp.is_active = v.is_active;
  //           temp.is_suspended = v.is_suspended;
  //           temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
  //           temp.is_factory = v.is_factory;
  //           temp.notes = v != null && v.notes.length != 0 ? v.notes : "";
  //           result.push(temp);
  //         });
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //     return result;
  //   }

  public async insertUser(_req: UsersWrapper): Promise<UsersWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          // let get_user_req: Users = new Users();
          // get_user_req.login = _req.login;
          // get_user_req.is_active = null;
          // get_user_req.is_factory = null;
          // get_user_req.is_suspended = null;
          // let user_list: Array<Users> = await this.getUsers(get_user_req);
          // if (user_list.length > 0) {
          //   let error = new ErrorResponse();
          //   error.message = `Login ID '${_req.login}' already exists.`;
          //   throw error;
          // }
          let user = await this.insertUserTransaction(db, _req);
          let appsettingservice = new AppSettingsService();
          let language = await appsettingservice.environmentSettings();
          let request = new SettingsModel();
          if (_req.id > 0) {
            request.user_id = user.id;
            let setting = await appsettingservice.getSettings(request);
            if (setting.id > 0) {
              if (setting.value != null) {
                // setting.value[0].language_identifier = user.lang_code;
                setting.value.forEach((v: SettingsModel.SettingsValue) => {
                  if (v.key == SettingsModel.Settings.LANGUAGECODE) {
                    v.value[0] = user.lang_code;
                  }
                });
                // console.log("la", language.lang_code);
                language.lang_code.forEach((v) => {
                  if (v.code == user.lang_code) {
                    setting.value.forEach((v2: SettingsModel.SettingsValue) => {
                      if (v2.key == SettingsModel.Settings.LANGUAGENAME) {
                        v2.value[0] = v.name;
                      }
                    });
                  }
                });
                setting.value = setting.value.filter(v=>{
                  return v.level == SettingsModel.SettingAccessKey.USER;
                })
                setting.user_id = user.id;
              }
              if (setting.id > 1) {
                await appsettingservice.updatesettings(setting);
              } else {
                if(setting.id == 1) setting.id = 0;
                await appsettingservice.addsettings(setting);
              }
            }
          }
          let UserRoleProfile_service = new UserRoleProfilesService();
          if (_req.roleprofile && _req.roleprofile.length > 0) {
            for (let i = 0; i < _req.roleprofile.length; i++) {
              let item = _req.roleprofile[i];
              let userroleprofile = new UserRoleProfilesWrapper();
              userroleprofile.roleprofile_id = item.id;
              userroleprofile.user_id = _req.id;
              userroleprofile.app_id = _req.app_id;
              await UserRoleProfile_service.insertTransaction(
                db,
                userroleprofile
              );
            }
          }
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (e) {
      let error = e;
      throw error;
    }
    return _req;
  }

  public async insertUserTransaction(
    db: DB,
    _req: UsersWrapper
  ): Promise<UsersWrapper> {
    try {
      let get_user_req: Users = new Users();
      get_user_req.login = _req.login;
      get_user_req.is_active = null;
      get_user_req.is_factory = null;
      get_user_req.is_suspended = null;
      let user_list: Array<Users> = await this.getUsers(get_user_req);
      if (user_list.length > 0) {
        let error = new ErrorResponse();
        error.message = `Login ID '${_req.login}' already exists.`;
        throw error;
      }
      _req.created_on = new Date();
      _req.is_active = true;
      var secret = _.get(process, "env.SECRET", "secret");
      var password_value = bcrypt.hashSync(_req.password + secret, 10);

      switch (this.environment.AUTH_MODE) {
        case Environment.AuthMode.NATIVE:
          _req.user_type_id = UsersWrapper.UserType.NATIVE;
          break;
        case Environment.AuthMode.LDAP:
          _req.user_type_id = UsersWrapper.UserType.LDAP;
          break;

        default:
          break;
      }

      let rows = await db.executeQuery(this.sql_insert_user, {
        dob: _req.dob,
        first_name: _req.first_name,
        middle_name: _req.middle_name,
        last_name: _req.last_name,
        title_id: _req.title_id,
        gender_id: _req.gender_id,
        user_type_id: _req.user_type_id,
        identifier_type_id: _req.identifier_type_id,
        identifier: _req.identifier,
        phone_number: _req.phone_number,
        mobile_number: _req.mobile_number,
        email: _req.email,
        email_as_login_id: _req.email_as_login_id,
        login: _req.login,
        password: password_value,
        active_directory_dn: _req.active_directory_dn,
        last_password_change: _req.last_password_change,
        force_password_change: _req.force_password_change,
        login_attemps: _req.login_attemps,
        user_image_id: _req.user_image_id,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        lang_code: _req.lang_code,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
      });

      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      var e = new ErrorResponse<UsersWrapper>();
      (e.success = false),
        (e.code = error.code),
        (e.error = error.detail),
        (e.message = error.message),
        (e.item = _req),
        (e.exception = error.stack);
      throw e;
    }
    return _req;
  }
  public async updateUser(_req: UsersWrapper): Promise<UsersWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          // let get_user_req: Users = new Users();
          // get_user_req.id = _req.id;
          // // get_user_req.login = _req.login;
          // get_user_req.is_active = null;
          // get_user_req.is_factory = null;
          // get_user_req.is_suspended = null;
          // let user_list: Array<Users> = await this.getUsers(get_user_req);
          // if (user_list[0].login != _req.login) {
          //   let error = new ErrorResponse();
          //   error.message = `LoginID '${_req.login}' already exists.`;
          //   throw error;
          // }
          let user = await this.updateUserTransaction(db, _req);
          let appsettingservice = new AppSettingsService();
          let language = await appsettingservice.environmentSettings();
          let request = new SettingsModel();
          if (user.id > 0) {
            request.user_id = user.id;
            let setting = await appsettingservice.getSettings(request);
            if (setting.value != null) {
              setting.value.forEach((v: SettingsModel.SettingsValue) => {
                if (v.key == SettingsModel.Settings.LANGUAGECODE) {
                  v.value[0] = user.lang_code;
                }
              });
              language.lang_code.forEach((v) => {
                if (v.code == user.lang_code) {
                  setting.value.forEach((v2: SettingsModel.SettingsValue) => {
                    if (v2.key == SettingsModel.Settings.LANGUAGENAME) {
                      v2.value[0] = v.name;
                    }
                  });
                }
              });
              setting.value = setting.value.filter(v=>{
                return v.level == SettingsModel.SettingAccessKey.USER;
              })
              if(setting.is_factory && setting.id == 1 && setting.user_id != user.id) {
                setting.id = 0
                setting.user_id = user.id;
                await appsettingservice.addsettings(setting);
              }
              else {
                setting.user_id = user.id;
                await appsettingservice.updatesettings(setting);
              }
            }
          }
          let UserRoleProfile_service = new UserRoleProfilesService();
          let userroleprofile_delete_req = new UserRoleProfilesWrapper();
          userroleprofile_delete_req.user_id = _req.id;
          await UserRoleProfile_service.deleteTransaction(
            db,
            userroleprofile_delete_req
          );
          if (_req.roleprofile && _req.roleprofile.length > 0) {
            for (let i = 0; i < _req.roleprofile.length; i++) {
              let item = _req.roleprofile[i];
              let userroleprofile = new UserRoleProfilesWrapper();
              userroleprofile.roleprofile_id = item.id;
              userroleprofile.user_id = _req.id;
              userroleprofile.app_id = _req.app_id;
              await UserRoleProfile_service.insertTransaction(
                db,
                userroleprofile
              );
            }
          }
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }

  public async updateUserTransaction(
    db: DB,
    _req: UsersWrapper
  ): Promise<UsersWrapper> {
    try {
      var rows = await db.executeQuery(this.sql_update_user, {
        id: _req.id,
        dob: _req.dob,
        otp: _req.otp,
        first_name: _req.first_name,
        middle_name: _req.middle_name,
        last_name: _req.last_name,
        title_id: _req.title_id,
        gender_id: _req.gender_id,
        user_type_id: _req.user_type_id,
        identifier_type_id: _req.identifier_type_id,
        identifier: _req.identifier,
        phone_number: _req.phone_number,
        mobile_number: _req.mobile_number,
        email: _req.email,
        email_as_login_id: _req.email_as_login_id,
        login: _req.login,
        password: _req.password,
        active_directory_dn: _req.active_directory_dn,
        last_password_change: _req.last_password_change,
        force_password_change: _req.force_password_change,
        login_attemps: _req.login_attemps,
        user_image_id: _req.user_image_id,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        lang_code: _req.lang_code,
        modified_by: _req.modified_by,
        modified_on: new Date(),
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
      });
      // if (rows.length > 0) {
      //   let row = rows[0];
      // _req.id = row.id != null ? parseInt(row.id) : 0;
      // }
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }

  public async updateUserOTPTransaction(
    db: DB,
    _req: UsersWrapper
  ): Promise<UsersWrapper> {
    try {
      var rows = await db.executeQuery(this.sql_updateOTP_user, {
        id: _req.id,
        otp: _req.otp,
        email: _req.email,
        login: _req.login,
      });
      // if (rows.length > 0) {
      //   let row = rows[0];
      // _req.id = row.id != null ? parseInt(row.id) : 0;
      // }
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }
  async updateImage(_req: UsersWrapper): Promise<UsersWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const { id, user_image_id } = _req;
        // await db.executeQuery("BEGIN");

        const rows = await db.executeQuery(this.sql_image_user, {
          id,
          user_image_id,
        });
        if (rows.length > 0) {
          let row = rows[0];
          _req.id = row.id != null ? parseInt(row.id) : 0;
        }

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }

  async getLDAPGroups(ldap_info: any): Promise<Array<any>> {
    // console.log("inside user - Service layer" );
    let result: Array<any> = new Array<any>();
    try {
      await using(new this.utils.Ldap(), async (ldap) => {
        await ldap.init();
        var group_list = await ldap.getEntries({
          filter: this.utils.Ldap.Filters.GROUP,
        });
        result = group_list;
      });
    } catch (error) {
      // throw transaction_error;
      throw error;
    }
    return result;
  }

  async getLDAPUsers(ldap_info: any): Promise<Array<UsersWrapper>> {
    // console.log("inside user - Service layer" );
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(new this.utils.Ldap(), async (ldap) => {
        await ldap.init();
        var user_list = await ldap.getEntries({
          filter: this.utils.Ldap.Filters.USER,
        });
        _.forEach(user_list, (v, k) => {
          var _user = new UsersWrapper();
          _user.id = k;
          _user.first_name = v.displayName as string;
          _user.email = v.userPrincipalName as string;
          _user.login = v.userPrincipalName as string;
          _user.active_directory_dn = v.dn;
          _user.mobile_number = _.get(
            v,
            "mobile",
            _.get(v, "otherMobile", "")
          ) as string;
          result.push(_user);
        });
      });
    } catch (error) {
      // throw transaction_error;
      throw error;
    }
    return result;
  }

  async getLDAPGroupsForLDAPUser(user_info: {
    user_dn: string;
  }): Promise<Array<RoleProfilesWrapper>> {
    // console.log("inside user - Service layer" );
    let result: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    try {
      await using(new this.utils.Ldap(), async (ldap) => {
        await ldap.init();
        var user_dn = _.get(user_info, "user_dn", "");
        var group_list = await ldap.getGroupMembershipForUser({
          dn: user_dn,
        });
        _.forEach(group_list, (v, k) => {
          var _roleprofile = new RoleProfilesWrapper();
          _roleprofile.id = k;
          _roleprofile.name = v.cn as string;
          _roleprofile.dn = v.dn;
          result.push(_roleprofile);
        });
      });
    } catch (error) {
      // throw transaction_error;
      throw error;
    }
    return result;
  }

  async insertUserInBulk(
    _user_list: Array<UsersWrapper>
  ): Promise<Array<UsersWrapper>> {
    let result: Array<UsersWrapper> = new Array<UsersWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _user_list.length; i < length; i++) {
            const {
              dob,
              first_name,
              middle_name,
              last_name,
              title_id,
              gender_id,
              user_type_id,
              identifier_type_id,
              identifier,
              phone_number,
              mobile_number,
              email,
              email_as_login_id,
              login,
              active_directory_dn,
              last_password_change,
              force_password_change,
              login_attemps,
              user_image_id,
              app_id,
              enterprise_id,
              ent_location_id,
              lang_code,
              created_by,
              modified_by,
              created_on,
              modified_on,
              is_active,
              is_suspended,
              parent_id,
              is_factory,
              notes,
            } = _user_list[i];

            var secret = _.get(process, "env.SECRET", "secret");
            var password = bcrypt.hashSync(_user_list[i].password + secret, 10);

            const rows = await db.executeQuery(this.sql_insert_user, [
              dob,
              first_name,
              middle_name,
              last_name,
              title_id,
              gender_id,
              user_type_id,
              identifier_type_id,
              identifier,
              phone_number,
              mobile_number,
              email,
              email_as_login_id,
              login,
              password,
              active_directory_dn,
              last_password_change,
              force_password_change,
              login_attemps,
              user_image_id,
              app_id,
              enterprise_id,
              ent_location_id,
              lang_code,
              created_by,
              modified_by,
              created_on,
              modified_on,
              is_active,
              is_suspended,
              parent_id,
              is_factory,
              notes,
            ]);
            if (rows.length > 0) {
              result.push(new UsersWrapper(rows[0]));
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<UsersWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _user_list,
        exception: error.stack,
      });
    }
    return result;
  }

  //   public async delete(_req: Users): Promise<Users> {
  //     try {
  //       await using(this.db_provider.getDisposableDB(), async (db) => {
  //         await db.connect();
  //         await this.deleteTransaction(db, _req);
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //     return _req;
  //   }
  //   public async deleteTransaction(db: DB, _req: Users): Promise<void> {
  //     try {
  //       _req.modified_on = new Date();

  //       var rows = await db.executeQuery(this.sql_delete, { id: _req.id });
  //       if (rows.length > 0) {
  //         var row = rows[0];
  //         _req.id = row.id != null ? parseInt(row.id) : 0;
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  public async updateRootUserTransaction(
    db: DB,
    _req: UsersWrapper
  ): Promise<UsersWrapper> {
    try {
      var secret = _.get(process, "env.SECRET", "secret");
      var password_value = bcrypt.hashSync(_req.password + secret, 10);
      const { app_id, id, modified_on, password, email, mobile_number } = _req;
      const rows = await db.executeQuery(this.sql_update_rootuser, {
        app_id: app_id,
        id: id,
        modified_on: modified_on,
        password: password_value,
        email: email,
        mobile_number: mobile_number,
      });
      _.forEach(rows, (v1) => {
        _req.id = _.get(v1, "id", 0);
      });
    } catch (transaction_error) {
      // throw transaction_error;
      // let error: any = transaction_error;

      var e = new ErrorResponse<UsersWrapper>();
      e.success = false;
      e.code = _.get(Error, "code", "");
      e.error = _.get(Error, "detail", "");
      e.message = _.get(Error, "message");
      e.item = _req;
      e.exception = _.get(Error, "stack", "");
    }
    return _req;
  }
  public async updateUserSessionForDelete(_req: UsersWrapper) {
    var result: boolean = false;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_updateUserSession,{
          user_id: _req.id
        });
        if(rows.length > 0)  {
          result = true;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
}
