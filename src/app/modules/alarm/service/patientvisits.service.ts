import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  PatientVisits,
  PatientVisitsWrapper
} from "../models/patientvisits.model";
import { BaseService } from "./base.service";

export class PatientVisitsService extends BaseService {
  sql_select: string = `
      SELECT patientvisits.id, patientvisits.ihe_msg_id, patientvisits.patient_id, patientvisits.visit_number, patientvisits.visited_on, patientvisits.patient_type_id, patientvisits.patient_adm_class_id, patientvisits.patient_adm_class, patientvisits.admission_dttm, patientvisits.patient_financial_class, patientvisits.point_of_care, patientvisits.room, patientvisits.bed, patientvisits.floor, patientvisits.facility, patientvisits.building, patientvisits.patient_height, patientvisits.patient_height_uom, patientvisits.patient_weight, patientvisits.patient_weight_uom, patientvisits.diagnosis_code, patientvisits.attending_dr_code, patientvisits.attending_dr_family_name, patientvisits.attending_dr_given_name, patientvisits.attending_dr_assigning_authority_code, patientvisits.attending_dr_assigning_authority_type, patientvisits.admitting_dr_code, patientvisits.admitting_dr_family_name, patientvisits.admitting_dr_given_name, patientvisits.admitting_dr_assigning_authority_code, patientvisits.admitting_dr_assigning_authority_type, patientvisits.enterprise_id, patientvisits.ent_location_id, patientvisits.row_key, patientvisits.created_by, patientvisits.modified_by, patientvisits.created_on, patientvisits.modified_on, patientvisits.is_active, patientvisits.is_suspended, patientvisits.parent_id, patientvisits.is_factory, patientvisits.notes, patientvisits.attributes, patientvisits.has_device_association
      FROM patientvisits 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO patientvisits(ihe_msg_id, patient_id, visit_number, visited_on, patient_type_id, patient_adm_class_id, patient_adm_class, admission_dttm, patient_financial_class, point_of_care, room, bed, floor, facility, building, patient_height, patient_height_uom, patient_weight, patient_weight_uom, diagnosis_code, attending_dr_code, attending_dr_family_name, attending_dr_given_name, attending_dr_assigning_authority_code, attending_dr_assigning_authority_type, admitting_dr_code, admitting_dr_family_name, admitting_dr_given_name, admitting_dr_assigning_authority_code, admitting_dr_assigning_authority_type, enterprise_id, ent_location_id, row_key, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes, attributes, has_device_association)
VALUES (@ihe_msg_id, @patient_id, @visit_number, @visited_on, @patient_type_id, @patient_adm_class_id, @patient_adm_class, @admission_dttm, @patient_financial_class, @point_of_care, @room, @bed, @floor, @facility, @building, @patient_height, @patient_height_uom, @patient_weight, @patient_weight_uom, @diagnosis_code, @attending_dr_code, @attending_dr_family_name, @attending_dr_given_name, @attending_dr_assigning_authority_code, @attending_dr_assigning_authority_type, @admitting_dr_code, @admitting_dr_family_name, @admitting_dr_given_name, @admitting_dr_assigning_authority_code, @admitting_dr_assigning_authority_type, @enterprise_id, @ent_location_id, @row_key, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes, @attributes, @has_device_association)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE patientvisits
    SET  ihe_msg_id = @ihe_msg_id, patient_id = @patient_id, visit_number = @visit_number, visited_on = @visited_on, patient_type_id = @patient_type_id, patient_adm_class_id = @patient_adm_class_id, patient_adm_class = @patient_adm_class, admission_dttm = @admission_dttm, patient_financial_class = @patient_financial_class, point_of_care = @point_of_care, room = @room, bed = @bed, floor = @floor, facility = @facility, building = @building, patient_height = @patient_height, patient_height_uom = @patient_height_uom, patient_weight = @patient_weight, patient_weight_uom = @patient_weight_uom, diagnosis_code = @diagnosis_code, attending_dr_code = @attending_dr_code, attending_dr_family_name = @attending_dr_family_name, attending_dr_given_name = @attending_dr_given_name, attending_dr_assigning_authority_code = @attending_dr_assigning_authority_code, attending_dr_assigning_authority_type = @attending_dr_assigning_authority_type, admitting_dr_code = @admitting_dr_code, admitting_dr_family_name = @admitting_dr_family_name, admitting_dr_given_name = @admitting_dr_given_name, admitting_dr_assigning_authority_code = @admitting_dr_assigning_authority_code, admitting_dr_assigning_authority_type = @admitting_dr_assigning_authority_type, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, row_key = @row_key, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes, attributes = @attributes, has_device_association = @has_device_association
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM patientvisits
   WHERE id = @id
   RETURNING *; `;

  sql_get_patients_and_latest_visit = `select 
   pv.id, concat(p.first_name, ' ' , p.last_name, '|', 
   dob, '|', gender, '|', p.identifier) patient_info,
   pv.patient_id, pv.visited_on, pv.point_of_care, pv.room, pv.bed, pv.building, 
   pv.floor, pv.facility, pv.patient_adm_class, pv.patient_adm_class_id from Patientvisits pv 
   inner JOIN patients p on p.id = pv.patient_id
   where pv.is_active = 1`;

  sql_get_patient_and_visit_connector = `SELECT TOP 1 PV.id ,P.id patient_id,concat(p.first_name, ' ' , p.last_name, '|', 
    p.dob, '|', gender, '|', p.identifier) patient_info, PV.admission_dttm, PV.point_of_care, PV.room, PV.bed, pv.visit_number
    FROM PatientVisits PV, Patients P WHERE P.identifier = @identifier AND PV.patient_id = P.id ORDER BY PV.ID DESC`;

  sql_get_patient_and_visit_for_ordercode = ` SELECT TOP 1 PV.id, PO.id patient_order_id,P.id patient_id,concat(p.first_name, ' ' , p.last_name, '|', 
    p.dob, '|', gender, '|', p.identifier) patient_info, PV.admission_dttm, PV.point_of_care, PV.room, PV.bed, pv.visit_number
    FROM PatientVisits PV,PatientOrders PO, Patients P WHERE PO.order_code = @order_code AND PO.patient_id = P.id ORDER BY PV.ID DESC `;

  sql_get_patient_and_visit_for_device = `select 
  PatientVisits.id, PatientOrders.id patient_order_id,PatientOrders.order_code, PatientOrders.order_status,
  Patients.id patient_id, concat(Patients.first_name, ' ' , Patients.last_name, '|', 
   Patients.dob, '|', gender, '|', Patients.identifier) patient_info, 
   PatientVisits.admission_dttm, PatientVisits.point_of_care, PatientVisits.room, PatientVisits.bed, PatientVisits.visit_number
  from DevicePeople 
  inner join ReferenceValues on ReferenceValues.id = DevicePeople.request_status_id and ReferenceValues.identifier = 'ASSOCIATED'
  inner join PatientVisits on  PatientVisits.id  = DevicePeople.patient_visit_id 
  inner Join Patients on Patients.id = DevicePeople.patient_id
  inner Join PatientOrders on PatientOrders.id =  DevicePeople.patient_order_id
  where DevicePeople.device_id = @device_id `;

  //  `
  //   select
  //   pv.id, concat(p.given_name, ' ' , p.family_name, '|',
  //   date_of_birth, '|', gender, '|', p.patient_id) patient_info,
  //   pv.patient_id, pv.visited_on, pv.nursing_unit, pv.room, pv.bed, pv.building,
  //   pv.floor, pv.facility, pc.ref_value_display_text patient_class
  //   from Patientvisits pv
  //   inner JOIN patient p on p.id = pv.patient_id
  //   inner JOIN referencelist pc on pv.patient_class = pc.ref_value_code and pc.ref_type_code = 'PATIENT_CLASS'
  //   where pv.is_active = true
  //   `;

  public async select(_req: PatientVisits): Promise<Array<PatientVisits>> {
    var result: Array<PatientVisits> = [];
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
    _req: PatientVisits
  ): Promise<Array<PatientVisits>> {
    var result: Array<PatientVisits> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`PatientVisits.id = ${_req.id}`);
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
          if (v != null) {
            var temp: PatientVisits = new PatientVisits();
            temp.id = v.id != 0 ? parseInt(v.id) : 0;
            temp.ihe_msg_id = v.ihe_msg_id != 0 ? parseInt(v.ihe_msg_id) : 0;
            temp.patient_id = v.patient_id != 0 ? parseInt(v.patient_id) : 0;
            temp.visit_number =
              v.visit_number != null && v.visit_number.length != 0
                ? v.visit_number
                : "";
            temp.visited_on = v.visited_on;
            temp.patient_type_id =
              v.patient_type_id != 0 ? parseInt(v.patient_type_id) : 0;
            temp.patient_adm_class_id =
              v.patient_adm_class_id != 0
                ? parseInt(v.patient_adm_class_id)
                : 0;
            temp.patient_adm_class =
              v.patient_adm_class != null && v.patient_adm_class.length != 0
                ? v.patient_adm_class
                : "";
            temp.admission_dttm = v.admission_dttm;
            temp.patient_financial_class =
              v.patient_financial_class != null &&
              v.patient_financial_class.length != 0
                ? v.patient_financial_class
                : "";
            temp.point_of_care =
              v.point_of_care != null && v.point_of_care.length != 0
                ? v.point_of_care
                : "";
            temp.room = v.room != null && v.room.length != 0 ? v.room : "";
            temp.bed = v.bed != null && v.bed.length != 0 ? v.bed : "";
            temp.floor = v.floor != null && v.floor.length != 0 ? v.floor : "";
            temp.facility =
              v.facility != null && v.facility.length != 0 ? v.facility : "";
            temp.building =
              v.building != null && v.building.length != 0 ? v.building : "";
            temp.patient_height =
              v.patient_height != null && v.patient_height.length != 0
                ? v.patient_height
                : "";
            temp.patient_height_uom =
              v.patient_height_uom != null && v.patient_height_uom.length != 0
                ? v.patient_height_uom
                : "";
            temp.patient_weight =
              v.patient_weight != null && v.patient_weight.length != 0
                ? v.patient_weight
                : "";
            temp.patient_weight_uom =
              v.patient_weight_uom != null && v.patient_weight_uom.length != 0
                ? v.patient_weight_uom
                : "";
            temp.diagnosis_code =
              v.diagnosis_code != null && v.diagnosis_code.length != 0
                ? v.diagnosis_code
                : "";
            temp.attending_dr_code =
              v.attending_dr_code != null && v.attending_dr_code.length != 0
                ? v.attending_dr_code
                : "";
            temp.attending_dr_family_name =
              v.attending_dr_family_name != null &&
              v.attending_dr_family_name.length != 0
                ? v.attending_dr_family_name
                : "";
            temp.attending_dr_given_name =
              v.attending_dr_given_name != null &&
              v.attending_dr_given_name.length != 0
                ? v.attending_dr_given_name
                : "";
            temp.attending_dr_assigning_authority_code =
              v.attending_dr_assigning_authority_code != null &&
              v.attending_dr_assigning_authority_code.length != 0
                ? v.attending_dr_assigning_authority_code
                : "";
            temp.attending_dr_assigning_authority_type =
              v.attending_dr_assigning_authority_type != null &&
              v.attending_dr_assigning_authority_type.length != 0
                ? v.attending_dr_assigning_authority_type
                : "";
            temp.admitting_dr_code =
              v.admitting_dr_code != null && v.admitting_dr_code.length != 0
                ? v.admitting_dr_code
                : "";
            temp.admitting_dr_family_name =
              v.admitting_dr_family_name != null &&
              v.admitting_dr_family_name.length != 0
                ? v.admitting_dr_family_name
                : "";
            temp.admitting_dr_given_name =
              v.admitting_dr_given_name != null &&
              v.admitting_dr_given_name.length != 0
                ? v.admitting_dr_given_name
                : "";
            temp.admitting_dr_assigning_authority_code =
              v.admitting_dr_assigning_authority_code != null &&
              v.admitting_dr_assigning_authority_code.length != 0
                ? v.admitting_dr_assigning_authority_code
                : "";
            temp.admitting_dr_assigning_authority_type =
              v.admitting_dr_assigning_authority_type != null &&
              v.admitting_dr_assigning_authority_type.length != 0
                ? v.admitting_dr_assigning_authority_type
                : "";
            temp.enterprise_id =
              v.enterprise_id != 0 ? parseInt(v.enterprise_id) : 0;
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
            temp.has_device_association = v.has_device_association;
            result.push(temp);
          }
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(_req: PatientVisits): Promise<PatientVisits> {
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

  public async insertTransaction(db: DB, _req: PatientVisits): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        visit_number: _req.visit_number,
        visited_on: _req.visited_on,
        patient_type_id: _req.patient_type_id,
        patient_adm_class_id: _req.patient_adm_class_id,
        patient_adm_class: _req.patient_adm_class,
        admission_dttm: _req.admission_dttm,
        patient_financial_class: _req.patient_financial_class,
        point_of_care: _req.point_of_care,
        room: _req.room,
        bed: _req.bed,
        floor: _req.floor,
        facility: _req.facility,
        building: _req.building,
        patient_height: _req.patient_height,
        patient_height_uom: _req.patient_height_uom,
        patient_weight: _req.patient_weight,
        patient_weight_uom: _req.patient_weight_uom,
        diagnosis_code: _req.diagnosis_code,
        attending_dr_code: _req.attending_dr_code,
        attending_dr_family_name: _req.attending_dr_family_name,
        attending_dr_given_name: _req.attending_dr_given_name,
        attending_dr_assigning_authority_code:
          _req.attending_dr_assigning_authority_code,
        attending_dr_assigning_authority_type:
          _req.attending_dr_assigning_authority_type,
        admitting_dr_code: _req.admitting_dr_code,
        admitting_dr_family_name: _req.admitting_dr_family_name,
        admitting_dr_given_name: _req.admitting_dr_given_name,
        admitting_dr_assigning_authority_code:
          _req.admitting_dr_assigning_authority_code,
        admitting_dr_assigning_authority_type:
          _req.admitting_dr_assigning_authority_type,
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
        attributes: _req.attributes,
        has_device_association: _req.has_device_association
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(_req: PatientVisits): Promise<PatientVisits> {
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
  public async updateTransaction(db: DB, _req: PatientVisits): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        visit_number: _req.visit_number,
        visited_on: _req.visited_on,
        patient_type_id: _req.patient_type_id,
        patient_adm_class_id: _req.patient_adm_class_id,
        patient_adm_class: _req.patient_adm_class,
        admission_dttm: _req.admission_dttm,
        patient_financial_class: _req.patient_financial_class,
        point_of_care: _req.point_of_care,
        room: _req.room,
        bed: _req.bed,
        floor: _req.floor,
        facility: _req.facility,
        building: _req.building,
        patient_height: _req.patient_height,
        patient_height_uom: _req.patient_height_uom,
        patient_weight: _req.patient_weight,
        patient_weight_uom: _req.patient_weight_uom,
        diagnosis_code: _req.diagnosis_code,
        attending_dr_code: _req.attending_dr_code,
        attending_dr_family_name: _req.attending_dr_family_name,
        attending_dr_given_name: _req.attending_dr_given_name,
        attending_dr_assigning_authority_code:
          _req.attending_dr_assigning_authority_code,
        attending_dr_assigning_authority_type:
          _req.attending_dr_assigning_authority_type,
        admitting_dr_code: _req.admitting_dr_code,
        admitting_dr_family_name: _req.admitting_dr_family_name,
        admitting_dr_given_name: _req.admitting_dr_given_name,
        admitting_dr_assigning_authority_code:
          _req.admitting_dr_assigning_authority_code,
        admitting_dr_assigning_authority_type:
          _req.admitting_dr_assigning_authority_type,
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
        attributes: _req.attributes,
        has_device_association: _req.has_device_association
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async delete(_req: PatientVisits): Promise<PatientVisits> {
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
  public async deleteTransaction(db: DB, _req: PatientVisits): Promise<void> {
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

  public async getPatientsAndLatestVisit(
    _patient_visit_id: number
  ): Promise<Array<PatientVisits>> {
    let result: Array<PatientVisits> = new Array<PatientVisits>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        var query_string = "";
        query_string = this.sql_get_patients_and_latest_visit;
        if (_patient_visit_id > 0)
          query_string += `and p.id = ${_patient_visit_id}`;
        const rows = await db.executeQuery(query_string, []);
        if (rows.length > 0) {
          _.forEach(rows, (v: PatientVisits, k) => {
            var _pateintvisits = v;
            result.push(_pateintvisits);
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  public async getPatientAndVisit(
    _patient_identifier: string
  ): Promise<Array<PatientVisits>> {
    let result: Array<PatientVisits> = new Array<PatientVisits>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_get_patient_and_visit_connector,
          {
            identifier: _patient_identifier
          }
        );
        if (rows.length > 0) {
          _.forEach(rows, (v, k) => {
            if (v != null) {
              var _pateintvisits = new PatientVisits();
              _pateintvisits.id = v.id != null ? parseInt(v.id) : 0;
              _pateintvisits.patient_id =
                v.patient_id != null ? parseInt(v.patient_id) : 0;
              _pateintvisits.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";
              _pateintvisits.admission_dttm =
                v.admission_dttm != null
                  ? v.admission_dttm
                  : new Date(9999, 11, 31, 23, 59, 59);
              _pateintvisits.point_of_care =
                v.point_of_care != null && v.point_of_care.length != 0
                  ? v.point_of_care
                  : "";
              _pateintvisits.room =
                v.room != null && v.room.length != 0 ? v.room : "";
              _pateintvisits.bed =
                v.bed != null && v.bed.length != 0 ? v.bed : "";
              _pateintvisits.visit_number =
                v.visit_number != null && v.visit_number.length != 0
                  ? v.visit_number
                  : "";
              result.push(_pateintvisits);
            }
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  public async getAssociatedOrdersForDevice(
    device_id: number
  ): Promise<Array<PatientVisitsWrapper>> {
    let result: Array<PatientVisitsWrapper> = new Array<PatientVisitsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_get_patient_and_visit_for_device,
          {
            device_id
          }
        );
        if (rows.length > 0) {
          _.forEach(rows, (v, k) => {
            if (v != null) {
              var _pateintvisits = new PatientVisitsWrapper();
              _pateintvisits.id = v.id != null ? parseInt(v.id) : 0;
              _pateintvisits.patient_id =
                v.patient_id != null ? parseInt(v.patient_id) : 0;
              _pateintvisits.patient_order_id =
                v.patient_order_id != null ? parseInt(v.patient_order_id) : 0;
              _pateintvisits.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";
              _pateintvisits.admission_dttm =
                v.admission_dttm != null
                  ? v.admission_dttm
                  : new Date(9999, 11, 31, 23, 59, 59);
              _pateintvisits.point_of_care =
                v.point_of_care != null && v.point_of_care.length != 0
                  ? v.point_of_care
                  : "";
              _pateintvisits.room =
                v.room != null && v.room.length != 0 ? v.room : "";
              _pateintvisits.bed =
                v.bed != null && v.bed.length != 0 ? v.bed : "";
              _pateintvisits.visit_number =
                v.visit_number != null && v.visit_number.length != 0
                  ? v.visit_number
                  : "";
              _pateintvisits.order_code =
                v.order_code != null && v.order_code.length != 0
                  ? v.order_code
                  : "";
              _pateintvisits.order_status =
                v.order_status != null && v.order_status.length != 0
                  ? v.order_status
                  : "";
              result.push(_pateintvisits);
            }
          });
        }
      });
    } catch (error) {}
    return result;
  }
  public async getPatientAndVisitForOrderCode(
    _order_code: string
  ): Promise<Array<PatientVisitsWrapper>> {
    let result: Array<PatientVisitsWrapper> = new Array<PatientVisitsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_get_patient_and_visit_for_ordercode,
          {
            order_code: _order_code
          }
        );
        if (rows.length > 0) {
          _.forEach(rows, (v, k) => {
            if (v != null) {
              var _pateintvisits = new PatientVisitsWrapper();
              _pateintvisits.id = v.id != null ? parseInt(v.id) : 0;
              _pateintvisits.patient_id =
                v.patient_id != null ? parseInt(v.patient_id) : 0;
              _pateintvisits.patient_order_id =
                v.patient_order_id != null ? parseInt(v.patient_order_id) : 0;
              _pateintvisits.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";
              _pateintvisits.admission_dttm =
                v.admission_dttm != null
                  ? v.admission_dttm
                  : new Date(9999, 11, 31, 23, 59, 59);
              _pateintvisits.point_of_care =
                v.point_of_care != null && v.point_of_care.length != 0
                  ? v.point_of_care
                  : "";
              _pateintvisits.room =
                v.room != null && v.room.length != 0 ? v.room : "";
              _pateintvisits.bed =
                v.bed != null && v.bed.length != 0 ? v.bed : "";
              _pateintvisits.visit_number =
                v.visit_number != null && v.visit_number.length != 0
                  ? v.visit_number
                  : "";
              result.push(_pateintvisits);
            }
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
}
