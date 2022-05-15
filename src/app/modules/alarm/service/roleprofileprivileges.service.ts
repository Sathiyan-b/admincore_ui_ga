import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  RoleProfilePrivileges,
  RoleProfilePrivilegesWrapper,
} from "../models/roleprofileprivileges.model";
import { BaseService } from "./base.service";

export class RoleProfilePrivilegesService extends BaseService {
  sql_select: string = `
  SELECT RoleProfilePrivileges.id, RoleProfilePrivileges.privilege_id, RoleProfilePrivileges.roleprofile_id, RoleProfilePrivileges.created_on, RoleProfilePrivileges.created_by, RoleProfilePrivileges.modified_on, 
  RoleProfilePrivileges.modified_by, RoleProfilePrivileges.is_active, RoleProfilePrivileges.is_factory
  FROM RoleProfilePrivileges
      @condition;
      `;

  sql_insert: string = `
INSERT INTO roleprofileprivileges(app_id, privilege_id, roleprofile_id, created_on, created_by, modified_on, modified_by, is_active, is_factory)
VALUES (@app_id, @privilege_id, @roleprofile_id, @created_on, @created_by, @modified_on, @modified_by, @is_active,@is_factory)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE roleprofileprivileges
    SET  app_id = @app_id, privilege_id = @privilege_id, roleprofile_id = @roleprofile_id, created_on = @created_on, created_by = @created_by, modified_on = @modified_on, modified_by = @modified_by, is_active = @is_active, is_factory = @is_factory
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM roleprofileprivileges
   @condition
   RETURNING *; `;

  public async select(
    _req: RoleProfilePrivileges
  ): Promise<Array<RoleProfilePrivileges>> {
    var result: Array<RoleProfilePrivileges> = [];
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
    _req: RoleProfilePrivileges
  ): Promise<Array<RoleProfilePrivileges>> {
    var result: Array<RoleProfilePrivileges> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`RoleProfilePrivileges.id = ${_req.id}`);
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
          var temp: RoleProfilePrivileges = new RoleProfilePrivileges();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          temp.privilege_id =
            v.privilege_id != 0 ? parseInt(v.privilege_id) : 0;
          temp.roleprofile_id =
            v.roleprofile_id != 0 ? parseInt(v.roleprofile_id) : 0;
          temp.created_on = v.created_on;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_on = v.modified_on;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.is_active = v.is_active;
          temp.is_factory = v.is_factory;
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(
    _req: RoleProfilePrivileges
  ): Promise<RoleProfilePrivileges> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();

        await this.insertTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }

  public async insertTransaction(
    db: DB,
    _req: RoleProfilePrivileges
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        app_id: _req.app_id,
        privilege_id: _req.privilege_id,
        roleprofile_id: _req.roleprofile_id,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        // version: _req.version,
        is_factory: _req.is_factory,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(
    _req: RoleProfilePrivileges
  ): Promise<RoleProfilePrivileges> {
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
    _req: RoleProfilePrivileges
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        app_id: _req.app_id,
        privilege_id: _req.privilege_id,
        roleprofile_id: _req.roleprofile_id,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        // version: _req.version,
        is_factory: _req.is_factory,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
        // _req.version = row.version != null ? parseInt(row.version) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async delete(
    _req: RoleProfilePrivileges
  ): Promise<RoleProfilePrivileges> {
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
    _req: RoleProfilePrivileges
  ): Promise<void> {
    try {
      let query = this.sql_delete;
      let condition_list = [];
      if (_req.id > 0) {
        condition_list.push(`id = ${_req.id}`);
      }
      if (_req.roleprofile_id != null) {
        condition_list.push(`roleprofile_id = ${_req.roleprofile_id}`);
      }
      if (condition_list.length > 0) {
        query = query.replace(
          "@condition",
          `Where ${condition_list.join(" and ")}`
        );
      } else {
        return;
      }
      var rows = await db.executeQuery(query);
    } catch (error) {
      throw error;
    }
  }
}
