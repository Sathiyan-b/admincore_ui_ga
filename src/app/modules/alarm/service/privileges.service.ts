import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  Privileges,
  PrivilegesWrapper,
  PrivilegeAssociationModel,
} from "../models/privileges.model";
import { BaseService } from "./base.service";

export class PrivilegesService extends BaseService {

  sql_insert: string = `INSERT INTO Privileges(identifier, display_text, privilege_group_id, app_id, lang_code, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
  VALUES(@identifier, @display_text, @privilege_group_id, @app_id, @lang_code, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes )
  RETURNING *;
  `
  sql_get_privileges: string = `
      SELECT privileges.id privilege_key, 
	privileges.app_id,
	privileges.display_text, privilege_group_id, 
	privilegegroups.display_text as privilege_group_display_text
	FROM Privileges
	inner join privilegegroups on privilegegroups.id = privileges.privilege_group_id 
	ORDER BY Privileges.id 
      `;

  sql_load_privileges: string = `select privileges.id, privileges.privilege_group_id, privileges.identifier as privilege_key,
  privileges.display_text as display_text ,
        privilegegroups.display_text as privilege_group_display_text 
        from Privileges  inner join privilegegroups on privileges.privilege_group_id=privilegegroups.id order by privilegegroups.display_text`;

  sql_get_privileges_by_id: string = `SELECT id as privilege_key, display_text, privilege_group_id, app_id
from privileges where id = @id ORDER BY privileges.id`;

  sql_get_privileges_by_groupid: string = `SELECT id as privilege_key, display_text, privilege_group_id, app_id
from privileges where privilege_group_id = @privilege_group_id ORDER BY privileges.id`;


  async getPrivileges(): Promise<Array<PrivilegesWrapper>> {
    let result: Array<PrivilegesWrapper> = new Array<PrivilegesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(this.sql_get_privileges);
        _.forEach(rows, (v, k) => {
          // var role_group = JSON.parse(v.permissiongroup);
          // result.push(role_group);
          var privileges = new PrivilegesWrapper();
         privileges.id = v.id != 0 ? parseInt(v.id) : 0; 
	       privileges.app_id = v.app_id != 0 ? parseInt(v.app_id): 0,
	       privileges.display_text = v != null && v.display_text != "" ? v.display_text : "";
         privileges.privilege_group_id = v.privilege_group_id != 0 ? parseInt(v.privilege_group_id): 0,
          result.push(privileges);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<PrivilegesWrapper>({
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

  async getPrivilegeForAssociation(): Promise<
    Array<PrivilegeAssociationModel>
  > {
    let result: Array<PrivilegeAssociationModel> =
      new Array<PrivilegeAssociationModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        //const { id } = req;
        const rows = await db.executeQuery(this.sql_load_privileges);
        _.forEach(rows, (v, k) => {
          var _privileges_association = new PrivilegeAssociationModel();
          _privileges_association.id = v.id != 0 ? parseInt(v.id) : 0;
          _privileges_association.privilege_group_id =  v.privilege_group_id != 0 ? parseInt(v.privilege_group_id) : 0;;
          _privileges_association.privilege_key = v != null && v.privilege_key != "" ? v.privilege_key : "";
          

          _privileges_association.display_text = v != null && v.display_text != "" ? v.display_text : "";
          _privileges_association.privilege_group_display_text = v != null && v.privilege_group_display_text != "" ? v.privilege_group_display_text : "";
          // _privileges_association.display_text;

          result.push(_privileges_association);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<PrivilegesWrapper>({
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

  async getPrivilegeByID(id: bigint): Promise<Array<PrivilegesWrapper>> {
    console.log("inside privilege - Service: Get by ID", id);
    let result: Array<PrivilegesWrapper> = new Array<PrivilegesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        //const { id } = req;
        const rows = await db.executeQuery(this.sql_get_privileges_by_id, [id]);
        _.forEach(rows, (v, k) => {
          var _privileges = new PrivilegesWrapper(v);
          result.push(_privileges);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<PrivilegesWrapper>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: id,
        exception: error.stack,
      });
    }
    return result;
  }

  async getPrivilegesByGroup(
    groupid: bigint
  ): Promise<Array<PrivilegesWrapper>> {
    console.log("inside privilege - Service: Get by Group ID", groupid);
    let result: Array<PrivilegesWrapper> = new Array<PrivilegesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        //const { id } = req;
        const rows = await db.executeQuery(this.sql_get_privileges_by_groupid, {
          groupid,
        });
        _.forEach(rows, (v, k) => {
          var _privileges = new PrivilegesWrapper(v);
          result.push(_privileges);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<PrivilegesWrapper>({
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

  public async insert(_req: Array<PrivilegesWrapper>): Promise<Array<PrivilegesWrapper>> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        try {
          db.beginTransaction();
          await this.insertTransaction(db, _req);
          db.commitTransaction();
        } catch (err) {
          db.rollbackTransaction();
          throw err;
        }
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }

  public async insertTransaction(db: DB, _req: Array<PrivilegesWrapper>): Promise<void> {
    try {
      for (var i = 0, length = _req.length; i < length; i++) {
        var privileges = _req[i];
        privileges.created_on = new Date();
        privileges.is_active = true;

        let rows = await db.executeQuery(this.sql_insert, {
          identifier: privileges.identifier,
          display_text: privileges.display_text,
          privilege_group_id: privileges.privilege_group_id,
          app_id: privileges.app_id,
          lang_code: privileges.lang_code,
          created_by: privileges.created_by,
          modified_by: privileges.modified_by,
          created_on: privileges.created_on,
          modified_on: privileges.modified_on,
          is_active: privileges.is_active,
          is_suspended: privileges.is_suspended,
          parent_id: privileges.parent_id,
          is_factory: privileges.is_factory,
          notes: privileges.notes
        });
        if (rows.length > 0) {
          let row = rows[0];
          privileges.id = row.id != null ? parseInt(row.id) : 0;
        }
      }
    } catch (error) {
      throw error;
    }
  }
}