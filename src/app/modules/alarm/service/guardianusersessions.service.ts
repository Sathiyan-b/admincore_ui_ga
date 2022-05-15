import { request } from "express";
import _ from "lodash";
import { Pool, PoolClient } from "pg";
import {
  DB,
  Environment,
  json_custom_stringifier,
  QueryBuilder,
  using
} from "../../global/utils";
import {
  GuardianUserSessions, GuardianUserSessionsWrapper
} from "../models/guardianusersessions.model";
import { BaseService } from "./base.service";
import moment from "moment";
import { logger } from "../utils";

export class GuardianUserSessionsService extends BaseService {
  sql_select: string = `
      SELECT guardianusersessions.id, guardianusersessions.user_id, guardianusersessions.access_token, guardianusersessions.access_token_valid_till, guardianusersessions.refresh_token, guardianusersessions.start_time, guardianusersessions.end_time, guardianusersessions.last_active, guardianusersessions.is_expired, guardianusersessions.killed_by, guardianusersessions.push_notification_token, guardianusersessions.app_id, guardianusersessions.user_info, guardianusersessions.created_by, guardianusersessions.modified_by, guardianusersessions.created_on, guardianusersessions.modified_on, guardianusersessions.is_active, guardianusersessions.is_suspended, guardianusersessions.parent_id, guardianusersessions.is_factory, guardianusersessions.notes
      FROM guardianusersessions 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO guardianusersessions(user_id, access_token, access_token_valid_till, refresh_token, start_time, end_time, last_active, is_expired, killed_by, push_notification_token, app_id, user_info, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
VALUES (@user_id, @access_token, @access_token_valid_till, @refresh_token, @start_time, @end_time, @last_active, @is_expired, @killed_by, @push_notification_token, @app_id, @user_info, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE guardianusersessions
    SET  user_id = @user_id, access_token = @access_token, access_token_valid_till = @access_token_valid_till, refresh_token = @refresh_token, start_time = @start_time, end_time = @end_time, last_active = @last_active, is_expired = @is_expired, killed_by = @killed_by, push_notification_token = @push_notification_token, app_id = @app_id, user_info = @user_info, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM guardianusersessions
   WHERE id = @id
   RETURNING *; `;

  sql_get = `
   SELECT
       id,
       refresh_token,
       user_id,
       start_time,
       end_time,
       last_active,
       is_expired,
       killed_by,
       is_active,
       created_by,
       created_on,
       modified_by,
       modified_on,
       push_notification_token,
       access_token,
       access_token_valid_till,
       user_info
       FROM  GuardianUserSessions
       `;

  public async select(
    _req: GuardianUserSessions
  ): Promise<Array<GuardianUserSessions>> {
    var result: Array<GuardianUserSessions> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
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
    _req: GuardianUserSessions
  ): Promise<Array<GuardianUserSessions>> {
    var result: Array<GuardianUserSessions> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`GuardianUserSessions.id = ${_req.id}`);
      }
      if (_req.user_id > 0) {
        condition_list.push(`GuardianUserSessions.user_id = ${_req.user_id}`);
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
        _.forEach(rows, v => {
          var temp: GuardianUserSessions = new GuardianUserSessions();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.user_id = v.user_id != 0 ? parseInt(v.user_id) : 0;
          temp.access_token =
            v != null && v.access_token.length != 0 ? v.access_token : "";
          temp.access_token_valid_till = v.access_token_valid_till;
          temp.refresh_token =
            v != null && v.refresh_token.length != 0 ? v.refresh_token : "";
          temp.start_time = v.start_time;
          temp.end_time = v.end_time;
          temp.last_active = v.last_active;
          temp.is_expired = v.is_expired;
          temp.killed_by = v.killed_by != 0 ? parseInt(v.killed_by) : 0;
          temp.push_notification_token =
            v != null && v.push_notification_token.length != 0
              ? v.push_notification_token
              : "";
          temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          temp.user_info =
            v != null && v.user_info.length != 0 ? v.user_info : "";
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.created_on = v.created_on;
          temp.modified_on = v.modified_on;
          temp.is_active = v.is_active;
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

  public async insert(
    _req: GuardianUserSessions
  ): Promise<GuardianUserSessions> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
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
    _req: GuardianUserSessions
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let request = new GuardianUserSessions();
      request.user_id = _req.user_id;
      request.access_token = _req.access_token;
      request.access_token_valid_till = _req.access_token_valid_till;
      request.refresh_token = _req.refresh_token;
      request.start_time = _req.start_time;
      request.end_time = _req.end_time;
      request.last_active = _req.last_active;
      request.is_expired = _req.is_expired;
      request.killed_by = _req.killed_by;
      request.push_notification_token = _req.push_notification_token;
      request.app_id = _req.app_id;
      (request.user_info = json_custom_stringifier.stringify(_req.user_info)),
        (request.created_by = _req.created_by);
      request.modified_by = _req.modified_by;
      request.created_on = _req.created_on;
      request.modified_on = _req.modified_on;
      request.is_active = _req.is_active;
      request.is_suspended = _req.is_suspended;
      request.parent_id = _req.parent_id;
      request.is_factory = _req.is_factory;
      request.notes = _req.notes;

      let rows = await db.executeQuery(this.sql_insert, request);
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(
    _req: GuardianUserSessions
  ): Promise<GuardianUserSessions> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
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
    _req: GuardianUserSessions
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        user_id: _req.user_id,
        access_token: _req.access_token,
        access_token_valid_till: _req.access_token_valid_till,
        refresh_token: _req.refresh_token,
        start_time: _req.start_time,
        end_time: _req.end_time,
        last_active: _req.last_active,
        is_expired: _req.is_expired,
        killed_by: _req.killed_by,
        push_notification_token: _req.push_notification_token,
        app_id: _req.app_id,
        user_info: json_custom_stringifier.stringify(_req.user_info),
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async delete(
    _req: GuardianUserSessions
  ): Promise<GuardianUserSessions> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
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
    _req: GuardianUserSessions
  ): Promise<void> {
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
  async get(
    _user_session: GuardianUserSessions
  ): Promise<Array<GuardianUserSessions>> {
    var result: Array<GuardianUserSessions> = new Array<GuardianUserSessions>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        var client = await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_get);
        qb.addParameter("is_expired", _user_session.is_expired, "=");
        if (_user_session.id > 0) qb.addParameter("id", _user_session.id, "=");
        if (_user_session.user_id > 0)
          qb.addParameter("user_id", _user_session.user_id, "=");

        if (
          _user_session.refresh_token &&
          _user_session.refresh_token.length != 0
        )
          qb.addParameter("refresh_token", _user_session.refresh_token, "=");
        if (
          _user_session.access_token &&
          _user_session.access_token.length != 0
        )
          qb.addParameter("access_token", _user_session.access_token, "=");
        var query_string = qb.getQuery();
        const rows = await db.executeQuery(query_string);
        _.forEach(rows, v => {
          var user_session = new GuardianUserSessions();
          user_session.id = parseInt(v.id);
          user_session.refresh_token = v.refresh_token;
          user_session.start_time = v.start_time;
          user_session.end_time = v.end_time;
          user_session.last_active = v.last_active;
          user_session.user_id = parseInt(v.user_id);
          user_session.killed_by = parseInt(v.killed_by);
          user_session.is_expired = v.is_expired;
          user_session.created_by = parseInt(v.created_by);
          user_session.created_on = v.created_on;
          user_session.modified_by = parseInt(v.modified_by);
          user_session.modified_on = v.modified_on;
          user_session.is_active = v.is_active;
          user_session.push_notification_token =
            _.get(v, "push_notification_token", null) == null
              ? ""
              : v.push_notification_token;
          user_session.access_token = v.access_token;
          user_session.access_token_valid_till = v.access_token_valid_till;
          user_session.user_info = v.user_info;
          result.push(user_session);
        });
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  isSessionExpired(_user_session: GuardianUserSessions): boolean {
    var result: boolean = true;
    try {
      /* check expiration */
      var token_length = (_user_session.push_notification_token || "").trim()
        .length;
      result =
        moment(_user_session.access_token_valid_till).isBefore(moment()) ||
        token_length == 0;
    } catch (error) {
      throw error;
    }
    return result;
  }
  filterExpiredSessions(_user_session_list: Array<GuardianUserSessions>) {
    var result: Array<GuardianUserSessions> = [];
    try {
      result = _.filter(_user_session_list, user_session => {
        var is_session_expired = this.isSessionExpired(user_session);
        return !is_session_expired;
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getExpoPushTokenAgainstUser(_user_id: number) {
    var token_list: Array<string> = [];
    try {
      let _usersession_req = new GuardianUserSessions();
      _usersession_req.user_id = _user_id;
      var user_session_list = await this.select(_usersession_req);
      logger.info(
        "ALARM SERVICE" + " USERSESSION LIST ",
        user_session_list.length
      );
      user_session_list = this.filterExpiredSessions(user_session_list);
      logger.info(
        "ALARM SERVICE" + "FILTERED USERSESSION LIST ",
        user_session_list.length
      );
      _.forEach(user_session_list, v => {
        token_list.push(v.push_notification_token);
      });
    } catch (error) {
      throw error;
    }
    return token_list;
  }
}
