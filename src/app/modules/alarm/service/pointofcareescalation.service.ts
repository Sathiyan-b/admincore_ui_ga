import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  PointofCareEscalation,
  PointofCareEscalationWrapper,
} from "../models/pointofcareescalation.model";
import { BaseService } from "./base.service";

export class PointofCareEscalationService extends BaseService {
  sql_select: string = `
      SELECT pointofcareescalation.id, pointofcareescalation.poc_id, pointofcareescalation.escalated_to_type_id, pointofcareescalation.escalated_to_id, pointofcareescalation.escalation_duration, pointofcareescalation.escalation_duration_uom, pointofcareescalation.app_id, pointofcareescalation.enterprise_id, pointofcareescalation.ent_location_id, pointofcareescalation.escalation_level, pointofcareescalation.created_on, pointofcareescalation.created_by, pointofcareescalation.modified_on, pointofcareescalation.modified_by, pointofcareescalation.is_active, pointofcareescalation.is_factory
      FROM pointofcareescalation 
      @condition;
      `;

  sql_insert: string = `
  Declare @type_id bigint
  Select @type_id = id from ReferenceValues where identifier = @escalated_to_type
INSERT INTO pointofcareescalation(poc_id, escalated_to_type_id, escalated_to_id, escalation_duration, escalation_duration_uom, app_id, enterprise_id, ent_location_id, escalation_level, created_on, created_by, modified_on, modified_by, is_active, is_factory)
VALUES (@poc_id, @type_id,  @escalated_to_id, @escalation_duration, @escalation_duration_uom, @app_id, @enterprise_id, @ent_location_id, @escalation_level, @created_on, @created_by, @modified_on, @modified_by, @is_active, @is_factory)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE pointofcareescalation
    SET  poc_id = @poc_id, escalated_to_type_id = @escalated_to_type_id,escalated_to_type = @escalated_to_type, escalated_to_id = @escalated_to_id, escalation_duration = @escalation_duration, escalation_duration_uom = @escalation_duration_uom, app_id = @app_id, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, escalation_level = @escalation_level, created_on = @created_on, created_by = @created_by, modified_on = @modified_on, modified_by = @modified_by, is_active = @is_active, is_factory = @is_factory
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM pointofcareescalation
  @condition
   RETURNING *; `;

  public async select(
    _req: PointofCareEscalation
  ): Promise<Array<PointofCareEscalation>> {
    var result: Array<PointofCareEscalation> = [];
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
    _req: PointofCareEscalation
  ): Promise<Array<PointofCareEscalation>> {
    var result: Array<PointofCareEscalation> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`PointofCareEscalation.id = ${_req.id}`);
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
          var temp: PointofCareEscalation = new PointofCareEscalation();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.poc_id = v.poc_id != 0 ? parseInt(v.poc_id) : 0;
          temp.escalated_to_type_id =
            v != null && v.escalated_to_type_id.length != ""
              ? v.escalated_to_type_id
              : "";
              temp.escalated_to_type =  v != null && v.escalated_to_type.length != ""
              ? v.escalated_to_type
              : "";
          temp.escalated_to_id =
            v.escalated_to_id != 0 ? parseInt(v.escalated_to_id) : 0;
          temp.escalation_duration =
            v.escalation_duration != 0 ? parseInt(v.escalation_duration) : 0;
          temp.escalation_duration_uom =
            v.escalation_duration_uom != 0
              ? parseInt(v.escalation_duration_uom)
              : 0;
          temp.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          temp.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
          temp.escalation_level = v.escalation_level != 0 ? parseInt(v.escalation_level) : 0;
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
    _req: PointofCareEscalation
  ): Promise<PointofCareEscalation> {
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
    _req: PointofCareEscalation
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        poc_id: _req.poc_id,
        escalated_to_id: _req.escalated_to_type_id,
        escalated_to_type: _req.escalated_to_type,
        // escalated_to_id: _req.escalated_to_id,
        escalation_duration: _req.escalation_duration,
        escalation_duration_uom: _req.escalation_duration_uom,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        escalation_level: _req.escalation_level,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
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
    _req: PointofCareEscalation
  ): Promise<PointofCareEscalation> {
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
    _req: PointofCareEscalation
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        poc_id: _req.poc_id,
        escalated_to_type_id: _req.escalated_to_type_id,
        escalated_to_type: _req.escalated_to_type,
        escalated_to_id: _req.escalated_to_id,
        escalation_duration: _req.escalation_duration,
        escalation_duration_uom: _req.escalation_duration_uom,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        escalation_level: _req.escalation_level,
        created_on: _req.created_on,
        created_by: _req.created_by,
        modified_on: _req.modified_on,
        modified_by: _req.modified_by,
        is_active: _req.is_active,
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
  public async delete(
    _req: PointofCareEscalation
  ): Promise<PointofCareEscalation> {
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
    _req: PointofCareEscalationWrapper
  ): Promise<void> {
    try {
      let query = this.sql_delete;
      let condition_list = [];
      if (_req.id > 0) {
        condition_list.push(`id = ${_req.id}`);
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
