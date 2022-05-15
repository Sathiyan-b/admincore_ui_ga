import _ from "lodash";
import { DB, using } from "../../global/utils";
import { UUID } from "../../global/utils/uuid";
import { Application, ApplicationWrapper } from "../models/application.model";
import { UsersWrapper } from "../models/users.model";
import { BaseService } from "./base.service";
import { UsersService } from "./users.service";
import {
  RoleProfilesWrapper,
} from "../models/roleprofiles.model";
import { RoleProfilesService } from "./roleprofiles.service";
import {
  PrivilegeAssociationModel,
  PrivilegesWrapper,
} from "../models/privileges.model";
import { PrivilegesService } from "./privileges.service";
import { RoleProfilePrivilegesWrapper } from "../models/roleprofileprivileges.model";
import { RoleProfilePrivilegesService } from "./roleprofileprivileges.service";
import { UserRoleProfilesWrapper } from "../models/userroleprofiles.model";
import { UserRoleProfilesService } from "./userroleprofiles.service";

export class ApplicationService extends BaseService {
  sql_select: string = `
  SELECT a.id, a.app_type_id, a.auth_type_id, a.identifier, a.display_text, a.email, a.mobile_number, a.purpose, a.is_licensed, a.license_key,
  a.license_info, a.app_logo_id, a.lang_code, a.enterprise_id, a.ent_location_id, a.created_by, a.modified_by, a.created_on,
  a.modified_on, a.is_active, a.is_suspended, a.parent_id , a.is_factory , a.notes,
  a.success_callback, a.failure_callback,a.root_userid,u.login,
  rt.identifier security_mode_display_text, a.ad_url, a.ad_baseDN, a.ad_username, a.ad_password, u.login as root_username
  FROM RegdApplications a left join ReferenceValues rt on rt.id=a.auth_type_id
  left join Users u on a.root_userid=u.id
  @condition;
  `;

  sql_appkey_check: string = `select id from RegdApplications where app_key = @app_key`;

  sql_insert: string = `
  INSERT INTO RegdApplications(
  app_type_id,
  identifier,
  display_text,
  email,
  mobile_number,
  purpose,
  is_licensed,
  license_key,
  failure_callback,
  license_info,
  app_logo_id,
  lang_code,
  enterprise_id,
  ent_location_id,
	created_by,
	modified_by,
	created_on,
	modified_on,
	is_active,
	is_suspended,
	parent_id,
	is_factory,
	notes,
  auth_type_id,
  success_callback,
  app_key
  )
  VALUES (
    @app_type_id, 
    @identifier, 
    @display_text, 
    @email,
    @mobile_number,
    @purpose, 
    @is_licensed, 
    @license_key, 
    @failure_callback, 
    @license_info, 
    @app_logo_id, 
    @lang_code, 
    @enterprise_id, 
    @ent_location_id,
    @created_by, 
    @modified_by, 
    @created_on, 
    @modified_on, 
    @is_active, 
    @is_suspended, 
    @parent_id, 
    @is_factory, 
    @notes,
    @auth_type_id,
    @success_callback,
    @app_key)
  returning *;  
  `;

  sql_update: string = `
  UPDATE RegdApplications
  SET   
  app_type_id = @app_type_id,
  identifier = @identifier,
  display_text = @display_text,
  email = @email,
  mobile_number = @mobile_number,
  purpose = @purpose,
  is_licensed = @is_licensed,
  license_key = @license_key,
  failure_callback = @failure_callback,
  license_info = @license_info,
  app_logo_id = @app_logo_id,
  lang_code = @lang_code,
  enterprise_id = @enterprise_id,
  ent_location_id = @ent_location_id,
  created_by = @created_by,
  modified_by = @modified_by,
  created_on = @created_on,
  modified_on = @modified_on,
  is_active = @is_active,
  is_suspended = @is_suspended,
  parent_id = @parent_id,
  is_factory = @is_factory,
  notes = @notes,
  auth_type_id = @auth_type_id,
  success_callback = @success_callback,
  root_userid = @root_userid,
  ad_url = @ad_url,
  ad_baseDN = @ad_baseDN,
  ad_username = @ad_username,
  ad_password = @ad_password
  WHERE id = @id
  RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM RegdApplications
   WHERE id = @id
   RETURNING *; `;

  sql_update_appkey: string = `update RegdApplications set app_key = @app_key where id = @id`;

  public async genarateAppKey(_req: Application): Promise<Array<Application>> {
    var result: Array<Application> = [];
    try {
      _req.app_key = new UUID().getUniqueID();
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var rows = await db.executeQuery(this.sql_update_appkey, {
          id: _req.id,
          app_key: _req.app_key,
        });
      });
      result.push(_req);
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async select(
    _req: ApplicationWrapper,
    is_dto: boolean = true
  ): Promise<Array<ApplicationWrapper>> {
    var result: Array<ApplicationWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.selectTransaction(db, _req, is_dto);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async selectTransaction(
    db: DB,
    _req: ApplicationWrapper,
    is_dto: boolean = true
  ): Promise<Array<ApplicationWrapper>> {
    var result: Array<ApplicationWrapper> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`a.id = ${_req.id}`);
      }
      if (_req.display_text && _req.display_text.length > 0) {
        condition_list.push(`a.display_text = '${_req.display_text}'`);
      }
      if (_req.license_key && _req.license_key.length > 0) {
        condition_list.push(`a.license_key = '${_req.license_key}'`);
      }
      if (_req.app_key && _req.app_key.length > 0) {
        condition_list.push(`a.app_key = '${_req.app_key}'`);
      }

      if (condition_list.length > 0) {
        query = query.replace(
          /@condition/g,
          `WHERE ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace(/@condition/g, "");
      }
      // var qb = new this.utils.QueryBuilder(this.sql_select);
      // if (_req.display_text != "") {
      //   qb.addParameter("display_text", _req.display_text, "=");
      // }
      var rows = await db.executeQuery(query);
      if (rows.length > 0) {
        _.forEach(rows, (v) => {
          var temp: ApplicationWrapper = new ApplicationWrapper();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.app_type_id = v.app_type_id != 0 ? parseInt(v.app_type_id) : 0;
          temp.auth_type_id =
            v.auth_type_id != 0 ? parseInt(v.auth_type_id) : 0;
          temp.identifier = v != null && v.identifier != "" ? v.identifier : "";
          temp.display_text =
            v != null && v.display_text != "" ? v.display_text : "";
          temp.email = v != null && v.email != "" ? v.email : "";
          temp.mobile_number =
            v != null && v.mobile_number != "" ? v.mobile_number : "";

          temp.purpose = v != null && v.purpose != "" ? v.purpose : "";
          temp.is_licensed = v.is_licensed;
          temp.license_key =
            v != null && v.license_key != "" ? v.license_key : "";
          temp.license_info =
            v != null && v.license_info != "" ? v.license_info : "";
          temp.app_logo_id = v.app_logo_id != 0 ? parseInt(v.app_logo_id) : 0;
          temp.lang_code = v != null && v.lang_code != "" ? v.lang_code : "";
          temp.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.created_on = v.created_on;
          temp.modified_on = v.modified_on;
          temp.is_active = v.is_active;
          temp.is_suspended = v.is_suspended;
          temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          temp.is_factory = v.is_factory;
          temp.notes = v != null && v.notes != "" ? v.notes : "";
          temp.success_callback =
            v != null && v.success_callback != "" ? v.success_callback : "";
          temp.failure_callback =
            v != null && v.failure_callback != "" ? v.failure_callback : "";
          temp.security_mode_display_text =
            v != null && v.security_mode_display_text != ""
              ? v.security_mode_display_text
              : "";
          temp.ad_baseDN = v != null && v.ad_baseDN != "" ? v.ad_baseDN : "";
          temp.ad_url = v != null && v.ad_url != "" ? v.ad_url : "";
          temp.ad_username =
            v != null && v.ad_username != "" ? v.ad_username : "";
          temp.ad_password =
            v != null && v.ad_password != "" ? v.ad_password : "";
          temp.root_userid = v.root_userid != 0 ? parseInt(v.root_userid) : 0;
          temp.root_username = v != null && v.login != "" ? v.login : "";

          if (is_dto) {
            this.getDTO(temp);
          }
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async verifyApplicationByKey(_req: string): Promise<Application> {
    var result: Application = new Application();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var query: string = this.sql_appkey_check;
        var rows = await db.executeQuery(query, { app_key: _req });
        if (rows.length != 0) {
          result = rows[0];
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(_req: Application): Promise<Application> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // let get_app_req: ApplicationWrapper = new ApplicationWrapper();
        // get_app_req.display_text = _req.display_text;
        // get_app_req.is_active = null;
        // get_app_req.is_factory = null;
        // get_app_req.is_suspended = null;
        // let app_list: Array<ApplicationWrapper> = await this.select(get_app_req);
        // if (app_list.length > 0) {
        //   let error = new ErrorResponse();
        //   error.message = `Application name '${_req.display_text}' already exists.`;
        //   throw error;
        // }
        var user_service: UsersService = new UsersService();
        var role_profile: RoleProfilesService = new RoleProfilesService();
        var privilege_service: PrivilegesService = new PrivilegesService();
        var roleprofile_privilege_service: RoleProfilePrivilegesService =
          new RoleProfilePrivilegesService();
        var user_role_profile: UserRoleProfilesService =
          new UserRoleProfilesService();
        try {
          await db.beginTransaction();
          // _req.identifier = _req.display_text
          //   .toUpperCase()
          //   .split(" ")
          //   .join("_");
          await this.insertTransaction(_req, db);

          var req = new UsersWrapper();
          req.app_id = _req.id;
          req.login = _req.root_username;
          req.password = _req.root_password;
          req.first_name = _req.display_text;
          req.email = _req.email;
          req.mobile_number = _req.mobile_number;
          req.is_factory = true;

          var user: UsersWrapper = await user_service.insertUserTransaction(
            db,
            req
          );
          _req.root_userid = user.id;

          await this.updateTransaction(db, _req);

          // var _previlege = new PrivilegesWrapper();
          // _previlege.app_id = user.app_id;
          // _previlege.privilege_group_display_text = _req.display_text;

          // let privilege: Array<PrivilegesWrapper> = await privilege_service.getPrivileges()
          var privileage_list: Array<PrivilegesWrapper> = [];
          var _privilege_insert = new PrivilegesWrapper();
          _privilege_insert.id = this.environment.ID;
          _privilege_insert.identifier = this.environment.IDENTIFIER;
          _privilege_insert.display_text = this.environment.DISPLAYTEXT;
          _privilege_insert.app_id = user.app_id;
          _privilege_insert.is_active = this.environment.ISACTIVE;
          privileage_list.push(_privilege_insert);

          await privilege_service.insertTransaction(db, privileage_list);

          var _roleprofile = new RoleProfilesWrapper();
          _roleprofile.display_text = _req.root_user_role;
          // _roleprofile.identifier = _req.display_text.toUpperCase().split(_).join()
          _roleprofile.app_id = _req.id;
          _roleprofile.is_factory = true;
          let temp = new PrivilegeAssociationModel();
          temp.privilege_group_display_text = "General Group";
          temp.display_text = "CAN_MANAGE_ALL";
          temp.id = 19;
          temp.privilege_key = "CAN_MANAGE_ALL";
          temp.privilege_group_id = 1;
          _roleprofile.privileges = [temp];

          var role: RoleProfilesWrapper =
            await role_profile.insertRoleProfileTransaction(db, _roleprofile);

          var _roleprofileprivileges = new RoleProfilePrivilegesWrapper();
          _roleprofileprivileges.app_id = _req.id;
          _roleprofileprivileges.privilege_id = 18;
          _roleprofileprivileges.is_factory = true;
          _roleprofileprivileges.roleprofile_id = role.id;

          await roleprofile_privilege_service.insertTransaction(
            db,
            _roleprofileprivileges
          );

          var _userroleprofile = new UserRoleProfilesWrapper();
          _userroleprofile.user_id = user.id;
          _userroleprofile.roleprofile_id = role.id;
          _userroleprofile.app_id = user.app_id;
          _userroleprofile.is_factory = true;

          var user_roleprofile = await user_role_profile.insertTransaction(
            db,
            _userroleprofile
          );

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

  public async insertTransaction(_req: Application, db: DB): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;
      _req.license_key = new UUID().getUniqueID();
      _req.app_key = new UUID().getUniqueID();

      let resp = await db.executeQuery(this.sql_insert, {
        app_type_id: _req.app_type_id,
        identifier: _req.identifier,
        display_text: _req.display_text,
        email: _req.email,
        mobile_number: _req.mobile_number,
        purpose: _req.purpose,
        is_licensed: _req.is_licensed,
        license_key: _req.license_key,
        failure_callback: _req.failure_callback,
        license_info: _req.license_info,
        app_logo_id: _req.app_logo_id,
        lang_code: _req.lang_code,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
        auth_type_id: _req.auth_type_id,
        success_callback: _req.success_callback,
        app_key: _req.app_key,
      });
      if (resp.length > 0) {
        let row = resp[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }

  public async update(_req: Application): Promise<Application> {
    try {
      var user_service: UsersService = new UsersService();
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // let get_app_req: ApplicationWrapper = new ApplicationWrapper();
        // get_app_req.display_text = _req.display_text;
        // get_app_req.is_active = null;
        // get_app_req.is_factory = null;
        // get_app_req.is_suspended = null;
        // let app_list: Array<ApplicationWrapper> = await this.select(get_app_req);
        // if (app_list.length > 0) {
        //   let error = new ErrorResponse();
        //   error.message = `Application name '${_req.display_text}' already exists.`;
        //   throw error;
        // }
        await this.updateTransaction(db, _req);
        if (_req.is_root_changed && _req.root_password.length > 0) {
          let _req_user = new UsersWrapper();
          _req_user.app_id = _req.id;
          _req_user.id = _req.root_userid;
          _req_user.password = _req.root_password;
          _req_user.email = _req.email;
          _req_user.mobile_number = _req.mobile_number;
          // _req_user.force_password_change = _req.is_root_changed;
          await user_service.updateRootUserTransaction(db, _req_user);
        }
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async updateTransaction(db: DB, _req: Application): Promise<void> {
    try {
      _req.modified_on = new Date();
      _req.license_key = new UUID().getUniqueID();

      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        app_type_id: _req.app_type_id,
        identifier: _req.identifier,
        display_text: _req.display_text,
        email: _req.email,
        mobile_number: _req.mobile_number,
        purpose: _req.purpose,
        is_licensed: _req.is_licensed,
        license_key: _req.license_key,
        failure_callback: _req.failure_callback,
        license_info: _req.license_info,
        app_logo_id: _req.app_logo_id,
        lang_code: _req.lang_code,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
        auth_type_id: _req.auth_type_id,
        success_callback: _req.success_callback,
        root_userid: _req.root_userid,
        ad_url: _req.ad_url,
        ad_baseDN: _req.ad_baseDN,
        ad_username: _req.ad_username,
        ad_password: _req.ad_password,
      });
      // if (rows.length > 0) {
      //   var row = rows[0];
      //   _req.id = row.id != null ? parseInt(row.id) : 0;
      //   _req.version = row.version + 1;
      // }
    } catch (error) {
      throw error;
    }
  }

  public async delete(_req: Application): Promise<Application> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.deleteTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async deleteTransaction(db: DB, _req: Application): Promise<void> {
    try {
      _req.modified_on = new Date();

      var rows = await db.executeQuery(this.sql_delete, { id: _req.id });
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  getDTO(_req: ApplicationWrapper) {
    _req.license_key = null;
  }

  // public async verifyApplicationByKey(_req: string): Promise<Application> {
  //   var result: Application = new Application();
  //   try {
  //     await using(this.db_provider.getDisposableDB(), async (db) => {
  //       await db.connect();
  //       var query: string = this.sql_appkey_check;
  //       var rows = await db.executeQuery(query,{app_key:_req});
  //       if (rows.length != 0) {
  //         result = rows[0];
  //       }
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  //   return result;
  // }
}
