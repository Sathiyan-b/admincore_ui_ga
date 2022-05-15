import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { UserSessionsWrapper } from "../models/usersessions.model";
import moment from "moment";
import { UUID } from "../../global/utils/uuid";
export class UserSessionsService extends BaseService {
  sql_get = `
    SELECT
        usersessions.id,
        usersessions.refresh_token,
        usersessions.user_id,
        usersessions.start_time,
        usersessions.end_time,
        usersessions.last_active,
        usersessions.is_expired,
        usersessions.killed_by,
        usersessions.is_active,
        usersessions.created_by,
        usersessions.created_on,
        usersessions.modified_by,
		usersessions.modified_on,
		usersessions.push_notification_token,
		usersessions.app_id,
		usersessions.access_token,
	  usersessions.access_token_valid_till
	FROM usersessions
    `;
  sql_insert = `
    INSERT INTO usersessions(
        usersessions.refresh_token,
        usersessions.user_id,
        usersessions.start_time,
        usersessions.end_time,
        usersessions.last_active,
        usersessions.is_expired,
        usersessions.killed_by,
        usersessions.is_active,
        usersessions.created_by,
        usersessions.created_on,
        usersessions.modified_by,
		usersessions.modified_on,
		usersessions.push_notification_token,
		usersessions.app_id,
		usersessions.access_token,
		usersessions.access_token_valid_till
    )
    VALUES (@refresh_token, @user_id, @start_time, @end_time, @last_active, @is_expired, @killed_by, @is_active, @created_by, @created_on, @modified_by, @modified_on, @push_notification_token, @app_id, @access_token, @access_token_valid_till)
    returning *
    ;
    `;
  sql_update = `
    UPDATE usersessions
    SET 
        end_time=@end_time,
        last_active=@last_active,
        is_expired=@is_expired,
        killed_by=@killed_by, 
        is_active=@is_active,
        modified_by=@modified_by,
        modified_on=@modified_on,
		app_id=@app_id
    WHERE refresh_token = @refresh_token
    returning *;
    `;
  sql_generate_new_access_token = `
    UPDATE usersessions
    SET 
        access_token = @access_token,
		access_token_valid_till = @access_token_valid_till,
		last_active = @last_active,
		modified_on = @modified_on
    WHERE refresh_token = @refresh_token
    returning *;
    `;
  async insert(
    _user_session: UserSessionsWrapper
  ): Promise<UserSessionsWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        _user_session.access_token = new UUID().getUniqueID();
        _user_session.refresh_token = new UUID().getUniqueID();
        var token_expiration_duration = new this.utils.Environment()
          .TOKEN_EXPIRES_IN;
        // var unit:number = token_expiration_duration?.unit;
        // var value: string = token_expiration_duration?.value;
        // _user_session.access_token_valid_till = new Date()
        _user_session.access_token_valid_till = moment()
          .add(token_expiration_duration?.value, token_expiration_duration.unit)
          .toDate();
        // .add(1, "d")

        console.log("usersession", _user_session.access_token_valid_till);
        _user_session.start_time = new Date();
        _user_session.end_time = new Date();
        _user_session.last_active = new Date();
        _user_session.is_expired = false;
        _user_session.killed_by = 0;
        _user_session.is_active = true;
        _user_session.created_by = _user_session.user_id;
        _user_session.created_on = new Date();
        _user_session.modified_by = _user_session.user_id;
        _user_session.modified_on = new Date();
        var client = await db.connect();

        const rows = await db.executeQuery(this.sql_insert, {
          refresh_token: _user_session.refresh_token,
          user_id: _user_session.user_id,
          start_time: _user_session.start_time,
          end_time: _user_session.end_time,
          last_active: _user_session.last_active,
          is_expired: _user_session.is_expired,
          killed_by: _user_session.killed_by,
          is_active: _user_session.is_active,
          created_by: _user_session.created_by,
          created_on: _user_session.created_on,
          modified_by: _user_session.modified_by,
          modified_on: _user_session.modified_on,
          push_notification_token: _user_session.push_notification_token,
          app_id: _user_session.app_id,
          access_token: _user_session.access_token,
          access_token_valid_till: _user_session.access_token_valid_till,
        });
        if (_.has(rows, "0")) {
          var row = rows[0];
          _user_session.id = parseInt(row.id);
        }
      });
    } catch (error) {
      var e = error;
      throw error;
    }
    return _user_session;
  }
  async get(
    _user_session: UserSessionsWrapper
  ): Promise<Array<UserSessionsWrapper>> {
    var result: Array<UserSessionsWrapper> = new Array<UserSessionsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        var client = await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_get);
        qb.addParameter("is_expired", _user_session.is_expired, "=");
        if (_user_session.id > 0) qb.addParameter("id", _user_session.id, "=");
        if (_user_session.user_id > 0)
          qb.addParameter("user_id", _user_session.user_id, "=");

        if (_user_session.refresh_token != "")
          qb.addParameter("refresh_token", _user_session.refresh_token, "=");
        if (_user_session.access_token != "")
          qb.addParameter("access_token", _user_session.access_token, "=");
        var query_string = qb.getQuery();
        const rows = await db.executeQuery(query_string);
        _.forEach(rows, (v) => {
          var user_session = new UserSessionsWrapper();
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
          user_session.app_id = parseInt(v.app_id);
          user_session.access_token = v.access_token;
          user_session.access_token_valid_till = v.access_token_valid_till;
          result.push(user_session);
        });
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async generateNewAccessToken(
    _user_session: UserSessionsWrapper
  ): Promise<UserSessionsWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        _user_session.access_token = new UUID().getUniqueID();
        var token_expiration_duration = new this.utils.Environment()
          .TOKEN_EXPIRES_IN;
        _user_session.access_token_valid_till = moment()
          .add(token_expiration_duration.value, token_expiration_duration.unit)
          .toDate();
        _user_session.last_active = new Date();
        _user_session.modified_on = new Date();

        var client = await db.connect();
        const rows = await db.executeQuery(this.sql_generate_new_access_token, {
          access_token: _user_session.access_token,
          access_token_valid_till: _user_session.access_token_valid_till,
          last_active: _user_session.last_active,
          modified_on: _user_session.modified_on,
          refresh_token: _user_session.refresh_token,
        });
        if (_.has(rows, "0")) {
          var row = rows[0];
          _user_session.id = parseInt(row.id);
        }
      });
    } catch (error) {
      throw error;
    }
    return _user_session;
  }
  async update(_req: UserSessionsWrapper): Promise<UserSessionsWrapper> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        _req.last_active = new Date();
        _req.modified_on = new Date();
        var client = await db.connect();
        const rows = await db.executeQuery(this.sql_update, {
          end_time: _req.end_time,
          last_active: _req.last_active,
          is_expired: _req.is_expired,
          killed_by: _req.killed_by,
          is_active: _req.is_active,
          modified_by: _req.modified_by,
          modified_on: _req.modified_on,
          refresh_token: _req.refresh_token,
          app_id: _req.app_id,
        });
        // if (_.has(rows, "0")) {
        //    let row = rows[0];
        //   _req.id = row.id != null ? parseInt(row.id) : 0;
        // }
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  isSessionExpired(_user_session: UserSessionsWrapper): boolean {
    var result: boolean = true;
    try {
      /* check expiration */
      var session_expires_in = new this.utils.Environment().SESSION_EXPIRES_IN;
      var session_end_time = moment(_user_session.start_time as Date).add(
        session_expires_in.value,
        session_expires_in.unit
      );
      result = session_end_time.isBefore(moment());
    } catch (error) {
      throw error;
    }
    return result;
  }
  filterExpiredSessions(_user_session_list: Array<UserSessionsWrapper>) {
    var result: Array<UserSessionsWrapper> = [];
    try {
      result = _.filter(_user_session_list, (user_session) => {
        var is_session_expired = this.isSessionExpired(user_session);
        return !is_session_expired;
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
}
