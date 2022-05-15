import _ from "lodash";
import { DB, using } from "../../global/utils";
import { TeamMembers } from "../models/teammembers.model";
import { BaseService } from "./base.service";

export class TeamMembersService extends BaseService {
  sql_select: string = `
      SELECT teammembers.id, teammembers.userteam_id, teammembers.member_id, teammembers.valid_from, teammembers.valid_to, teammembers.can_accept_reject, teammembers.created_on, teammembers.created_by, teammembers.modified_on, teammembers.modified_by, teammembers.is_active, teammembers.version, teammembers.is_factory, teammembers.app_id, teammembers.member_action_id
      FROM teammembers 
      @condition;
      `;

  sql_insert: string = `
  INSERT INTO TeamMembers(team_id, member_id, valid_from, valid_to, created_on, created_by, modified_on, modified_by, is_active, is_factory, app_id, member_action_id)
  VALUES (@team_id, @member_id, @valid_from, @valid_to, @created_on, @created_by, @modified_on, @modified_by, @is_active, @is_factory, @app_id, @member_action_id)
  RETURNING *; 
`;

  sql_update: string = `
    UPDATE teammembers
    SET  userteam_id = @userteam_id, member_id = @member_id, valid_from = @valid_from, valid_to = @valid_to, can_accept_reject = @can_accept_reject, created_on = @created_on, created_by = @created_by, modified_on = @modified_on, modified_by = @modified_by, is_active = @is_active, version = @version, is_factory = @is_factory, app_id = @app_id, member_action_id = @member_action_id
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM teammembers
  @condition
   RETURNING *; `;

  public async select(_req: TeamMembers): Promise<Array<TeamMembers>> {
    var result: Array<TeamMembers> = [];
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
    _req: TeamMembers
  ): Promise<Array<TeamMembers>> {
    var result: Array<TeamMembers> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`TeamMembers.id = ${_req.id}`);
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
          var temp: TeamMembers = new TeamMembers();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.team_id = v.team_id != 0 ? parseInt(v.team_id) : 0;
          temp.member_id = v.member_id != 0 ? parseInt(v.member_id) : 0;
          temp.valid_from =
            v != null && v.valid_from.length != 0 ? v.valid_from : "";
          temp.valid_to = v.valid_to != 0 ? parseInt(v.valid_to) : 0;
          temp.can_accept_reject = v.can_accept_reject;
          temp.created_on = v.created_on;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_on = v.modified_on;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.is_active = v.is_active;
          temp.version = v.version != 0 ? parseInt(v.version) : 0;
          temp.is_factory = v.is_factory;
          temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(_req: TeamMembers): Promise<TeamMembers> {
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

  public async insertTransaction(db: DB, _req: TeamMembers): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;
      _req.version = 1;

      let rows = await db.executeQuery(this.sql_insert, {
        team_id: _req.team_id,
        member_id: _req.member_id,
        valid_from: _req.valid_from,
        valid_to: _req.valid_to,
        can_accept_reject: _req.can_accept_reject,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        version: _req.version,
        is_factory: _req.is_factory,
        app_id: _req.app_id,
        member_action_id: _req.member_action_id,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(_req: TeamMembers): Promise<TeamMembers> {
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
  public async updateTransaction(db: DB, _req: TeamMembers): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        team_id: _req.team_id,
        member_id: _req.member_id,
        valid_from: _req.valid_from,
        valid_to: _req.valid_to,
        can_accept_reject: _req.can_accept_reject,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        version: _req.version,
        is_factory: _req.is_factory,
        app_id: _req.app_id,
        member_action_id: _req.member_action_id,
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
  public async delete(_req: TeamMembers): Promise<TeamMembers> {
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
  public async deleteTransaction(db: DB, _req: TeamMembers): Promise<void> {
    try {
      let query = this.sql_delete;
      let condition_list = [];
      if (_req.id > 0) {
        condition_list.push(`id = ${_req.id}`);
      }
      if (_req.team_id != null) {
        condition_list.push(`team_id = ${_req.team_id}`);
      }
      if (condition_list.length > 0) {
        query = query.replace(
          "@condition",
          `where ${condition_list.join(" and ")}`
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
