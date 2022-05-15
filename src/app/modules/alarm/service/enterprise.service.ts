import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import {
  EnterpriseAssociation,
  Enterprise,
  EnterpriseHierarchyListModel,
} from "../models/enterprise.model";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";

export class EnterpriseService extends BaseService {
  sql_get_enterprises: string = `SELECT enterprisehierarchy.id, enterprisehierarchy.code, enterprisehierarchy.display_text, enterprisehierarchy.address_line_1,
	enterprisehierarchy.zipcode, enterprisehierarchy.locality,
	enterprisehierarchy.phone_1, enterprisehierarchy.email, enterprisehierarchy.is_active,
	enterprisehierarchy.created_on, 
	 enterprisehierarchy.modified_on,enterprisehierarchy.image_id, enterprisehierarchy.app_id
	from enterprisehierarchy order by id desc`;
  sql_load_enterprise_for_mapping: string = `SELECT enterprisehierarchy.id, enterprisehierarchy.display_text from enterprisehierarchy order by display_text`;
  sql_get_enterprise_by_id: string = `SELECT  enterprisehierarchy.id,
  enterprisehierarchy.ent_type_id,
  enterprisehierarchy.identifier,
  enterprisehierarchy.short_name,
  enterprisehierarchy.display_text,
  enterprisehierarchy.is_master_org,
  enterprisehierarchy.image_id,
  enterprisehierarchy.timezone_id,
  enterprisehierarchy.is_point_of_care,
  enterprisehierarchy.lang_code,
  enterprisehierarchy.created_by,
  enterprisehierarchy.modified_by,
  enterprisehierarchy.created_on,
  enterprisehierarchy.modified_on,
  enterprisehierarchy.is_active,
  enterprisehierarchy.is_suspended,
  enterprisehierarchy.parent_id,
  enterprisehierarchy.is_factory,
  enterprisehierarchy.notes
	from enterprisehierarchy where id = @id`;
  // sql_get_enterprises: string = "select concat('name:''', name, ''', ', 'code:''', code, ''', ', 'line1:''', address, '''') from organization order by id desc limit 1";
  sql_update_enterprise: string = `update enterprisehierarchy set ent_type_id = @set ent_type_id, identifier = @identifier, short_name = @short_name, 
	display_text = @display_text, is_master_org = @is_master_org, image_id = @image_id, timezone_id = @timezone_id, is_point_of_care = @is_point_of_care, lang_code = @lang_code,created_by = @created_by ,
  modified_by = @modified_by, created_on = @created_on,
	modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes, where id = @id RETURNING *`;

  /* unused */
  // sql_update_enterprise_status: string = `update enterprisehierarchy set isactive = @isactive, version = version + 1 
	// where id = @id RETURNING *`;

  sql_insert_enterprise: string = `insert into enterprisehierarchy (
    enterprisehierarchy.ent_type_id,
    enterprisehierarchy.identifier,
    enterprisehierarchy.short_name,
    enterprisehierarchy.display_text,
    enterprisehierarchy.is_master_org,
    enterprisehierarchy.image_id,
    enterprisehierarchy.timezone_id,
    enterprisehierarchy.is_point_of_care,
    enterprisehierarchy.lang_code,
    enterprisehierarchy.created_by,
    enterprisehierarchy.modified_by,
    enterprisehierarchy.created_on,
    enterprisehierarchy.modified_on,
    enterprisehierarchy.is_active,
    enterprisehierarchy.is_suspended,
    enterprisehierarchy.parent_id,
    enterprisehierarchy.is_factory,
    enterprisehierarchy.notes) values (@ent_type_id, @identifier, @short_name, @display_text, @is_master_org, @image_id, @timezone_id, @is_point_of_care, @lang_code, @created_by,
       @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes) RETURNING *`;

  sql_image_enterprises: string = `
		update enterprisehierarchy set
			image_id = @image_id
		where id = @id RETURNING *
	`;
  sql_enterprise_hierarchy_list: string = `select EnterpriseHierarchy.id as eid,EnterpriseHierarchy.display_text enterprisename,pointofcare_id,room_id,Beds.id bedid,
  beds.display_text bedname,PointofCare.display_text pocname,Rooms.display_text roomname
  from EnterpriseHierarchy
  left outer join PointofCare on PointofCare.ent_hierarchy_parent_id = EnterpriseHierarchy.id
  left outer join rooms on  PointofCare.id = Rooms.pointofcare_id
  left outer join Beds on  rooms.id = beds.room_id`

  async getEnterprises(): Promise<Array<Enterprise>> {
    let result: Array<Enterprise> = new Array<Enterprise>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(this.sql_get_enterprises);
        _.forEach(rows, (v, k) => {
          var enterprise = new Enterprise(v);
          result.push(enterprise);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<Enterprise>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: null,
        exception: error.stack,
      });
    }
    return result;
  }

  async loadEnterprises(): Promise<Array<EnterpriseAssociation>> {
    let result: Array<EnterpriseAssociation> =
      new Array<EnterpriseAssociation>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(
          this.sql_load_enterprise_for_mapping
        );
        _.forEach(rows, (v, k) => {
          var enterprise_association = new EnterpriseAssociation(v);
          result.push(enterprise_association);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<Enterprise>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: null,
        exception: error.stack,
      });
    }
    return result;
  }

  async getEnterpriseById(
    _enterprise: Enterprise
  ): Promise<Enterprise> {
    let result: Enterprise = new Enterprise();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const { id } = _enterprise;
        const rows = await db.executeQuery(this.sql_get_enterprise_by_id, {id});
        _.forEach(rows, (v, k) => {
          result = new Enterprise(v);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<Enterprise>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _enterprise,
        exception: error.stack,
      });
    }
    return result;
  }

  async updateEnterprise(
    _enterprise: Enterprise
  ): Promise<Enterprise> {
    // console.log("server side content", _enterprise);
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();

        const rows = await db.executeQuery(this.sql_update_enterprise, {
          id: _enterprise.id,
          ent_type_id: _enterprise.ent_type_id,
          identifier: _enterprise.identifier,
          short_name: _enterprise.short_name,
          display_text: _enterprise.display_text,
          is_master_org: _enterprise.is_master_org,
          image_id: _enterprise.image_id,
          timezone_id: _enterprise.timezone_id,
          is_point_of_care: _enterprise.is_point_of_care,
          lang_code: _enterprise.lang_code,
          created_by: _enterprise.created_by,
          modified_by: _enterprise.modified_by,
          created_on: _enterprise.created_on,
          modified_on: _enterprise.modified_on,
          is_active: _enterprise.is_active,
          is_suspended: _enterprise.is_suspended,
          parent_id: _enterprise.parent_id,
          is_factory: _enterprise.is_factory,
          notes: _enterprise.notes,
        });
        if (rows.length > 0) {
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<Enterprise>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _enterprise,
        exception: error.stack,
      });
    }
    return _enterprise;
  }

  async insertEnterprise(
    _enterprise: Enterprise
  ): Promise<Enterprise> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
          const rows = await db.executeQuery(this.sql_insert_enterprise, {
          ent_type_id: _enterprise.ent_type_id,
          identifier: _enterprise.identifier,
          short_name: _enterprise.short_name,
          display_text: _enterprise.display_text,
          is_master_org: _enterprise.is_master_org,
          image_id: _enterprise.image_id,
          timezone_id: _enterprise.timezone_id,
          is_point_of_care: _enterprise.is_point_of_care,
          lang_code: _enterprise.lang_code,
          created_by: _enterprise.created_by,
          modified_by: _enterprise.modified_by,
          created_on: _enterprise.created_on,
          modified_on: _enterprise.modified_on,
          is_active: _enterprise.is_active,
          version: _enterprise.version,
          is_suspended: _enterprise.is_suspended,
          parent_id: _enterprise.parent_id,
          is_factory: _enterprise.is_factory,
          notes: _enterprise.notes,
        });
        if (rows.length > 0) {
          let row = rows[0];
          _enterprise.id = row.id != null ? parseInt(row.id) : 0;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<Enterprise>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _enterprise,
        exception: error.stack,
      });
    }
    return _enterprise;
  }

  async updateImage(_req: Enterprise): Promise<Enterprise> {
    let result: Enterprise = new Enterprise();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // const { id, image_id } = _req;
        // await db.executeQuery("BEGIN");

        const rows = await db.executeQuery(this.sql_image_enterprises, {
          id:_req.id,
          image_id:_req.image_id,
        });
        if (rows.length > 0) {
        }

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;

      throw new ErrorResponse<Enterprise>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }

  async getEnterpriseHierarchyList(): Promise<Array<EnterpriseHierarchyListModel>> {
    let result: Array<EnterpriseHierarchyListModel> = new Array<EnterpriseHierarchyListModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(this.sql_enterprise_hierarchy_list);
        _.forEach(rows, (v, k) => {
          var enterprise = new EnterpriseHierarchyListModel();
          enterprise.eid = v.eid != 0 ? parseInt(v.eid) : 0;
          enterprise.enterprisename = (v != null && v.enterprisename != "" ? v.enterprisename : "");
          enterprise.pointofcare_id = v.pointofcare_id != 0 ? parseInt(v.pointofcare_id) : 0;
          enterprise.room_id = v.room_id != 0 ? parseInt(v.room_id) : 0;
          enterprise.bedid = v.bedid !=0 ? parseInt(v.bedid) : 0;
          enterprise.bedname = (v != null && v.bedname != "" ? v.bedname : "");
          enterprise.pocname =  (v != null && v.pocname != "" ? v.pocname : "");
          enterprise.roomname = (v != null && v.roomname != "" ? v.roomname : "");
          result.push(enterprise);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<EnterpriseHierarchyListModel>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: null,
        exception: error.stack,
      });
    }
    return result;
  }
}
