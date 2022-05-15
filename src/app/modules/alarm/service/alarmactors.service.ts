import _ from "lodash";
import { DB, using } from "../../global/utils";
import { AlarmActors, AlarmActorsWrapper } from "../models/alarmactors.model";
import { BaseService } from "./base.service";

export class AlarmActorsService extends BaseService {
  sql_select: string = `
      SELECT alarmactors.id, alarmactors.scheduler_id, alarmactors.alarm_id, alarmactors.user_id, alarmactors.role_profile_id, alarmactors.user_team_id, alarmactors.poc_id, alarmactors.action_start, alarmactors.action_end, alarmactors.action_response, alarmactors.action_on, alarmactors.is_read_only, alarmactors.created_by, alarmactors.modified_by, alarmactors.created_on, alarmactors.modified_on, alarmactors.is_active, alarmactors.is_suspended, alarmactors.parent_id, alarmactors.is_factory, alarmactors.notes
      FROM alarmactors 
      @condition;
      `;

  sql_insert: string = `
      INSERT INTO alarmactors(alarm_id, scheduler_id, user_id, role_profile_id, user_team_id, poc_id, action_start, action_end, action_response, action_on, is_read_only, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
      VALUES (@alarm_id, @scheduler_id, @user_id, @role_profile_id, @user_team_id, @poc_id, @action_start, @action_end, @action_response, @action_on, @is_read_only, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes)
      RETURNING *;  
      `;

  sql_update: string = `
    UPDATE alarmactors
    SET  alarm_id = @alarm_id, scheduler_id = @scheduler_id, user_id = @user_id, role_profile_id = @role_profile_id, user_team_id = @user_team_id, poc_id = @poc_id, action_start = @action_start, action_end = @action_end, action_response = @action_response, action_on = @action_on, is_read_only = @is_read_only, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM alarmactors
   WHERE id = @id
   RETURNING *; `;

  sql_mark_as_readonly = `
	UPDATE alarmactors
        SET
        is_read_only=true
    WHERE alarm_id = @alarm_id
	RETURNING *
	`;

  public async select(_req: AlarmActors): Promise<Array<AlarmActors>> {
    var result: Array<AlarmActors> = [];
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
    _req: AlarmActors
  ): Promise<Array<AlarmActors>> {
    var result: Array<AlarmActors> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`AlarmActors.id = ${_req.id}`);
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
          var temp: AlarmActors = new AlarmActors();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.alarm_id = v.alarm_id != 0 ? parseInt(v.alarm_id) : 0;
          temp.user_id = v.user_id != 0 ? parseInt(v.user_id) : 0;
          temp.role_profile_id =
            v.role_profile_id != 0 ? parseInt(v.role_profile_id) : 0;
          temp.user_team_id =
            v.user_team_id != 0 ? parseInt(v.user_team_id) : 0;
          temp.poc_id = v.poc_id != 0 ? parseInt(v.poc_id) : 0;
          temp.action_start = v.action_start;
          temp.action_end = v.action_end;
          temp.action_response =
            v != null && v.action_response.length != 0 ? v.action_response : "";
          temp.action_on = v.action_on;
          temp.is_read_only = v.is_read_only;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.created_on = v.created_on;
          temp.modified_on = v.modified_on;
          temp.is_active = v.is_active;
          temp.is_suspended = v.is_suspended;
          temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          temp.scheduler_id =
            v.scheduler_id != null ? parseInt(v.scheduler_id) : 0;
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

  public async insert(_req: AlarmActors): Promise<AlarmActors> {
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

  public async insertTransaction(db: DB, _req: AlarmActors): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        alarm_id: _req.alarm_id,
        scheduler_id: _req.scheduler_id,
        user_id: _req.user_id,
        role_profile_id: _req.role_profile_id,
        user_team_id: _req.user_team_id,
        poc_id: _req.poc_id,
        action_start: _req.action_start,
        action_end: _req.action_end,
        action_response: _req.action_response,
        action_on: _req.action_on,
        is_read_only: _req.is_read_only,
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
    } catch (error) {
      throw error;
    }
  }

  async markAsReadonly(_req: AlarmActors): Promise<AlarmActors> {
    let result: AlarmActors = new AlarmActors();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.markAsReadonlyTransaction(db, _req);
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async markAsReadonlyTransaction(
    db: DB,
    _req: AlarmActors
  ): Promise<AlarmActors> {
    let result: AlarmActors = new AlarmActors();
    try {
      const { alarm_id } = _req;

      const rows = await db.executeQuery(this.sql_mark_as_readonly, {
        alarm_id,
      });
      if (rows.length > 0) {
        result = _.get(rows, "0", new AlarmActors());
      }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  public async update(_req: AlarmActorsWrapper): Promise<AlarmActorsWrapper> {
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
    _req: AlarmActorsWrapper
  ): Promise<AlarmActorsWrapper> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        alarm_id: _req.alarm_id,
        scheduler_id: _req.scheduler_id,
        user_id: _req.user_id,
        role_profile_id: _req.role_profile_id,
        user_team_id: _req.user_team_id,
        poc_id: _req.poc_id,
        action_start: _req.action_start,
        action_end: _req.action_end,
        action_response: _req.action_response,
        action_on: _req.action_on,
        is_read_only: _req.is_read_only,
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
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async delete(_req: AlarmActors): Promise<AlarmActors> {
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
  public async deleteTransaction(db: DB, _req: AlarmActors): Promise<void> {
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
}
