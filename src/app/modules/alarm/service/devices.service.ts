import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import { Devices, DevicesWrapper } from "../models/devices.model";
import { BaseService } from "./base.service";
import { PatientVisits } from "../models/patientvisits.model";
import { ReferenceListService } from "./referencelist.service";
import { ReferenceListModel } from "../models/referencelist.model";

export class DevicesService extends BaseService {
  sql_select: string = `
  SELECT devices.id, devices.identifier, devices.display_text, devices.manufacturer, devices.model,
  devices.type,  devices.sub_type,
  devices.category_id, devices.sub_category_id, devices.category, devices.sub_category, devices.barcode, 
  devices.class_id, devices.subclass_id, devices.auto_program_enabled, devices.auto_doc_enabled, devices.is_wearable, 
  devices.is_disposable, devices.suspended_reason_id, devices.inactive_reason_id, devices.enterprise_id, 
  devices.ent_location_id, devices.hw_version, devices.sw_version, devices.last_result_on, 
  devices.last_alarm_on, devices.attributes, devices.created_by, devices.modified_by, 
  devices.created_on, devices.modified_on, devices.is_active, devices.is_suspended,
   devices.parent_id, devices.is_factory, devices.notes, devices.device_uid
  FROM devices 
      @condition;
    `;

  sql_insert: string = `
    INSERT INTO devices(identifier, display_text, manufacturer, model, category_id, sub_category_id, type, sub_type, category, sub_category, barcode, class_id, subclass_id, auto_program_enabled, auto_doc_enabled, is_wearable, is_disposable, suspended_reason_id, inactive_reason_id, enterprise_id, ent_location_id, hw_version, sw_version, last_result_on, last_alarm_on, attributes, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
    VALUES (@identifier, @display_text, @manufacturer, @model, @category_id, @sub_category_id, @type, @sub_type, @category, @sub_category, @barcode, @class_id, @subclass_id, @auto_program_enabled, @auto_doc_enabled, @is_wearable, @is_disposable, @suspended_reason_id, @inactive_reason_id, @enterprise_id, @ent_location_id, @hw_version, @sw_version, @last_result_on, @last_alarm_on, @attributes, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes)
    RETURNING *;  
  `;

  sql_update: string = `
    UPDATE devices
    SET  identifier = @identifier, display_text = @display_text, manufacturer = @manufacturer, model = @model, category_id = @category_id, sub_category_id = @sub_category_id, type = @type, sub_type = @sub_type, category = @category, sub_category = @sub_category, barcode = @barcode, class_id = @class_id, subclass_id = @subclass_id, auto_program_enabled = @auto_program_enabled, auto_doc_enabled = @auto_doc_enabled, is_wearable = @is_wearable, is_disposable = @is_disposable, suspended_reason_id = @suspended_reason_id, inactive_reason_id = @inactive_reason_id, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, hw_version = @hw_version, sw_version = @sw_version, last_result_on = @last_result_on, last_alarm_on = @last_alarm_on, attributes = @attributes, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = `update devices set
	  is_active = false,
	  is_suspended = false
    where id = @id RETURNING * `;
  sql_toggle_suspend_device: string = `		
    update devices set
    is_suspended = @issuspend
    where id = @id RETURNING *
    `;

  sql_getdevicesforuserpoc = `
  with PointOfCareUsers
  as
  (
  select poc_id,subscriber_id userid from PointofCareSubscribers
  where subscriber_id = @member_id
  union all
  select PointofCareEscalation.poc_id ,PointofCareEscalation.escalated_to_id userid from ReferenceTypes
  inner join ReferenceValues on ReferenceValues.ref_type_id = ReferenceTypes.id
  inner join PointofCareEscalation on PointofCareEscalation.escalated_to_type_id = ReferenceValues.id
  inner join Users on Users.id = PointofCareEscalation.escalated_to_id
  where  ReferenceTypes.identifier = 'POC_ESC_TO_TYPE' and ReferenceValues.identifier = 'USER'
  and PointofCareEscalation.escalated_to_id = @member_id
  union all
  select PointofCareEscalation.poc_id,TeamMembers.member_id from ReferenceTypes
  inner join ReferenceValues on ReferenceValues.ref_type_id = ReferenceTypes.id
  inner join PointofCareEscalation on PointofCareEscalation.escalated_to_type_id = ReferenceValues.id
  inner join Teams on Teams.id = PointofCareEscalation.escalated_to_id
  inner join TeamMembers on TeamMembers.team_id = Teams.id
  where  ReferenceTypes.identifier = 'POC_ESC_TO_TYPE' and ReferenceValues.identifier = 'TEAM'
  and TeamMembers.member_id = @member_id
  )
  select distinct PatientVisits.point_of_care,Devices.id,
  Devices.identifier,Devices.display_text,Devices.manufacturer,Devices.model,Devices.type from DeviceObservations 
  inner join PatientVisits on PatientVisits.id = DeviceObservations.patient_visit_id
  inner join PointofCare on PointofCare.identifier = PatientVisits.point_of_care 
  inner join Devices on Devices.id = DeviceObservations.device_id
  inner join PointOfCareUsers on PointOfCareUsers.poc_id = PointofCare.id
  where PatientVisits.is_active = 1
    `;
  sql_get_device_by_serial_id = `SELECT id from device`;
  sql_update_device_last_result_on = `UPDATE device set last_result_on = @last_result_on where id = @id`;
  sql_update_device_last_alarm_on = `UPDATE device set last_alarm_on = @last_alarm_on where id = @id`;
  sql_get_device_for_associate = `
  select d.id, d.identifier, d.display_text,d.barcode, d.category, d.sub_category, d.class_id, dp.valid_from associated_from,
  d.manufacturer, d.model, d.type, d.sub_type,
  concat(p.first_name, ' ' , p.last_name) 
  patient_info from Devices d left join DevicePeople dp on dp.device_id = d.id 
  and dp.request_status_id  in ( select id from ReferenceValues where identifier = 'ASSOCIATED')
  left join Patients p on p.id = dp.patient_id   where d.identifier = @identifier `;
  // concat(p.first_name, ' ' , p.last_name, '|', DATEDIFF(YEAR, dob, GETDATE()), '|', gender, '|', p.identifier)

  sql_get_associated_devices = `
  select d.id, d.identifier, d.display_text, d.category, d.sub_category,d.manufacturer, d.model, d.type, d.sub_type, dp.patient_order_id, dp.valid_from associated_from,
p.id p_id, concat(p.first_name, ' ' , p.last_name, '|', p.dob, '|', gender, '|', p.identifier) patient_info, 
pv.id pv_id, pv.point_of_care, pv.admission_dttm, PO.order_status
from  DevicePeople dp inner join Devices d on dp.device_id = d.id 
and dp.request_status_id  in ( select RV.id from ReferenceValues RV, ReferenceTypes RT where RV.identifier = 'ASSOCIATED' and RV.ref_type_id = RT.id and RT.identifier = 'DEVICE_PAT')
inner join Patients p on p.id = dp.patient_id and P.is_active = 1
inner join PatientVisits pv on pv.id = dp.patient_visit_id and PV.is_active = 1
left join PatientOrders PO on po.id = dp.patient_order_id and po.is_active = 1 
left join OrderStatus OS on OS.identifier = PO.order_status`;

  public async select(_req: Devices): Promise<Array<Devices>> {
    var result: Array<Devices> = [];
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
    _req: Devices
  ): Promise<Array<Devices>> {
    var result: Array<Devices> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`Devices.id = ${_req.id}`);
      }
      if (_req.identifier != null && _req.identifier.length > 0) {
        condition_list.push(`Devices.identifier = '${_req.identifier}'`);
      }
      if (_req.manufacturer != null && _req.manufacturer.length > 0) {
        condition_list.push(`Devices.manufacturer = '${_req.manufacturer}'`);
      }
      if (condition_list.length > 0) {
        query = query.replace(
          /@condition/g,
          `WHERE ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace(
          /@condition/g,
          "where devices.is_active = 'true'"
        );
      }
      var rows = await db.executeQuery(query);
      if (rows.length > 0) {
        _.forEach(rows, v => {
          if (v != null) {
            var temp: Devices = new Devices();
            temp.id = v.id != 0 ? parseInt(v.id) : 0;
            temp.identifier =
              v.identifier != null && v.identifier.length != 0
                ? v.identifier
                : "";
            temp.device_uid =
              v.device_uid != null && v.device_uid.length != 0
                ? v.device_uid
                : "";
            temp.display_text =
              v.display_text != null && v.display_text.length != 0
                ? v.display_text
                : "";
            temp.manufacturer =
              v.manufacturer != null && v.manufacturer.length != 0
                ? v.manufacturer
                : "";
            temp.model = v.model != null && v.model.length != 0 ? v.model : "";
            temp.type = v.type != null && v.type.length != 0 ? v.type : "";
            temp.sub_type =
              v.sub_type != null && v.sub_type.length != 0 ? v.sub_type : "";
            temp.category_id =
              v.category_id != null && v.category_id != 0
                ? parseInt(v.category_id)
                : 0;
            temp.sub_category_id =
              v.sub_category_id != null && v.sub_category_id != 0
                ? parseInt(v.sub_category_id)
                : 0;
            temp.category =
              v.category != null && v.category.length != 0 ? v.category : "";
            temp.sub_category =
              v.sub_category != null && v.sub_category.length != 0
                ? v.sub_category
                : "";
            temp.barcode =
              v.barcode != null && v.barcode.length != 0 ? v.barcode : "";
            temp.class_id =
              v.class_id != null && v.class_id != 0 ? parseInt(v.class_id) : 0;
            temp.subclass_id =
              v.subclass_id != null && v.subclass_id != 0
                ? parseInt(v.subclass_id)
                : 0;
            temp.auto_program_enabled = v.auto_program_enabled;
            temp.auto_doc_enabled = v.auto_doc_enabled;
            temp.is_wearable = v.is_wearable;
            temp.is_disposable = v.is_disposable;
            temp.suspended_reason_id =
              v.suspended_reason_id != 0 ? parseInt(v.suspended_reason_id) : 0;
            temp.inactive_reason_id =
              v.inactive_reason_id != 0 ? parseInt(v.inactive_reason_id) : 0;
            temp.enterprise_id =
              v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
            temp.ent_location_id =
              v.ent_location_id != 0 ? parseInt(v.ent_location_id) : 0;
            temp.hw_version =
              v != null && v.hw_version != null && v.hw_version.length != 0
                ? v.hw_version
                : "";
            temp.sw_version =
              v != null && v.sw_version != null && v.sw_version.length != 0
                ? v.sw_version
                : "";
            temp.last_result_on = v.last_result_on;
            temp.last_alarm_on = v.last_alarm_on;

            temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
            temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
            temp.created_on = v.created_on;
            temp.modified_on = v.modified_on;
            temp.is_active = v.is_active;
            temp.is_suspended = v.is_suspended;
            temp.parent_id = v.parent_id != 0 ? parseInt(v.parent_id) : 0;
            temp.is_factory = v.is_factory;
            temp.notes =
              v != null && v.notes != null && v.notes.length != 0
                ? v.notes
                : "";
            result.push(temp);
          }
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  // async getDeviceBySerialID(device_serial_id: string): Promise<number> {
  //   let result: number = 0;
  //   try {
  //     await using(this.db_provider.getDisposableDB(), async db => {
  //       await db.connect();
  //       var qb = new this.utils.QueryBuilder(this.sql_get_device_by_serial_id);
  //       if (device_serial_id != "") {
  //         qb.addParameter("device_serial_id", device_serial_id, "=");
  //       }
  //       const rows = await db.executeQuery(this.sql_getdevicesforuserpoc, {
  //         member_id: this.user_context.user.id
  //       });
  //       if (rows.length > 0) {
  //         result = rows[0].id;
  //       }
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  //   return result;
  // }

  async getDevicesForAssociate(
    identifier: string
  ): Promise<Array<DevicesWrapper>> {
    let result: Array<DevicesWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_get_device_for_associate, {
          identifier
        });
        if (rows.length > 0) {
          _.forEach(rows, v => {
            if (v != null) {
              var temp: DevicesWrapper = new DevicesWrapper();
              temp.id = v.id != 0 ? parseInt(v.id) : 0;
              temp.identifier =
                v.identifier != null && v.identifier.length != 0
                  ? v.identifier
                  : "";
              temp.display_text =
                v.display_text != null && v.display_text.length != 0
                  ? v.display_text
                  : "";
              temp.barcode =
                v.barcode != null && v.barcode.length != 0 ? v.barcode : "";
              temp.category =
                v.category != null && v.category.length != 0 ? v.category : "";
              temp.sub_category =
                v.sub_category != null && v.sub_category.length != 0
                  ? v.sub_category
                  : "";
              temp.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";
              temp.manufacturer =
                v.manufacturer != null && v.manufacturer.length != 0
                  ? v.manufacturer
                  : "";
              temp.model =
                v.model != null && v.model.length != 0 ? v.model : "";
              temp.type = v.type != null && v.type.length != 0 ? v.type : "";
              temp.sub_type =
                v.sub_type != null && v.sub_type.length != 0 ? v.sub_type : "";
              temp.associated_from = v.associated_from;
              result.push(temp);
            }
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async getAssociatedDevices(): Promise<Array<DevicesWrapper>> {
    let result: Array<DevicesWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_get_associated_devices);
        if (rows.length > 0) {
          _.forEach(rows, v => {
            if (v != null) {
              var temp: DevicesWrapper = new DevicesWrapper();
              temp.id = v.id != 0 ? parseInt(v.id) : 0;
              temp.identifier =
                v.identifier != null && v.identifier.length != 0
                  ? v.identifier
                  : "";
              temp.display_text =
                v.display_text != null && v.display_text.length != 0
                  ? v.display_text
                  : "";
              temp.category =
                v.category != null && v.category.length != 0 ? v.category : "";
              temp.sub_category =
                v.sub_category != null && v.sub_category.length != 0
                  ? v.sub_category
                  : "";
              temp.manufacturer =
                v.manufacturer != null && v.manufacturer.length != 0
                  ? v.manufacturer
                  : "";
              temp.model =
                v.model != null && v.model.length != 0 ? v.model : "";
              temp.type = v.type != null && v.type.length != 0 ? v.type : "";
              temp.sub_type =
                v.sub_type != null && v.sub_type.length != 0 ? v.sub_type : "";
              temp.patient_visit = new PatientVisits();
              temp.patient_visit.id = v.pv_id != null ? parseInt(v.pv_id) : 0;
              temp.patient_visit.patient_id =
                v.p_id != null ? parseInt(v.p_id) : 0;
              temp.patient_visit.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";
              temp.patient_visit.point_of_care =
                v.point_of_care != null && v.point_of_care.length != 0
                  ? v.point_of_care
                  : "";
              temp.patient_visit.admission_dttm =
                v.admission_dttm != null && v.admission_dttm;
              // temp.latest_patient_medication = new PatientMedications();
              // temp.latest_patient_medication.patient_order_id = v.patient_order_idv !=null ? parseInt(v.patient_order_idv):0
              temp.associated_from = v.associated_from;
              result.push(temp);
            }
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async createInBulk(_device_list: Array<Devices>) {
    var result: Array<Devices> = new Array<Devices>();
    try {
      this.insert(_device_list);
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
      await using(this.db_provider.getDisposableDB(), async db => {
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
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_update_device_last_alarm_on,
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

  public async insert(_req: Array<Devices>): Promise<Array<Devices>> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        try {
          db.beginTransaction();
          await this.insertTransaction(db, _req);
          db.commitTransaction();
        } catch (err) {
          db.rollbackTransaction();
          throw err;
        }
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }

  public async insertTransaction(
    db: DB,
    _req: Array<Devices>
  ): Promise<Array<Devices>> {
    try {
      for (var i = 0, length = _req.length; i < length; i++) {
        var device_item = _req[i];
        device_item.created_on = new Date();
        device_item.is_active = true;

        var error = [];
        if (
          device_item.display_text == undefined ||
          device_item.display_text.length == 0
        ) {
          error.push("Name");
        }
        if (
          device_item.identifier == undefined ||
          device_item.identifier.length == 0
        ) {
          error.push("Serial No");
        }
        if (error.length > 0) {
          var err = error.join(", ");
          if (error.length == 1) {
            err += " field empty";
          } else {
            err += " fields are empty";
          }
          device_item.error = err;
        } else {
          device_item.error = undefined;
        }

        /* Check serial no already exists or not */
        var _req_device = new Devices();
        _req_device.identifier = device_item.identifier;
        _req_device.manufacturer = device_item.manufacturer;
        var _resp_device_list = await this.selectTransaction(db, _req_device);
        if (_resp_device_list.length > 0) {
          error.push("Serial no already exists");
          device_item.error = "Serial no already exists";
        }

        if (error.length == 0) {
          let rows = await db.executeQuery(this.sql_insert, {
            identifier: device_item.identifier,
            display_text: device_item.display_text,
            manufacturer: device_item.manufacturer,
            model: device_item.model,
            category_id: device_item.category_id,
            sub_category_id: device_item.sub_category_id,
            type: device_item.type,
            sub_type: device_item.sub_type,
            category: device_item.category,
            sub_category: device_item.sub_category,
            barcode: device_item.barcode,
            class_id: device_item.class_id,
            subclass_id: device_item.subclass_id,
            auto_program_enabled: device_item.auto_program_enabled,
            auto_doc_enabled: device_item.auto_doc_enabled,
            is_wearable: device_item.is_wearable,
            is_disposable: device_item.is_disposable,
            suspended_reason_id: device_item.suspended_reason_id,
            inactive_reason_id: device_item.inactive_reason_id,
            enterprise_id: device_item.enterprise_id,
            ent_location_id: device_item.ent_location_id,
            hw_version: device_item.hw_version,
            sw_version: device_item.sw_version,
            last_result_on: device_item.last_result_on,
            last_alarm_on: device_item.last_alarm_on,
            attributes: device_item.attributes,
            created_by: device_item.created_by,
            modified_by: device_item.modified_by,
            created_on: device_item.created_on,
            modified_on: device_item.modified_on,
            is_active: device_item.is_active,
            is_suspended: device_item.is_suspended,
            parent_id: device_item.parent_id,
            is_factory: device_item.is_factory,
            notes: device_item.notes
          });

          if (rows.length > 0) {
            let row = rows[0];
            device_item.id = row.id != null ? parseInt(row.id) : 0;
          }
        }
      }
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async update(_req: Devices): Promise<Devices> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();

        await this.updateTransaction(db, _req);

        var service: ReferenceListService = new ReferenceListService();
        let arr = [
          {
            name: _req.manufacturer,
            code: ReferenceListModel.TYPES.DEVICE_MANF
          },
          { name: _req.model, code: ReferenceListModel.TYPES.DEVICE_MODEL },
          { name: _req.type, code: ReferenceListModel.TYPES.DEVICE_TYPE }
        ];
        for (var i = 0; i < 3; i++) {
          let req_ref = new ReferenceListModel();
          req_ref.identifier = arr[i].code;
          let res_ref = await service.getReferenceList(req_ref);
          let req = new ReferenceListModel();
          req.display_text = arr[i].name;
          req.identifier = req.display_text.toUpperCase();
          req.is_active = true;
          req.ref_type_id = res_ref[0].ref_type_id;
          req.created_on = new Date();
          var manufacturer_data = [];
          manufacturer_data = await service.getReferenceList(req);
          if (manufacturer_data.length == 0) {
            await service.insertReferenceList(req);
          }
        }
      });
    } catch (error) {
      var e = error;
      throw error;
    }
    return _req;
  }
  public async updateTransaction(db: DB, _req: Devices): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        identifier: _req.identifier,
        display_text: _req.display_text,
        manufacturer: _req.manufacturer,
        model: _req.model,
        type: _req.type,
        sub_type: _req.sub_type,
        category_id: _req.category_id,
        sub_category_id: _req.sub_category_id,
        category: _req.category,
        sub_category: _req.sub_category,
        barcode: _req.barcode,
        class_id: _req.class_id,
        subclass_id: _req.subclass_id,
        auto_program_enabled: _req.auto_program_enabled,
        auto_doc_enabled: _req.auto_doc_enabled,
        is_wearable: _req.is_wearable,
        is_disposable: _req.is_disposable,
        suspended_reason_id: _req.suspended_reason_id,
        inactive_reason_id: _req.inactive_reason_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        hw_version: _req.hw_version,
        sw_version: _req.sw_version,
        last_result_on: _req.last_result_on,
        last_alarm_on: _req.last_alarm_on,
        attributes: _req.attributes,
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
      let e: any = error;
      let err = new ErrorResponse();
      err.message = `Error on updating device with barcode ${_req.barcode}`;
      throw err;
    }
  }
  public async deleteDeviceInBulk(_req: Devices): Promise<Devices> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        try {
          db.beginTransaction();
          await this.deleteTransaction(db, _req);
          db.commitTransaction();
        } catch (err) {
          db.rollbackTransaction();
          throw err;
        }
      });
    } catch (error) {
      {
        let e: any = error;
        let err = new ErrorResponse<Devices>();
        err.success = false;
        err.code = e.code;
        err.error = e.error;
        err.message = e.message;
        err.item = _req;
        err.exception = e.stack;
      }
    }
    return _req;
  }
  public async deleteTransaction(db: DB, _req: Devices): Promise<void> {
    try {
      // for (var i = 0, length = _req.length; i < length; i++) {
      _req.modified_on = new Date();

      var rows = await db.executeQuery(this.sql_delete, { id: _req.id });

      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
      // }
    } catch (error) {
      throw error;
    }
  }

  public async togglesuspendDeviceInBulk(_req: Devices): Promise<Devices> {
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        try {
          db.beginTransaction();
          await this.togglesuspendDeviceInBulkTransaction(db, _req);
          db.commitTransaction();
        } catch (err) {
          db.rollbackTransaction();
          throw err;
        }
      });
    } catch (error) {
      let e: any = error;
      let err = new ErrorResponse<Devices>();
      err.success = false;
      err.code = e.code;
      err.error = e.error;
      err.message = e.message;
      err.item = _req;
      err.exception = e.stack;
    }
    return _req;
  }
  public async togglesuspendDeviceInBulkTransaction(
    db: DB,
    _req: Devices
  ): Promise<void> {
    try {
      _req.modified_on = new Date();
      const { id, is_suspended } = _req;
      var issuspend: boolean;
      issuspend = _req.is_suspended;
      // issuspend = !_req.is_suspended
      var temp = _req.is_suspended;
      console.log("temp", temp);
      temp ? (issuspend = false) : (issuspend = true);
      console.log("temp after if", temp, issuspend);
      var rows = await db.executeQuery(this.sql_toggle_suspend_device, {
        id,
        issuspend
      });

      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  async getdevicesforuserpoc(
    device: DevicesWrapper = new DevicesWrapper()
  ): Promise<Array<DevicesWrapper>> {
    var result: Array<DevicesWrapper> = new Array<DevicesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        var query_string = "";
        query_string = this.sql_getdevicesforuserpoc;
        if (device.identifier && device.identifier.length > 0) {
          query_string += `and Devices.identifier = ${device.identifier}`;
        }
        const rows = await db.executeQuery(query_string, {
          member_id: this.user_context.user.id
        });
        _.forEach(rows, v => {
          if (v != null) {
            let push_data = new DevicesWrapper();
            push_data.id = v.id != null ? parseInt(v.id) : 0;
            push_data.category =
              v.category != null && v.category.length != 0 ? v.category : "";
            push_data.identifier =
              v.identifier != null && v.identifier.length != 0
                ? v.identifier
                : "";
            push_data.display_text =
              v.display_text != null && v.display_text.length != 0
                ? v.display_text
                : "";
            push_data.manufacturer =
              v.manufacturer != null && v.manufacturer.length != 0
                ? v.manufacturer
                : "";
            push_data.model =
              v.model != null && v.model.length != 0 ? v.model : "";
            push_data.type = v.type != null && v.type.length != 0 ? v.type : "";
            push_data.sub_type =
              v.sub_type != null && v.sub_type.length != 0 ? v.sub_type : "";
            push_data.has_alarm =
              v.has_alarm != null && v.has_alarm == 0 ? true : false;
            result.push(push_data);
          }
        });
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
}
