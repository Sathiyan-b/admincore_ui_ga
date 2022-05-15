import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  PointofCareSubscribers,
  PointofCareSubscribersWrapper,
} from "../models/pointofcaresubscribers.model";
import { BaseService } from "./base.service";

export class PointofCareSubscribersService extends BaseService {
  sql_select: string = `
      SELECT pointofcaresubscribers.id, pointofcaresubscribers.poc_id, pointofcaresubscribers.subscriber_id, pointofcaresubscribers.created_on, pointofcaresubscribers.created_by, pointofcaresubscribers.modified_on, pointofcaresubscribers.modified_by, pointofcaresubscribers.is_active, pointofcaresubscribers.is_factory, pointofcaresubscribers.app_id
      FROM pointofcaresubscribers 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO pointofcaresubscribers(poc_id, subscriber_id, created_on, created_by, modified_on, modified_by, is_active, is_factory, app_id, is_user_subscribed)
VALUES (@pointofcare_id, @subscriber_id, @created_on, @created_by, @modified_on, @modified_by, @is_active, @is_factory, @app_id, @is_user_subscribed)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE pointofcaresubscribers
    SET  poc_id = @poc_id, subscriber_id = @subscriber_id, created_on = @created_on, created_by = @created_by, modified_on = @modified_on, 
    modified_by = @modified_by, is_active = @is_active, is_factory = @is_factory, app_id = @app_id, is_user_subscribed = @is_user_subscribed
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM pointofcaresubscribers
@condition
   RETURNING *; `;

  public async select(
    _req: PointofCareSubscribers
  ): Promise<Array<PointofCareSubscribers>> {
    var result: Array<PointofCareSubscribers> = [];
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
    _req: PointofCareSubscribers
  ): Promise<Array<PointofCareSubscribers>> {
    var result: Array<PointofCareSubscribers> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`PointofCareSubscribers.id = ${_req.id}`);
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
          var temp: PointofCareSubscribers = new PointofCareSubscribers();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.poc_id =
            v.poc_id != 0 ? parseInt(v.poc_id) : 0;
          temp.subscriber_id = v.subscriber_id != 0 ? parseInt(v.subscriber_id) : 0;
          temp.created_on = v.created_on;
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_on = v.modified_on;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.is_active = v.is_active;
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

  public async insert(
    _req: PointofCareSubscribers
  ): Promise<PointofCareSubscribers> {
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
    _req: PointofCareSubscribers
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        pointofcare_id: _req.poc_id,
        subscriber_id: _req.subscriber_id,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        is_factory: _req.is_factory,
        app_id: _req.app_id,
        is_user_subscribed:_req.is_user_subscribed
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
    _req: PointofCareSubscribers
  ): Promise<PointofCareSubscribers> {
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
    _req: PointofCareSubscribers
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        pointofcare_id: _req.poc_id,
        subscriber_id: _req.subscriber_id,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
        is_factory: _req.is_factory,
        app_id: _req.app_id,
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
    _req: PointofCareSubscribers
  ): Promise<PointofCareSubscribers> {
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
    _req: PointofCareSubscribers
  ): Promise<void> {
    try {
      let query = this.sql_delete;
      let condition_list = [];
      if (_req.id > 0) {
        condition_list.push(`pointofcaresubscribers.id = ${_req.id}`);
      }
      if (_req.poc_id != null) {
        condition_list.push(`poc_id = ${_req.poc_id}`);
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
