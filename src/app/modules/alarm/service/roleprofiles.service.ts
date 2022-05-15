import _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DB, using } from "../../global/utils";
import { PrivilegeAssociationModel } from "../models/privileges.model";
import { RoleProfileLDAPGroupsWrapper } from "../models/roleprofileldapgroups.model";
import { RoleProfilePrivileges } from "../models/roleprofileprivileges.model";
import {
  RoleProfiles,
  RoleProfilesWrapper,
} from "../models/roleprofiles.model";
import { BaseService } from "./base.service";
import { RoleProfileLDAPGroupsService } from "./roleprofileldapgroups.service";
import { RoleProfilePrivilegesService } from "./roleprofileprivileges.service";

export class RoleProfilesService extends BaseService {
  sql_get_roleprofiles: string = `
      SELECT roleprofiles.id, roleprofiles.identifier, roleprofiles.purpose, roleprofiles.display_text, roleprofiles.app_id, roleprofiles.enterprise_id, roleprofiles.ent_location_id, roleprofiles.created_by, roleprofiles.modified_by, roleprofiles.created_on, roleprofiles.modified_on, roleprofiles.is_active, roleprofiles.lang_code, roleprofiles.is_suspended, roleprofiles.parent_id, roleprofiles.is_factory, roleprofiles.notes
      FROM roleprofiles 
      `;

  sql_get_roleprofile_by_id: string = `
      SELECT roleprofiles.id,
      roleprofiles.identifier,
      roleprofiles.display_text,
      roleprofiles.purpose,
      roleprofiles.app_id,
      privileges.id privilege_id,
      privileges.display_text privilege_display_text,
      roleprofileldapgroups.ldap_groups,
      roleprofiles.is_active
    from roleprofiles
      left join roleprofileprivileges on roleprofileprivileges.roleprofile_id = roleprofiles.id
      left join privileges on roleprofileprivileges.privilege_id = privileges.id
      left join roleprofileldapgroups on roleprofileldapgroups.roleprofile_id = roleprofiles.id
    WHERE roleprofiles.id = @id; 
`;

  sql_roleprofile_validator: string = `
  SELECT roleprofiles.id,
  roleprofiles.identifier,
  roleprofiles.display_text,
  roleprofiles.purpose,
  roleprofiles.app_id,
  privileges.id privilege_id,
  privileges.display_text privilege_display_text,
  roleprofileldapgroups.ldap_groups,
  roleprofiles.is_active
  from roleprofiles
  left join roleprofileprivileges on roleprofileprivileges.roleprofile_id = roleprofiles.id
  left join privileges on roleprofileprivileges.privilege_id = privileges.id
  left join roleprofileldapgroups on roleprofileldapgroups.roleprofile_id = roleprofiles.id
  @condition`;

  sql_get_roleprofile_for_mapping: string =
    "select roleprofiles.id, roleprofiles.display_text from roleprofiles where roleprofiles.is_active = true order by display_text";

  sql_update_roleprofile: string = `
    UPDATE roleprofiles
    SET  identifier = @identifier, display_text = @display_text, purpose = @purpose, app_id = @app_id, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, modified_by = @modified_by, modified_on = @modified_on, is_active = @is_active, lang_code = @lang_code, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_insert_roleprofile: string = `insert into roleprofiles (
    roleprofiles.identifier,
    roleprofiles.display_text,
    roleprofiles.purpose,
    roleprofiles.app_id,
    roleprofiles.enterprise_id,
    roleprofiles.ent_location_id,
    roleprofiles.created_by,
    roleprofiles.modified_by,
    roleprofiles.created_on,
    roleprofiles.modified_on,
    roleprofiles.is_active,
    roleprofiles.lang_code,
    roleprofiles.is_suspended,
    roleprofiles.parent_id,
    roleprofiles.is_factory,
    roleprofiles.notes
) 
values (@identifier, @display_text, @purpose, @app_id, @enterprise_id, @ent_location_id, @created_by, @modified_by, @created_on, @modified_on, @is_active, @lang_code, @is_suspended, @parent_id, @is_factory, @notes ) RETURNING *`;

  sql_delete_role: string = `update roleprofiles set is_active = @is_active, is_suspended = false
		where id = @id RETURNING *`;

  sql_toggle_suspend_role: string = `update roleprofiles set is_suspended = @is_suspended where id = @id RETURNING *`;

  public async getRoleProfiles(
    _req: RoleProfilesWrapper = new RoleProfilesWrapper()
  ): Promise<Array<RoleProfilesWrapper>> {
    var result: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        var qb = new this.utils.QueryBuilder(this.sql_get_roleprofiles);
        if (_req.is_active != null) {
          qb.addParameter("is_active", _req.is_active, "=");
        }
        if (_req.id != 0) {
          qb.addParameter("id", _req.id, "=");
        }
        if (_req.display_text != "") {
          qb.addParameter("display_text", _req.display_text, "=");
        }
        //const rows = await db.executeQuery(this.sql_get_roleprofiles);
        const rows = await db.executeQuery(qb.getQuery());

        // result = await this.selectTransaction(db, _req);

        _.forEach(rows, (v, k) => {
          var roleprofile = new RoleProfilesWrapper();
          roleprofile.id = v.id != 0 ? parseInt(v.id) : 0;
          roleprofile.identifier =
            v != null && v.identifier != "" ? v.identifier : "";
          roleprofile.display_text =
            v != null && v.display_text != "" ? v.display_text : "";
          roleprofile.purpose = v != null && v.purpose != "" ? v.purpose : "";
          roleprofile.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          roleprofile.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          roleprofile.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
          roleprofile.created_on =
            v != null && v.created_on != "" ? v.created_on : "";
          roleprofile.modified_on =
            v != null && v.modified_on != "" ? v.modified_on : "";
          roleprofile.created_by =
            v.created_by != 0 ? parseInt(v.created_by) : 0;
          roleprofile.modified_by =
            v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          roleprofile.is_active = v.is_active;
          roleprofile.lang_code =
            v != null && v.lang_code != "" ? v.lang_code : "";
          roleprofile.is_suspended = v.is_suspended;
          roleprofile.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          roleprofile.is_factory = v.is_factory;
          roleprofile.notes = v != null && v.notes != "" ? v.notes : "";
          result.push(roleprofile);
        });
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<RoleProfilesWrapper>({
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

  async getRoleProfilebyid(
    _roleprofile: RoleProfilesWrapper
  ): Promise<Array<RoleProfilesWrapper>> {
    let result: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const { id } = _roleprofile;
        const rows = await db.executeQuery(this.sql_get_roleprofile_by_id, {
          id,
        });
        _.forEach(rows, (row, k) => {
          let roleprofileid = row.id != null ? parseInt(row.id) : 0;
          let index = _.findIndex(result, (u) => {
            return u.id == roleprofileid;
          });
          let is_new = index == -1;
          var roleprofile: RoleProfilesWrapper;
          if (is_new) {
            roleprofile = new RoleProfilesWrapper();
            roleprofile.id = row.id != 0 ? parseInt(row.id) : 0;
            roleprofile.identifier =
              row != null && row.identifier != "" ? row.identifier : "";
            roleprofile.purpose =
              row != null && row.purpose != "" ? row.purpose : "";
            roleprofile.display_text =
              row != null && row.display_text != "" ? row.display_text : "";
            roleprofile.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
            roleprofile.is_active = row.is_active;
            roleprofile.privileges = [];
            roleprofile.ldap_config = [];
          } else {
            roleprofile = result[index];
          }
          let privilege = new PrivilegeAssociationModel();
          privilege.id =
            row.privilege_id != null ? parseInt(row.privilege_id) : 0;
          privilege.display_text = row.privilege_display_text;
          // privilege.identifier = row.identifier;
          let privilege_index = _.findIndex(
            roleprofile.privileges,
            (v: any) => {
              return v.id == privilege.id;
            }
          );
          if (privilege_index == -1) {
            roleprofile.privileges.push(privilege);
          }

          let ldapgroup = row.ldap_groups;
          if (ldapgroup) {
            let ldap_index = _.findIndex(roleprofile.ldap_config, (v) => {
              return v == ldapgroup;
            });
            if (ldap_index == -1) {
              roleprofile.ldap_config.push(ldapgroup);
            }
          }

          if (is_new) {
            result.push(roleprofile);
          } else {
            result[index] = roleprofile;
          }
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<RoleProfiles>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _roleprofile,
        exception: error.stack,
      });
    }
    return result;
  }

  async loadRoleProfiles(): Promise<Array<RoleProfilesWrapper>> {
    let result: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(
          this.sql_get_roleprofile_for_mapping
        );
        _.forEach(rows, (v, k) => {
          var _userroleprofile = new RoleProfilesWrapper();
          _userroleprofile.id = v.id != 0 ? parseInt(v.id) : 0;
          _userroleprofile.display_text =
            v != null && v.display_text != "" ? v.display_text : "";
          result.push(_userroleprofile);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<RoleProfilesWrapper>({
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

  //   public async selectTransaction(
  //        db: DB,
  //       _req: RoleProfiles,
  //     ): Promise<Array<RoleProfiles>> {
  //       var result: Array<RoleProfiles> = [];
  //       try {
  //         var query: string = this.sql_select;
  //         var condition_list: Array<string> = [];
  //         if (_req.id > 0) {
  //           condition_list.push(`RoleProfiles.id = ${_req.id}`);
  //         }
  //         if (condition_list.length > 0) {
  //           query = query.replace(
  //             /@condition/g,
  //             `WHERE ${condition_list.join(" and ")}`
  //           );
  //         } else {
  //           query = query.replace(/@condition/g, "");
  //         }
  //         var rows  = await db.executeQuery(query);
  //         if (rows.length > 0) {
  //           _.forEach(rows, (v) => {
  //             var temp: RoleProfiles = new RoleProfiles();
  //            temp.id = v.id != 0 ? parseInt(v.id) : 0;
  // temp.identifier = (v != null && v.identifier.length != 0)? v.identifier: ""
  // temp.display_text = (v != null && v.display_text.length != 0)? v.display_text: ""
  // temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
  // temp.enterprise_id = v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
  // temp.ent_location_id = v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
  // temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
  // temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
  // temp.created_on = v.created_on;
  // temp.modified_on = v.modified_on;
  // temp.is_active = v.is_active;
  // temp.lang_code = (v != null && v.lang_code.length != 0)? v.lang_code: ""
  // temp.is_suspended = v.is_suspended;
  // temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
  // temp.is_factory = v.is_factory;
  // temp.notes = (v != null && v.notes.length != 0)? v.notes: ""
  //             result.push(temp);
  //           });
  //         }
  //       } catch (error) {
  //         throw error;
  //       }
  //       return result;
  //     }

  public async insertRoleProfile(
    _req: RoleProfilesWrapper
  ): Promise<RoleProfilesWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          let get_role_req: RoleProfilesWrapper = new RoleProfilesWrapper();
          get_role_req.display_text = _req.display_text;
          get_role_req.is_active = null;
          get_role_req.is_factory = null;
          get_role_req.is_suspended = null;
          let user_list: Array<RoleProfilesWrapper> =
            await this.getRoleProfiles(get_role_req);
          if (user_list.length > 0) {
            let error = new ErrorResponse();
            error.message = `Role name '${_req.display_text}' already exists.`;
            throw error;
          }
          await this.insertRoleProfileTransaction(db, _req);
          let roleprofileprivileges_service =
            new RoleProfilePrivilegesService();
          if (_req.privileges && _req.privileges.length > 0) {
            for (let i = 0; i < _req.privileges.length; i++) {
              let item = _req.privileges[i];
              let roleprofileprivileges_req = new RoleProfilePrivileges();
              roleprofileprivileges_req.roleprofile_id = _req.id;
              roleprofileprivileges_req.privilege_id = item.id;
              roleprofileprivileges_req.app_id = _req.app_id;
              await roleprofileprivileges_service.insertTransaction(
                db,
                roleprofileprivileges_req
              );
            }
          }
          let RoleProfileLdapGroups_service =
            new RoleProfileLDAPGroupsService();
          if (_req.ldap_config && _req.ldap_config.length > 0) {
            for (let i = 0; i < _req.ldap_config.length; i++) {
              let item = _req.ldap_config[i];
              let RoleProfileLdapGroups_req =
                new RoleProfileLDAPGroupsWrapper();
              RoleProfileLdapGroups_req.roleprofile_id = _req.id;
              RoleProfileLdapGroups_req.ldap_groups = item;
              RoleProfileLdapGroups_req.app_id = _req.app_id;
              await RoleProfileLdapGroups_service.insertTransaction(
                db,
                RoleProfileLdapGroups_req
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

  public async insertRoleProfileTransaction(
    db: DB,
    _req: RoleProfilesWrapper
  ): Promise<RoleProfilesWrapper> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert_roleprofile, {
        identifier: _req.identifier,
        display_text: _req.display_text,
        purpose: _req.purpose,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        lang_code: _req.lang_code,
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
      let error: any = transaction_error;
      // throw transaction_error;
      var e = new ErrorResponse<RoleProfiles>();
      e.success = false;
      e.code = error.code;
      e.error = error.detail;
      e.message = error.message;
      e.item = _req;
      e.exception = error.stack;
      throw e;
    }
    return _req;
  }

  public async updateRoleProfile(
    _req: RoleProfilesWrapper
  ): Promise<RoleProfilesWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          // let get_role_req: RoleProfilesWrapper = new RoleProfilesWrapper();
          // get_role_req.id = _req.id;
          // get_role_req.is_active = null;
          // get_role_req.is_factory = null;
          // get_role_req.is_suspended = null;
          // let user_list: Array<RoleProfilesWrapper> =
          //   await this.getRoleProfiles(get_role_req);
          // if (user_list[0].display_text != _req.display_text) {
          //   let error = new ErrorResponse();
          //   error.message = `Role name '${user_list[0].display_text}' already exists.`;
          //   throw error;
          // }
          await this.updateRoleProfileTransaction(db, _req);
          let roleprofileprivileges_service =
            new RoleProfilePrivilegesService();
          let roleprofileprivileges_delete_req = new RoleProfilePrivileges();
          roleprofileprivileges_delete_req.roleprofile_id = _req.id;
          await roleprofileprivileges_service.deleteTransaction(
            db,
            roleprofileprivileges_delete_req
          );
          if (_req.privileges && _req.privileges.length > 0) {
            for (let i = 0; i < _req.privileges.length; i++) {
              let item = _req.privileges[i];
              let roleprofileprivileges_req = new RoleProfilePrivileges();
              roleprofileprivileges_req.roleprofile_id = _req.id;
              roleprofileprivileges_req.privilege_id = item.id;
              roleprofileprivileges_req.app_id = _req.app_id;
              await roleprofileprivileges_service.insertTransaction(
                db,
                roleprofileprivileges_req
              );
            }
          }
          let roleprofileldapgroups_service =
            new RoleProfileLDAPGroupsService();
          let roleprofileldapgroups_delete_req =
            new RoleProfileLDAPGroupsWrapper();
          roleprofileldapgroups_delete_req.roleprofile_id = _req.id;
          await roleprofileldapgroups_service.delete(
            roleprofileldapgroups_delete_req
          );
          if (_req.ldap_config && _req.ldap_config.length > 0) {
            for (let i = 0; i < _req.ldap_config.length; i++) {
              let item = _req.ldap_config[i];
              let roleprofileldapgroups_req =
                new RoleProfileLDAPGroupsWrapper();
              roleprofileldapgroups_req.roleprofile_id = _req.id;
              roleprofileldapgroups_req.ldap_groups = item;
              roleprofileldapgroups_req.app_id = _req.app_id;
              await roleprofileldapgroups_service.insertTransaction(
                db,
                roleprofileldapgroups_req
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
  public async updateRoleProfileTransaction(
    db: DB,
    _req: RoleProfiles
  ): Promise<RoleProfiles> {
    try {
      var rows = await db.executeQuery(this.sql_update_roleprofile, {
        id: _req.id,
        identifier: _req.identifier,
        display_text: _req.display_text,
        purpose: _req.purpose,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        modified_by: _req.modified_by,
        modified_on: new Date(),
        is_active: _req.is_active,
        lang_code: _req.lang_code,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
      });
      // if (rows.length > 0) {
      //   let row = rows[0];
      //   _req.id = row.id != null ? parseInt(row.id) : 0;
      // }
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<RoleProfilesWrapper>({
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

  //     public async delete(_req: RoleProfiles): Promise<RoleProfiles> {
  //   try {
  //     await using(this.db_provider.getDisposableDB(), async (db) => {
  //         await db.connect();
  //         await this.deleteTransaction(db, _req);

  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  //   return _req;
  // }
  //     public async deleteTransaction(
  //     db: DB,
  //     _req: RoleProfiles
  //   ): Promise<void> {
  //     try {
  //       _req.modified_on = new Date();

  //       var rows  = await db.executeQuery(this.sql_delete,
  //       { id:_req.id, }
  //       );
  //       if (rows.length > 0) {
  //         var row = rows[0];
  //         _req.id = row.id != null ? parseInt(row.id) : 0;
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  async deleteRoleProfileInBulk(
    _req: Array<RoleProfilesWrapper>
  ): Promise<Array<RoleProfilesWrapper>> {
    let result: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _req.length; i < length; i++) {
            const { id } = _req[i];
            //

            var isactive: boolean = true;
            var temp = _req[i].is_active;
            isactive = temp == true ? false : true;
            console.log(temp);
            console.log(isactive);

            //
            //is_active = false;
            const rows = await db.executeQuery(this.sql_delete_role, {
              id,
              is_active: isactive,
            });
            if (rows.length > 0) {
              result.push(_req[i]);
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<RoleProfilesWrapper>({
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
  async togglesuspendRoleInBulk(
    _roleprofile_list: Array<RoleProfilesWrapper>
  ): Promise<Array<RoleProfilesWrapper>> {
    let result: Array<RoleProfilesWrapper> = new Array<RoleProfilesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _roleprofile_list.length; i < length; i++) {
            const { id, is_suspended } = _roleprofile_list[i];
            //
            var issuspend: boolean = true;
            var temp = _roleprofile_list[i].is_suspended;
            temp ? (issuspend = false) : (issuspend = true);
            //
            const rows = await db.executeQuery(this.sql_toggle_suspend_role, {
              id,
              issuspend,
            });
            if (rows.length > 0) {
              var _req = new RoleProfilesWrapper();
              _req.id = id;
              result.push(_req);
            }
          }

          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<RoleProfilesWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _roleprofile_list,
        exception: error.stack,
      });
    }
    return result;
  }
  public async RoleProfileValidation(
    _req: RoleProfilesWrapper
  ): Promise<Array<RoleProfilesWrapper>> {
    var result: Array<RoleProfilesWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.RoleProfileValidationTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async RoleProfileValidationTransaction(
    db: DB,
    _req: RoleProfilesWrapper,
    is_dto: boolean = true
  ): Promise<Array<RoleProfilesWrapper>> {
    var result: Array<RoleProfilesWrapper> = [];
    try {
      var query: string = this.sql_roleprofile_validator;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`roleprofiles.id != ${_req.id}`);
      }
      if (_req.display_text && _req.display_text.length > 0) {
        condition_list.push(
          `roleprofiles.display_text = '${_req.display_text}'`
        );
      }
      if (condition_list.length > 0) {
        query = query.replace(
          /@condition/g,
          `WHERE ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace(/@condition/g, "");
      }
      var rows = await db.executeQuery(query);
      _.forEach(rows, (row, k) => {
        let roleprofileid = row.id != null ? parseInt(row.id) : 0;
        let index = _.findIndex(result, (u) => {
          return u.id == roleprofileid;
        });
        let is_new = index == -1;
        var roleprofile: RoleProfilesWrapper;
        if (is_new) {
          roleprofile = new RoleProfilesWrapper();
          roleprofile.id = row.id != 0 ? parseInt(row.id) : 0;
          roleprofile.identifier =
            row != null && row.identifier != "" ? row.identifier : "";
          roleprofile.purpose =
            row != null && row.purpose != "" ? row.purpose : "";
          roleprofile.display_text =
            row != null && row.display_text != "" ? row.display_text : "";
          roleprofile.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
          roleprofile.is_active = row.is_active;
          roleprofile.privileges = [];
          roleprofile.ldap_config = [];
        } else {
          roleprofile = result[index];
        }
        let privilege = new PrivilegeAssociationModel();
        privilege.id =
          row.privilege_id != null ? parseInt(row.privilege_id) : 0;
        privilege.display_text = row.privilege_display_text;
        let privilege_index = _.findIndex(roleprofile.privileges, (v: any) => {
          return v.id == privilege.id;
        });
        if (privilege_index == -1) {
          roleprofile.privileges.push(privilege);
        }

        let ldapgroup = row.ldap_groups;
        if (ldapgroup) {
          let ldap_index = _.findIndex(roleprofile.ldap_config, (v) => {
            return v == ldapgroup;
          });
          if (ldap_index == -1) {
            roleprofile.ldap_config.push(ldapgroup);
          }
        }

        if (is_new) {
          result.push(roleprofile);
        } else {
          result[index] = roleprofile;
        }
      });
    } catch (error) {
      var e = error;
      throw error;
    }
    return result;
  }
}
