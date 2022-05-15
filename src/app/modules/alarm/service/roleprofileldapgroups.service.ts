import _ from "lodash";
import { DB, using } from "../../global/utils";
import {
  RoleProfileLDAPGroups,
} from "../models/roleprofileldapgroups.model";
import { BaseService } from "./base.service";

export class RoleProfileLDAPGroupsService extends BaseService {
  sql_select: string = `
      SELECT roleprofileldapgroups.id, roleprofileldapgroups.roleprofile_id, roleprofileldapgroups.app_id, roleprofileldapgroups.ldap_groups, roleprofileldapgroups.enterprise_id, roleprofileldapgroups.ent_location_id, roleprofileldapgroups.created_on, roleprofileldapgroups.created_by, roleprofileldapgroups.modified_on, roleprofileldapgroups.modified_by, roleprofileldapgroups.is_active, roleprofileldapgroups.version, roleprofileldapgroups.is_factory
      FROM roleprofileldapgroups 
      @condition;
      `;

  sql_insert: string = `
      INSERT INTO roleprofileldapgroups(roleprofile_id, app_id, ldap_groups, enterprise_id, ent_location_id, created_on, created_by, modified_on, modified_by, is_active, version, is_factory)
      VALUES (@roleprofile_id, @app_id, @ldap_groups, @enterprise_id, @ent_location_id, @created_on, @created_by, @modified_on, @modified_by, @is_active, @version, @is_factory)
      RETURNING *;  
`; 

  sql_update: string = `
      UPDATE roleprofileldapgroups
      SET  roleprofile_id = @roleprofile_id, app_id = @app_id, ldap_groups = @ldap_groups, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, created_on = @created_on, created_by = @created_by, modified_on = @modified_on, modified_by = @modified_by, is_active = @is_active, version = @version, is_factory = @is_factory
      WHERE id = @id
      RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM roleprofileldapgroups
      @condition
      RETURNING *; `;

  public async select(
    _req: RoleProfileLDAPGroups
  ): Promise<Array<RoleProfileLDAPGroups>> {
    var result: Array<RoleProfileLDAPGroups> = [];
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
    _req: RoleProfileLDAPGroups
  ): Promise<Array<RoleProfileLDAPGroups>> {
    var result: Array<RoleProfileLDAPGroups> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`RoleProfileLDAPGroups.id = ${_req.id}`);
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
          var temp: RoleProfileLDAPGroups = new RoleProfileLDAPGroups();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.roleprofile_id =
            v.roleprofile_id != 0 ? parseInt(v.roleprofile_id) : 0;
          temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          temp.ldap_groups =
            v != null && v.ldap_groups.length != 0 ? v.ldap_groups : "";
          temp.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
          temp.created_on = v.created_on;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_on = v.modified_on;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.is_active = v.is_active;
          temp.version = v.version != 0 ? parseInt(v.version) : 0;
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
    _req: RoleProfileLDAPGroups
  ): Promise<RoleProfileLDAPGroups> {
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
    _req: RoleProfileLDAPGroups
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;
      _req.version = 1;

      let rows = await db.executeQuery(this.sql_insert, {
        roleprofile_id: _req.roleprofile_id,
        app_id: _req.app_id,
        ldap_groups: _req.ldap_groups,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        version: _req.version,
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
    _req: RoleProfileLDAPGroups
  ): Promise<RoleProfileLDAPGroups> {
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
    _req: RoleProfileLDAPGroups
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        roleprofile_id: _req.roleprofile_id,
        app_id: _req.app_id,
        ldap_groups: _req.ldap_groups,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        version: _req.version,
        is_factory: _req.is_factory,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
        _req.version = row.version != null ? parseInt(row.version) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async delete(
    _req: RoleProfileLDAPGroups
  ): Promise<RoleProfileLDAPGroups> {
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
    _req: RoleProfileLDAPGroups
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
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
        _req.version = row.version != null ? parseInt(row.version) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
}
