import _ from "lodash";
import { DB, using } from "../../global/utils";
import { UserRoleProfiles } from "../models/userroleprofiles.model";
import { BaseService } from "./base.service";

export class UserRoleProfilesService extends BaseService {
  sql_select: string = `
      SELECT userroleprofiles.id, userroleprofiles.user_id, userroleprofiles.roleprofile_id, userroleprofiles.app_id, userroleprofiles.enterprise_id, userroleprofiles.ent_location_id, userroleprofiles.valid_from, userroleprofiles.valid_to, userroleprofiles.created_by, userroleprofiles.modified_by, userroleprofiles.created_on, userroleprofiles.modified_on, userroleprofiles.is_active, userroleprofiles.lang_code, userroleprofiles.is_suspended, userroleprofiles.parent_id, userroleprofiles.is_factory, userroleprofiles.notes
      FROM userroleprofiles 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO userroleprofiles(user_id, roleprofile_id, app_id, enterprise_id, ent_location_id, valid_from, valid_to, created_by, modified_by, created_on, modified_on, is_active, lang_code, is_suspended, parent_id, is_factory, notes)
VALUES (@user_id, @roleprofile_id, @app_id, @enterprise_id, @ent_location_id, @valid_from, @valid_to, @created_by, @modified_by, @created_on, @modified_on, @is_active, @lang_code, @is_suspended, @parent_id, @is_factory, @notes)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE userroleprofiles
    SET  user_id = @user_id, roleprofile_id = @roleprofile_id, app_id = @app_id, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, valid_from = @valid_from, valid_to = @valid_to, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, lang_code = @lang_code, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM userroleprofiles
   @condition
   RETURNING *; `;

  public async select(
    _req: UserRoleProfiles
  ): Promise<Array<UserRoleProfiles>> {
    var result: Array<UserRoleProfiles> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.selectTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async selectTransaction(
    db: DB,
    _req: UserRoleProfiles
  ): Promise<Array<UserRoleProfiles>> {
    var result: Array<UserRoleProfiles> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`UserRoleProfiles.id = ${_req.id}`);
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
      if (rows.length > 0) {
        _.forEach(rows, (v) => {
          var temp: UserRoleProfiles = new UserRoleProfiles();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.user_id = v.user_id != 0 ? parseInt(v.user_id) : 0;
          temp.roleprofile_id =
            v.roleprofile_id != 0 ? parseInt(v.roleprofile_id) : 0;
          temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          temp.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
          temp.valid_from = v.valid_from;
          temp.valid_to = v.valid_to;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.created_on = v.created_on;
          temp.modified_on = v.modified_on;
          temp.is_active = v.is_active;
          temp.lang_code =
            v != null && v.lang_code.length != 0 ? v.lang_code : "";
          temp.is_suspended = v.is_suspended;
          temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          temp.is_factory = v.is_factory;
          temp.notes = v != null && v.notes.length != 0 ? v.notes : "";
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(_req: UserRoleProfiles): Promise<UserRoleProfiles> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          await this.insertTransaction(db, _req);
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

  public async insertTransaction(
    db: DB,
    _req: UserRoleProfiles
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        user_id: _req.user_id,
        roleprofile_id: _req.roleprofile_id,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        valid_from: _req.valid_from,
        valid_to: _req.valid_to,
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
    } catch (error) {
      throw error;
    }
  }
  public async update(_req: UserRoleProfiles): Promise<UserRoleProfiles> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.updateTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async updateTransaction(
    db: DB,
    _req: UserRoleProfiles
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        user_id: _req.user_id,
        roleprofile_id: _req.roleprofile_id,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        valid_from: _req.valid_from,
        valid_to: _req.valid_to,
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
    } catch (error) {
      throw error;
    }
  }
  public async delete(_req: UserRoleProfiles): Promise<UserRoleProfiles> {
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
  public async deleteTransaction(
    db: DB,
    _req: UserRoleProfiles
  ): Promise<void> {
    try {
      _req.modified_on = new Date();

      let query = this.sql_delete;
      let condition_list = [];
      if (_req.id > 0) {
        condition_list.push(`id = ${_req.id}`);
      }
      if (_req.user_id != null) {
        condition_list.push(`user_id = ${_req.user_id}`);
      }
      if (condition_list.length > 0) {
        query = query.replace(
          "@condition",
          `where ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace("@condition", "");
        return;
      }
      var rows = await db.executeQuery(query);
    } catch (error) {
      throw error;
    }
  }
}
