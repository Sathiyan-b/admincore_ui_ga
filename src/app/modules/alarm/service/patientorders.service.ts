import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import { PatientOrders } from "../models/patientorders.model";

import { BaseService } from "./base.service";

export class PatientOrdersService extends BaseService {
  sql_select: string = `
  SELECT patientorders.id, patientorders.ihe_msg_id, patientorders.patient_id, patientorders.patient_visit_id, patientorders.device_id, patientorders.patient_medication_id, patientorders.ordered_on, patientorders.order_status, patientorders.order_code, patientorders.order_type, patientorders.order_by_code, patientorders.order_by_family_name, patientorders.order_by_given_name, patientorders.action_by_code, patientorders.action_by_family_name, patientorders.action_by_given_name, patientorders.assigning_authority, patientorders.order_universal_code, patientorders.order_universal_displaytext, patientorders.rate, patientorders.dose, patientorders.dose_limit, patientorders.strength, patientorders.volume_tbi, patientorders.lockout, patientorders.time_expected, patientorders.rate_unit_code, patientorders.rate_unit_displaytext, patientorders.rate_unit_system, patientorders.dose_unit_code, patientorders.dose_unit_displaytext, patientorders.dose_unit_system, patientorders.volume_unit_code, patientorders.volume_unit_displaytext, patientorders.volume_unit_system, patientorders.strength_unit_code, patientorders.strength_unit_displaytext, patientorders.strength_unit_system, patientorders.time_unit_code, patientorders.time_unit_displaytext, patientorders.time_unit_system, patientorders.enterprise_id, patientorders.ent_location_id, patientorders.row_key, patientorders.created_by, patientorders.modified_by, patientorders.created_on, patientorders.modified_on, patientorders.is_active, patientorders.is_suspended, patientorders.parent_id, patientorders.is_factory, patientorders.notes, patientorders.attributes
  FROM patientorders 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO patientorders(ihe_msg_id, patient_id, patient_visit_id, device_id, patient_medication_id, ordered_on, order_status, order_code, order_type, order_by_code, order_by_family_name, order_by_given_name, action_by_code, action_by_family_name, action_by_given_name, assigning_authority, order_universal_code, order_universal_displaytext, rate, dose, dose_limit, strength, volume_tbi, lockout, time_expected, rate_unit_code, rate_unit_displaytext, rate_unit_system, dose_unit_code, dose_unit_displaytext, dose_unit_system, volume_unit_code, volume_unit_displaytext, volume_unit_system, strength_unit_code, strength_unit_displaytext, strength_unit_system, time_unit_code, time_unit_displaytext, time_unit_system, enterprise_id, ent_location_id, row_key, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes, attributes)
VALUES (@ihe_msg_id, @patient_id, @patient_visit_id, @device_id, @patient_medication_id, @ordered_on, @order_status, @order_code, @order_type, @order_by_code, @order_by_family_name, @order_by_given_name, @action_by_code, @action_by_family_name, @action_by_given_name, @assigning_authority, @order_universal_code, @order_universal_displaytext, @rate, @dose, @dose_limit, @strength, @volume_tbi, @lockout, @time_expected, @rate_unit_code, @rate_unit_displaytext, @rate_unit_system, @dose_unit_code, @dose_unit_displaytext, @dose_unit_system, @volume_unit_code, @volume_unit_displaytext, @volume_unit_system, @strength_unit_code, @strength_unit_displaytext, @strength_unit_system, @time_unit_code, @time_unit_displaytext, @time_unit_system, @enterprise_id, @ent_location_id, @row_key, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes, @attributes)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE patientorders
    SET  ihe_msg_id = @ihe_msg_id, patient_id = @patient_id, patient_visit_id = @patient_visit_id, device_id = @device_id, patient_medication_id = @patient_medication_id, ordered_on = @ordered_on, order_status = @order_status, order_code = @order_code, order_type = @order_type, order_by_code = @order_by_code, order_by_family_name = @order_by_family_name, order_by_given_name = @order_by_given_name, action_by_code = @action_by_code, action_by_family_name = @action_by_family_name, action_by_given_name = @action_by_given_name, assigning_authority = @assigning_authority, order_universal_code = @order_universal_code, order_universal_displaytext = @order_universal_displaytext, rate = @rate, dose = @dose, dose_limit = @dose_limit, strength = @strength, volume_tbi = @volume_tbi, lockout = @lockout, time_expected = @time_expected, rate_unit_code = @rate_unit_code, rate_unit_displaytext = @rate_unit_displaytext, rate_unit_system = @rate_unit_system, dose_unit_code = @dose_unit_code, dose_unit_displaytext = @dose_unit_displaytext, dose_unit_system = @dose_unit_system, volume_unit_code = @volume_unit_code, volume_unit_displaytext = @volume_unit_displaytext, volume_unit_system = @volume_unit_system, strength_unit_code = @strength_unit_code, strength_unit_displaytext = @strength_unit_displaytext, strength_unit_system = @strength_unit_system, time_unit_code = @time_unit_code, time_unit_displaytext = @time_unit_displaytext, time_unit_system = @time_unit_system, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, row_key = @row_key, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes, attributes = @attributes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM patientorders
   WHERE id = @id
   RETURNING *; `;

  sql_changeorder_status: string = `update PatientOrders set order_status = @order_status where PatientOrders.order_code = @order_code RETURNING *;`;

  public async select(_req: PatientOrders): Promise<Array<PatientOrders>> {
    var result: Array<PatientOrders> = [];
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
    _req: PatientOrders
  ): Promise<Array<PatientOrders>> {
    var result: Array<PatientOrders> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`PatientOrders.id = ${_req.id}`);
      }
      if (_req.device_id && _req.device_id > 0) {
        condition_list.push(`PatientOrders.device_id = ${_req.device_id}`);
      }
      if (_req.order_status && _req.order_status.length > 0) {
        condition_list.push(
          `PatientOrders.order_status = '${_req.order_status}'`
        );
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
          var temp: PatientOrders = new PatientOrders();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.ihe_msg_id = v.ihe_msg_id != 0 ? parseInt(v.ihe_msg_id) : 0;
          temp.patient_id = v.patient_id != 0 ? parseInt(v.patient_id) : 0;
          temp.patient_visit_id =
            v.patient_visit_id != 0 ? parseInt(v.patient_visit_id) : 0;
          temp.device_id = v.device_id != 0 ? parseInt(v.device_id) : 0;
          temp.patient_medication_id =
            v.patient_medication_id != 0
              ? parseInt(v.patient_medication_id)
              : 0;
          temp.ordered_on = v.ordered_on;
          temp.order_status =
            v.order_status != null && v.order_status.length != 0
              ? v.order_status
              : "";
          temp.order_code =
            v.order_code != null && v.order_code.length != 0
              ? v.order_code
              : "";
          temp.order_type =
            v.order_type != null && v.order_type.length != 0
              ? v.order_type
              : "";
          temp.order_by_code =
            v.order_by_code != null && v.order_by_code.length != 0
              ? v.order_by_code
              : "";
          temp.order_by_family_name =
            v.order_by_family_name != null && v.order_by_family_name.length != 0
              ? v.order_by_family_name
              : "";
          temp.order_by_given_name =
            v.order_by_given_name != null && v.order_by_given_name.length != 0
              ? v.order_by_given_name
              : "";
          temp.action_by_code =
            v.action_by_code != null && v.action_by_code.length != 0
              ? v.action_by_code
              : "";
          temp.action_by_family_name =
            v.action_by_family_name != null &&
            v.action_by_family_name.length != 0
              ? v.action_by_family_name
              : "";
          temp.action_by_given_name =
            v.action_by_given_name != null && v.action_by_given_name.length != 0
              ? v.action_by_given_name
              : "";
          temp.assigning_authority =
            v.assigning_authority != null && v.assigning_authority.length != 0
              ? v.assigning_authority
              : "";
          temp.order_universal_code =
            v.order_universal_code != null && v.order_universal_code.length != 0
              ? v.order_universal_code
              : "";
          temp.order_universal_displaytext =
            v.order_universal_displaytext != null &&
            v.order_universal_displaytext.length != 0
              ? v.order_universal_displaytext
              : "";
          temp.rate = v.rate != null && v.rate != 0 ? parseInt(v.rate) : 0;
          temp.dose = v.dose != null && v.dose != 0 ? parseInt(v.dose) : 0;
          temp.dose_limit =
            v.dose_limit != null && v.dose_limit != 0
              ? parseInt(v.dose_limit)
              : 0;
          temp.strength =
            v.strength != null && v.strength != 0 ? parseInt(v.strength) : 0;
          temp.volume_tbi =
            v.volume_tbi != null && v.volume_tbi != 0
              ? parseInt(v.volume_tbi)
              : 0;
          temp.lockout =
            v.lockout != null && v.lockout != 0 ? parseInt(v.lockout) : 0;
          temp.time_expected =
            v.time_expected != null && v.time_expected != 0
              ? parseInt(v.time_expected)
              : 0;
          temp.rate_unit_code =
            v.rate_unit_code != null && v.rate_unit_code.length != 0
              ? v.rate_unit_code
              : "";
          temp.rate_unit_displaytext =
            v.rate_unit_displaytext != null &&
            v.rate_unit_displaytext.length != 0
              ? v.rate_unit_displaytext
              : "";
          temp.rate_unit_system =
            v.rate_unit_system != null && v.rate_unit_system.length != 0
              ? v.rate_unit_system
              : "";
          temp.dose_unit_code =
            v.dose_unit_code != null && v.dose_unit_code.length != 0
              ? v.dose_unit_code
              : "";
          temp.dose_unit_displaytext =
            v.dose_unit_displaytext != null &&
            v.dose_unit_displaytext.length != 0
              ? v.dose_unit_displaytext
              : "";
          temp.dose_unit_system =
            v.dose_unit_system != null && v.dose_unit_system.length != 0
              ? v.dose_unit_system
              : "";
          temp.volume_unit_code =
            v.volume_unit_code != null && v.volume_unit_code.length != 0
              ? v.volume_unit_code
              : "";
          temp.volume_unit_displaytext =
            v.volume_unit_displaytext != null &&
            v.volume_unit_displaytext.length != 0
              ? v.volume_unit_displaytext
              : "";
          temp.volume_unit_system =
            v.volume_unit_system != null && v.volume_unit_system.length != 0
              ? v.volume_unit_system
              : "";
          temp.strength_unit_code =
            v.strength_unit_code != null && v.strength_unit_code.length != 0
              ? v.strength_unit_code
              : "";
          temp.strength_unit_displaytext =
            v.strength_unit_displaytext != null &&
            v.strength_unit_displaytext.length != 0
              ? v.strength_unit_displaytext
              : "";
          temp.strength_unit_system =
            v.strength_unit_system != null && v.strength_unit_system.length != 0
              ? v.strength_unit_system
              : "";
          temp.time_unit_code =
            v.time_unit_code != null && v.time_unit_code.length != 0
              ? v.time_unit_code
              : "";
          temp.time_unit_displaytext =
            v.time_unit_displaytext != null &&
            v.time_unit_displaytext.length != 0
              ? v.time_unit_displaytext
              : "";
          temp.time_unit_system =
            v.time_unit_system != null && v.time_unit_system.length != 0
              ? v.time_unit_system
              : "";
          temp.enterprise_id =
            v.enterprise_id != null ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
          temp.row_key = v != null && v.row_key.length != 0 ? v.row_key : "";
          temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
          temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
          temp.created_on = v.created_on;
          temp.modified_on = v.modified_on;
          temp.is_active = v.is_active;
          temp.is_suspended = v.is_suspended;
          temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          temp.is_factory = v.is_factory;
          temp.notes = v.notes != null && v.notes.length != 0 ? v.notes : "";
          temp.attributes =
            v.attributes != null && v.attributes.length != 0
              ? v.attributes
              : "";
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(_req: PatientOrders): Promise<PatientOrders> {
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

  public async insertTransaction(db: DB, _req: PatientOrders): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        patient_visit_id: _req.patient_visit_id,
        device_id: _req.device_id,
        patient_medication_id: _req.patient_medication_id,
        ordered_on: _req.ordered_on,
        order_status: _req.order_status,
        order_code: _req.order_code,
        order_type: _req.order_type,
        order_by_code: _req.order_by_code,
        order_by_family_name: _req.order_by_family_name,
        order_by_given_name: _req.order_by_given_name,
        action_by_code: _req.action_by_code,
        action_by_family_name: _req.action_by_family_name,
        action_by_given_name: _req.action_by_given_name,
        assigning_authority: _req.assigning_authority,
        order_universal_code: _req.order_universal_code,
        order_universal_displaytext: _req.order_universal_displaytext,
        rate: _req.rate,
        dose: _req.dose,
        dose_limit: _req.dose_limit,
        strength: _req.strength,
        volume_tbi: _req.volume_tbi,
        lockout: _req.lockout,
        time_expected: _req.time_expected,
        rate_unit_code: _req.rate_unit_code,
        rate_unit_displaytext: _req.rate_unit_displaytext,
        rate_unit_system: _req.rate_unit_system,
        dose_unit_code: _req.dose_unit_code,
        dose_unit_displaytext: _req.dose_unit_displaytext,
        dose_unit_system: _req.dose_unit_system,
        volume_unit_code: _req.volume_unit_code,
        volume_unit_displaytext: _req.volume_unit_displaytext,
        volume_unit_system: _req.volume_unit_system,
        strength_unit_code: _req.strength_unit_code,
        strength_unit_displaytext: _req.strength_unit_displaytext,
        strength_unit_system: _req.strength_unit_system,
        time_unit_code: _req.time_unit_code,
        time_unit_displaytext: _req.time_unit_displaytext,
        time_unit_system: _req.time_unit_system,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        row_key: _req.row_key,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
        attributes: _req.attributes
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(_req: PatientOrders): Promise<PatientOrders> {
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
  public async updateTransaction(db: DB, _req: PatientOrders): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        patient_visit_id: _req.patient_visit_id,
        device_id: _req.device_id,
        patient_medication_id: _req.patient_medication_id,
        ordered_on: _req.ordered_on,
        order_status: _req.order_status,
        order_code: _req.order_code,
        order_type: _req.order_type,
        order_by_code: _req.order_by_code,
        order_by_family_name: _req.order_by_family_name,
        order_by_given_name: _req.order_by_given_name,
        action_by_code: _req.action_by_code,
        action_by_family_name: _req.action_by_family_name,
        action_by_given_name: _req.action_by_given_name,
        assigning_authority: _req.assigning_authority,
        order_universal_code: _req.order_universal_code,
        order_universal_displaytext: _req.order_universal_displaytext,
        rate: _req.rate,
        dose: _req.dose,
        dose_limit: _req.dose_limit,
        strength: _req.strength,
        volume_tbi: _req.volume_tbi,
        lockout: _req.lockout,
        time_expected: _req.time_expected,
        rate_unit_code: _req.rate_unit_code,
        rate_unit_displaytext: _req.rate_unit_displaytext,
        rate_unit_system: _req.rate_unit_system,
        dose_unit_code: _req.dose_unit_code,
        dose_unit_displaytext: _req.dose_unit_displaytext,
        dose_unit_system: _req.dose_unit_system,
        volume_unit_code: _req.volume_unit_code,
        volume_unit_displaytext: _req.volume_unit_displaytext,
        volume_unit_system: _req.volume_unit_system,
        strength_unit_code: _req.strength_unit_code,
        strength_unit_displaytext: _req.strength_unit_displaytext,
        strength_unit_system: _req.strength_unit_system,
        time_unit_code: _req.time_unit_code,
        time_unit_displaytext: _req.time_unit_displaytext,
        time_unit_system: _req.time_unit_system,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        row_key: _req.row_key,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
        attributes: _req.attributes
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async delete(_req: PatientOrders): Promise<PatientOrders> {
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
  public async deleteTransaction(db: DB, _req: PatientOrders): Promise<void> {
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
  public async changeOrderStatus(_req: PatientOrders): Promise<PatientOrders> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        await this.changeOrderStatusTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async changeOrderStatusTransaction(
    db: DB,
    _req: PatientOrders
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_changeorder_status, {
        order_code: _req.order_code,
        order_status: _req.order_status
      });
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
}
