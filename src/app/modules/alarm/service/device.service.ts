import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import PointofcareService from "./pointofcare.service";
import { DeviceModel, DeviceModelCreteria } from "../models/device.model";

export class DeviceService extends BaseService {
  constructor() {
    super();
  }
  sql_update_device_last_result_on = `UPDATE devices set last_result_on = @last_result_on where id = @id RETURNING id`;
  sql_update_device_last_alarm_on = `UPDATE devices set last_alarm_on = @last_alarm_on where id = @idRETURNING id`;
  sql_get_device_by_serial_id = `SELECT id from devices`;
  sql_get = `
    SELECT 
        id,
        created_on,
        modified_on,
        is_active,
        display_text,
        is_suspended,
        ent_location_id,
        enterprise_id,
        category_id,
        identifier,
        barcode,
        is_suspended,
        suspended_reason_id,
		    created_by,
        modified_by
	FROM devices`;

  sql_getdevicesforuserpoc = `
	with devices_from_observation as (
		select distinct device_id
		from deviceobservation
		where patient_visit_id in ( $1::int[] )
	)
	select distinct
		d.id,
		d.category,
		d.identifier,
		d.display_text,
		(a.id is not NULL) has_alarm
	from devices_from_observation dfb
	inner join devices d on d.id = dfb.device_id
	left join alarmobservation a on a.device_id = d.id and a.alarm_status <> 'accepted' and a.patient_visit_id in ( $1::int[] )
	`;
  sql_insert = `
    INSERT INTO devices
    (
        created_by,
        created_on,
        is_active,
        display_text,
        category_id,
        sub_category_id,        
        identifier,
        barcode,
        category,
        sub_category,
        enterprise_id,
        ent_location_id,
        device_uid
        )
    VALUES (@created_by,
      @created_on,
      @is_active,
      @display_text,
      @category_id,
      @sub_category_id,        
      @identifier,
      @barcode,
      @category,
      @sub_category,
      @enterprise_id,
      @ent_location_id,
      @display_text)
    returning *
    `;
  sql_update = `
    UPDATE devices
    SET 
        modified_by =@modified_by,
        modified_on =@modified_on,
        is_active =@is_active,
        display_text =@display_text,
        category =@category,
        identifier =@identifier,
        barcode =@barcode,
        is_suspended =@is_suspended,
        suspended_reason_id =@suspended_reason_id
    WHERE id = @id and version = @version
    returning *;
	`;
  sql_delete_device: string = `update devices set
	is_active = false,
	is_suspended = false
where id = @id RETURNING *`;
  sql_toggle_suspend_device: string = `		
	update devices set
	is_suspended = @is_suspended
	where id = @id RETURNING *
	`;

  async get(
    device: DeviceModel = new DeviceModel()
  ): Promise<Array<DeviceModel>> {
    var result: Array<DeviceModel> = new Array<DeviceModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_get);
        qb.addParameter("is_active", device.is_active, "=");
        if (device.id != 0) {
          qb.addParameter("id", device.id, "=");
        }
        var query_string = qb.getQuery();
        const rows = await db.executeQuery(query_string);
        _.forEach(rows, (v) => {
          result.push(new DeviceModel(v));
        });
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getdevicesforuserpoc(): Promise<Array<DeviceModelCreteria>> {
    var result: Array<DeviceModelCreteria> = new Array<DeviceModelCreteria>();
    try {
      let pointofcare_service = new PointofcareService();
      let user_poc_list = await pointofcare_service.getPointofcareForUser();
      let poc_id_list = _.map(user_poc_list, (v) => {
        return v.id;
      });
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_getdevicesforuserpoc, [
          poc_id_list,
        ]);
        _.forEach(rows, (v) => {
          result.push(new DeviceModelCreteria(v));
        });
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async getDeviceBySerialID(device_serial_id: string): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_get_device_by_serial_id);
        if (device_serial_id != "") {
          qb.addParameter("identifier", device_serial_id, "=");
        }
        var query_string = qb.getQuery();
        const rows = await db.executeQuery(query_string);
        if (rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async createInBulk(_device_list: Array<DeviceModel>) {
    var result: Array<DeviceModel> = new Array<DeviceModel>();
    try {
      // var enterprise_service = new EnterpriseService();
      // var enterprise_list = await enterprise_service.getEnterprises();
      // var location_service = new LocationService();
      // var location_list = await location_service.getLocations();
      await using(this.db_provider.getDisposableDB(), async (db) => {
        var client = await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _device_list.length; i < length; i++) {
            var device_item = _device_list[i];
            const rows = await db.executeQuery(this.sql_insert, {
              created_by: device_item.created_by,
              created_on: new Date(),
              is_active: device_item.is_active,
              display_text: device_item.device_name,
              category_id: -1,
              sub_category_id: -1,
              identifier: device_item.device_serial_id,
              barcode: device_item.device_barcode,
              category: device_item.device_type,
              sub_category: device_item.device_sub_type,
              enterprise_id: -1,
              ent_location_id: -1,
            });
            _.forEach(rows, (v, k) => {
              var device = new DeviceModel(v);
              result.push(device);
            });
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async update_result_received(
    _deviceid: Number,
    _receivedon: Date
  ): Promise<Boolean> {
    let result: boolean = false;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_update_device_last_result_on,
          { last_result_on: _receivedon, id: _deviceid }
        );
        if (rows.length > 0) {
          result = true;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async update_alarm_received(
    _deviceid: Number,
    _receivedon: Date
  ): Promise<Boolean> {
    let result: boolean = false;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_update_device_last_alarm_on,
          { last_alarm_on: _receivedon, id: _deviceid }
        );
        if (rows.length > 0) {
          result = true;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async update(_device: DeviceModel) {
    var result: DeviceModel = new DeviceModel();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        var client = await db.connect();
        const rows = await db.executeQuery(this.sql_update, {
          modified_by: _device.modified_by,
          modified_on: new Date(),
          is_active: _device.is_active,
          display_text: _device.device_name,
          category: _device.device_type,
          identifier: _device.device_serial_id,
          barcode: _device.device_barcode,
          is_suspended: _device.out_of_service,
          suspended_reason_id: _device.out_of_service_reason,
          id: _device.id,
        });
        if (_.has(rows, "0")) {
          result = new DeviceModel(rows[0]);
        } else {
          throw new ErrorResponse({
            message: `Error on updating device with barcode ${_device.device_barcode}`,
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async deleteDeviceInBulk(
    _device_list: Array<DeviceModel>
  ): Promise<Array<DeviceModel>> {
    let result: Array<DeviceModel> = new Array<DeviceModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.executeQuery("db.beginTransaction()");
          for (var i = 0, length = _device_list.length; i < length; i++) {
            const { id } = _device_list[i];

            const rows = await db.executeQuery(this.sql_delete_device, { id });
            if (rows.length > 0) {
              result.push(new DeviceModel(rows[0]));
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (e) {
      // throw transaction_error;
      let error: any = e;
      throw new ErrorResponse<DeviceModel>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _device_list,
        exception: error.stack,
      });
    }
    return result;
  }
  async togglesuspendDeviceInBulk(
    _roleprofile_list: Array<DeviceModel>
  ): Promise<Array<DeviceModel>> {
    let result: Array<DeviceModel> = new Array<DeviceModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.executeQuery("db.beginTransaction()");
          for (var i = 0, length = _roleprofile_list.length; i < length; i++) {
            const { id, is_suspended } = _roleprofile_list[i];
            //
            var issuspend: boolean;
            var temp = _roleprofile_list[i].is_suspended;
            console.log("temp", temp);
            temp ? (issuspend = false) : (issuspend = true);
            console.log("temp after if", temp, issuspend);
            //
            const rows = await db.executeQuery(this.sql_toggle_suspend_device, {
              id,
              is_suspended: issuspend,
            });
            if (rows.length > 0) {
              result.push(new DeviceModel(rows[0]));
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (e) {
      let error: any = e;
      throw new ErrorResponse<DeviceModel>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _roleprofile_list,
        exception: error.stack,
      });
    }
    return result;
  }
}
