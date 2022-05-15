import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  DevicePeople,
  DevicePeopleWrapper,
} from "../models/devicepeople.model";
import { BaseService } from "./base.service";

export class DevicePeopleService extends BaseService {
  sql_select: string = `
      SELECT devicepeople.id, devicepeople.device_id, devicepeople.patient_id, devicepeople.user_id, devicepeople.request_status_id, devicepeople.valid_from, devicepeople.valid_to, devicepeople.enterprise_id, devicepeople.ent_location_id, devicepeople.created_by, devicepeople.modified_by, devicepeople.created_on, devicepeople.modified_on, devicepeople.is_active, devicepeople.is_suspended, devicepeople.parent_id, devicepeople.is_factory, devicepeople.notes
      FROM devicepeople 
      @condition;
      `;

  sql_insert: string = `
  Declare @request_status_id bigint
  Select @request_status_id = id from ReferenceValues where identifier = @request_status_identifier
INSERT INTO devicepeople(device_id, patient_id, patient_visit_id, patient_order_id, user_id, request_status_id, valid_from, valid_to, enterprise_id, ent_location_id, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
VALUES (@device_id, @patient_id, @patient_visit_id, @patient_order_id, @user_id, @request_status_id, @valid_from, @valid_to, @enterprise_id, @ent_location_id, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE devicepeople
    SET  device_id = @device_id, patient_id = @patient_id, user_id = @user_id, request_status_id = @request_status_id, valid_from = @valid_from, valid_to = @valid_to, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM devicepeople
   WHERE id = @id
   RETURNING *; `;

   sql_update_disassociate: string = `
    Declare @request_status_id bigint
    Select @request_status_id = id from ReferenceValues where identifier = @request_status_identifier
    UPDATE devicepeople
    SET request_status_id = @request_status_id, valid_to = @valid_to, modified_by = @modified_by, 
    modified_on = @modified_on, is_active = @is_active, patient_order_id = @patient_order_id, patient_visit_id = @patient_visit_id
    @condition
    RETURNING *;
  `;
  sql_check_associated_devices: string = `
  SELECT devicepeople.id, devicepeople.device_id, devicepeople.patient_id, devicepeople.patient_visit_id, devicepeople.patient_order_id, devicepeople.user_id, 
	devicepeople.request_status_id, ReferenceValues.identifier ref_identifier ,devicepeople.valid_from, devicepeople.valid_to,
	devicepeople.enterprise_id, devicepeople.ent_location_id, devicepeople.created_by, 
	devicepeople.modified_by, devicepeople.created_on, devicepeople.modified_on,
	ReferenceValues.identifier request_status_identifier,
	devicepeople.is_active, devicepeople.is_suspended, devicepeople.parent_id, devicepeople.is_factory, devicepeople.notes
	FROM devicepeople inner join ReferenceValues on ReferenceValues.id = DevicePeople.request_status_id 
	and ReferenceValues.identifier != 'DISSOCIATED' @condition
  `

  public async select(_req: DevicePeople): Promise<Array<DevicePeople>> {
    var result: Array<DevicePeople> = [];
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
    _req: DevicePeople
  ): Promise<Array<DevicePeople>> {
    var result: Array<DevicePeople> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`DevicePeople.id = ${_req.id}`);
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
          var temp: DevicePeople = new DevicePeople();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.device_id = v.device_id != 0 ? parseInt(v.device_id) : 0;
          temp.patient_id = v.patient_id != 0 ? parseInt(v.patient_id) : 0;
          temp.user_id = v.user_id != 0 ? parseInt(v.user_id) : 0;
          temp.request_status_id =
            v.request_status_id != 0 ? parseInt(v.request_status_id) : 0;
          temp.valid_from = v.valid_from;
          temp.valid_to = v.valid_to;
          temp.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
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

  public async insert(_req: DevicePeopleWrapper): Promise<DevicePeople> {
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

  public async insertTransaction(db: DB, _req: DevicePeopleWrapper): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        device_id: _req.device_id,
        patient_id: _req.patient_id,
        user_id: _req.user_id,
        valid_from: _req.valid_from,
        valid_to: _req.valid_to,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
        request_status_identifier:_req.request_status_identifier,
        patient_order_id:_req.patient_order_id,
        patient_visit_id:_req.patient_visit_id
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async updateForAssociationDisassociation(_req: DevicePeopleWrapper): Promise<DevicePeople> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.updateForAssociationDisassociationTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async updateForAssociationDisassociationTransaction(db: DB, _req: DevicePeopleWrapper): Promise<void> {
    try {
      var query: string = this.sql_update_disassociate;
      var condition_list: Array<string> = [];
      condition_list.push(`request_status_id not in (select id from ReferenceValues where identifier = 'DISSOCIATED' )`)
      if (_req.id > 0) {
        condition_list.push(`id = ${_req.id}`);
      }
      if (_req.device_id > 0) {
        condition_list.push(`device_id = ${_req.device_id}`);
      }
      if (_req.patient_id > 0) {
       condition_list.push(`patient_id = ${_req.patient_id}`);
     }
      if (condition_list.length > 0) {
        query = query.replace(
          /@condition/g,
          `WHERE ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace(/@condition/g, "");
      }
      var rows = await db.executeQuery(query, {
        request_status_identifier: _req.request_status_identifier,
        valid_to: _req.valid_to,
        modified_by: _req.modified_by,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        patient_order_id:_req.patient_order_id,
        patient_visit_id:_req.patient_visit_id
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(_req: DevicePeople): Promise<DevicePeople> {
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
  public async updateTransaction(db: DB, _req: DevicePeople): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        device_id: _req.device_id,
        patient_id: _req.patient_id,
        user_id: _req.user_id,
        request_status_id: _req.request_status_id,
        valid_from: _req.valid_from,
        valid_to: _req.valid_to,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
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
  public async delete(_req: DevicePeople): Promise<DevicePeople> {
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
  public async deleteTransaction(db: DB, _req: DevicePeople): Promise<void> {
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

  public async getNonDisassociatedDevices(_req: DevicePeopleWrapper): Promise<Array<DevicePeopleWrapper>> {
    let result: Array<DevicePeopleWrapper> =
    new Array<DevicePeopleWrapper>();
  try {
    await using(this.db_provider.getDisposableDB(), async (db) => {
       await db.connect();
       var query: string = this.sql_check_associated_devices;
       var condition_list: Array<string> = [];
       if (_req.device_id > 0) {
         condition_list.push(`DevicePeople.device_id = ${_req.device_id}`);
       }
      //  if (_req.patient_id > 0) {
      //   condition_list.push(`DevicePeople.patient_id = ${_req.patient_id}`);
      // }
       if (condition_list.length > 0) {
         query = query.replace(
           /@condition/g,
           `WHERE ${condition_list.join(" and ")}`
         );
       } else {
         query = query.replace(/@condition/g, "");
       }
      const rows = await db.executeQuery(query);
      if (rows.length > 0) {
        _.forEach(rows, (v) => {
          var temp: DevicePeopleWrapper = new DevicePeopleWrapper();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.device_id = v.device_id != 0 ? parseInt(v.device_id) : 0;
          temp.patient_id = v.patient_id != 0 ? parseInt(v.patient_id) : 0;
          temp.patient_order_id = v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;
          temp.patient_visit_id = v.patient_visit_id != 0 ? parseInt(v.patient_visit_id) : 0;
          temp.user_id = v.user_id != 0 ? parseInt(v.user_id) : 0;
          temp.request_status_id =
            v.request_status_id != 0 ? parseInt(v.request_status_id) : 0;
          temp.request_status_identifier = v.request_status_identifier !=null && v.request_status_identifier.length!=0?v.request_status_identifier:""
          temp.valid_from = v.valid_from;
          temp.valid_to = v.valid_to;
          temp.enterprise_id =
            v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
          temp.ent_location_id =
            v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
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
    });
  } catch (transaction_error) {
    throw transaction_error;
  }
  return result;
  }
}



