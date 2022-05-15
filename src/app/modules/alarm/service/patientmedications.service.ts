import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import {
  PatientMedications,
  PatientMedicationsWrapper,
  PatientMedicationsCriteria
} from "../models/patientmedications.model";
import { BaseService } from "./base.service";
import { Patients } from "../models/patients.model";
import { PatientVisitsWrapper } from "../models/patientvisits.model";

export class PatientMedicationsService extends BaseService {
  sql_select: string = `
      SELECT patientmedications.id, patientmedications.ihe_msg_id, patientmedications.patient_id, patientmedications.patient_visit_id, patientmedications.patient_order_id, patientmedications.device_id, patientmedications.drug_code, patientmedications.drug_displaytext, patientmedications.rate, patientmedications.dose, patientmedications.dose_limit, patientmedications.strength, patientmedications.volume_tbi, patientmedications.lockout, patientmedications.time_expected, patientmedications.rate_unit_code, patientmedications.rate_unit_displaytext, patientmedications.rate_unit_system, patientmedications.dose_unit_code, patientmedications.dose_unit_displaytext, patientmedications.dose_unit_system, patientmedications.volume_unit_code, patientmedications.volume_unit_displaytext, patientmedications.volume_unit_system, patientmedications.strength_unit_code, patientmedications.strength_unit_displaytext, patientmedications.strength_unit_system, patientmedications.time_unit_code, patientmedications.time_unit_displaytext, patientmedications.time_unit_system, patientmedications.enterprise_id, patientmedications.ent_location_id, patientmedications.row_key, patientmedications.created_by, patientmedications.modified_by, patientmedications.created_on, patientmedications.modified_on, patientmedications.is_active, patientmedications.is_suspended, patientmedications.parent_id, patientmedications.is_factory, patientmedications.notes, patientmedications.attributes
      FROM patientmedications 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO patientmedications(ihe_msg_id, patient_id, patient_visit_id, patient_order_id, device_id, drug_code, drug_displaytext, rate, dose, dose_limit, strength, volume_tbi, lockout, time_expected, rate_unit_code, rate_unit_displaytext, rate_unit_system, dose_unit_code, dose_unit_displaytext, dose_unit_system, volume_unit_code, volume_unit_displaytext, volume_unit_system, strength_unit_code, strength_unit_displaytext, strength_unit_system, time_unit_code, time_unit_displaytext, time_unit_system, enterprise_id, ent_location_id, row_key, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes, attributes)
VALUES (@ihe_msg_id, @patient_id, @patient_visit_id, @patient_order_id, @device_id, @drug_code, @drug_displaytext, @rate, @dose, @dose_limit, @strength, @volume_tbi, @lockout, @time_expected, @rate_unit_code, @rate_unit_displaytext, @rate_unit_system, @dose_unit_code, @dose_unit_displaytext, @dose_unit_system, @volume_unit_code, @volume_unit_displaytext, @volume_unit_system, @strength_unit_code, @strength_unit_displaytext, @strength_unit_system, @time_unit_code, @time_unit_displaytext, @time_unit_system, @enterprise_id, @ent_location_id, @row_key, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes, @attributes)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE patientmedications
    SET  ihe_msg_id = @ihe_msg_id, patient_id = @patient_id, patient_visit_id = @patient_visit_id, patient_order_id = @patient_order_id, device_id = @device_id, drug_code = @drug_code, drug_displaytext = @drug_displaytext, rate = @rate, dose = @dose, dose_limit = @dose_limit, strength = @strength, volume_tbi = @volume_tbi, lockout = @lockout, time_expected = @time_expected, rate_unit_code = @rate_unit_code, rate_unit_displaytext = @rate_unit_displaytext, rate_unit_system = @rate_unit_system, dose_unit_code = @dose_unit_code, dose_unit_displaytext = @dose_unit_displaytext, dose_unit_system = @dose_unit_system, volume_unit_code = @volume_unit_code, volume_unit_displaytext = @volume_unit_displaytext, volume_unit_system = @volume_unit_system, strength_unit_code = @strength_unit_code, strength_unit_displaytext = @strength_unit_displaytext, strength_unit_system = @strength_unit_system, time_unit_code = @time_unit_code, time_unit_displaytext = @time_unit_displaytext, time_unit_system = @time_unit_system, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, row_key = @row_key, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes, attributes = @attributes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM patientmedications
   WHERE id = @id
   RETURNING *;
  `;

  sql_get_medications_for_code: string = `
  SELECT patientmedications.id, patientmedications.ihe_msg_id, patientmedications.patient_id, 
  patientmedications.patient_visit_id, patientmedications.patient_order_id, 
  patientmedications.device_id, patientmedications.drug_code, 
  patientmedications.drug_displaytext, patientmedications.rate, patientmedications.dose, 
  patientmedications.dose_limit, patientmedications.strength, patientmedications.volume_tbi, 
  patientmedications.lockout, patientmedications.time_expected, patientmedications.rate_unit_code, 
  patientmedications.rate_unit_displaytext, patientmedications.rate_unit_system,
  patientmedications.dose_unit_code, patientmedications.dose_unit_displaytext, 
  patientmedications.dose_unit_system, patientmedications.volume_unit_code, 
  patientmedications.volume_unit_displaytext, patientmedications.volume_unit_system, 
  patientmedications.strength_unit_code, patientmedications.strength_unit_displaytext, 
  patientmedications.strength_unit_system, patientmedications.time_unit_code, 
  patientmedications.time_unit_displaytext, patientmedications.time_unit_system, 
  patientmedications.enterprise_id, patientmedications.ent_location_id, patientmedications.row_key, 
  patientmedications.created_by, patientmedications.modified_by, patientmedications.created_on, 
  patientmedications.modified_on, patientmedications.is_active, patientmedications.is_suspended, 
  patientmedications.parent_id, patientmedications.is_factory, patientmedications.notes, 
  patientmedications.attributes, patientmedications.prescription_number,
  Patients.identifier p_identifier, Patients.first_name, Patients.last_name, Patients.dob, Patients.gender,
  PatientVisits.point_of_care, PatientVisits.room, PatientVisits.bed, PatientVisits.visit_number,
  PatientVisits.admission_dttm
  FROM patientmedications inner join Patients on patientmedications.patient_id = Patients.id
  inner join PatientVisits on PatientVisits.patient_id = Patients.id
  where Patients.identifier like @patient_identifier or Patients.first_name like @patient_identifier+'%'
  or  Patients.last_name like @patient_identifier+'%'
  `;

  sql_get_medications_patient_wise = ` with alarmlist
  as
  (
  select patient_order_id, sum(case when event_phase = 'start' then 1 else -1 end) activealarms from AlarmObservations
  where patient_visit_id = @patient_visit_id
  group by patient_order_id 
  ),observations as
  (
    select DeviceObservations.patient_order_id from DeviceObservations
    where patient_visit_id = @patient_visit_id
    group by DeviceObservations.patient_order_id
  )
  
  select pm.id, d.id device_id, d.display_text, d.category, d.identifier, 
    d.manufacturer d_manufacturer, d.model d_model,d.type d_type,d.sub_type d_sub_type,
    pm.drug_displaytext, po.id patient_order_id, pm.created_on, po.ordered_on,
    case when alarmlist.activealarms >0 then 'Yes' else 'No' end hasalarm
    from PatientOrders po
    inner join PatientMedications pm on pm.id = po.medication_base_id
    inner join observations on observations.patient_order_id = po.id
    left outer join alarmlist on alarmlist.patient_order_id = po.id
    inner join Devices d on d.id = po.device_id
    where po.patient_visit_id = @patient_visit_id`;
  // `select distinct patientmedications.id, devices.id device_id, devices.display_text, devices.category,
  // devices.identifier, patientmedications.drug_displaytext, patientmedications.patient_order_id,  alarmobservations.id
  // from patientmedications
  // inner join patientorders on patientorders.id = patientmedications.patient_order_id
  // inner join devices on devices.id = patientmedications.device_id
  // left join alarmobservations  on alarmobservations.patient_visit_id = patientorders.patient_visit_id `

  // `
  // select distinct pm.id, d.id device_id, d.device_name, d.device_type,
  // 	d.device_serial_id, pm.drug_name, pm.patient_order_id, pm.message_time, (a.id is not NULL) has_alarm
  // from patientmedication pm
  // inner join patientorder po on po.id = pm.patient_order_id
  // inner join device d on d.id = pm.device_id
  // left join alarmobservation a on a.patient_visit_id = po.patient_visit_id and a.device_id = d.id  and a.alarm_status <> 'accepted' `;

  sql_get_latest_medication_device_wise = `	SELECT PatientMedications.id, patient_order_id, PatientMedications.device_id, 
	PatientMedications.patient_id, drug_code, drug_displaytext, PatientMedications.rate, 
	PatientMedications.dose, PatientMedications.strength, 
	PatientMedications.volume_tbi, PatientMedications.rate_unit_displaytext, 
	PatientMedications.dose_unit_displaytext, PatientMedications.volume_unit_displaytext, 
	concat(d.display_text, '|', d.category, '|', d.identifier) AS device_info
	from PatientMedications 
	inner join PatientOrders on PatientOrders.id = PatientMedications.patient_order_id
	inner join devices d on PatientMedications.device_id = d.id`;

  //  `select patientmedications.id, patientmedications.patient_order_id, patientmedications.device_id, patientmedications.patient_id,
  //  patientmedications.drug_code, patientmedications.drug_displaytext, patientmedications.rate, patientmedications.dose, patientmedications.strength, patientmedications.volume_tbi,
  //  patientmedications.rate_unit_displaytext,
  //  patientmedications.dose_unit_displaytext, patientmedications.volume_unit_displaytext,
  //  concat(devices.display_text, '|', devices.category, '|', devices.identifier) AS device_info from patientmedications
  //  inner join devices on patientmedications.device_id = devices.id`;

  // `SELECT pm.id, patient_order_id, message_time, device_id, patient_id, drug_code, drug_name, rate, dose, strength,
  //  volume_tbi, rate_unit_name, dose_unit_name, volume_unit_name,
  //  concat(d.device_name, '|', d.device_type, '|', d.device_serial_id) AS device_info
  //  from patientmedication pm, device d WHERE pm.device_id = d.id
  // `;
  sql_get_patient_medication_by_order_code = `select PM.id, PO.id patient_order_id, PO.patient_visit_id, PO.order_code, PO.order_status, PM.drug_code, PM.drug_displaytext, PM.strength, PM.strength_unit_displaytext,
   PM.rate, PM.rate_unit_displaytext, PM.volume_tbi, PM.volume_unit_displaytext,PatientVisits.visit_number
  FROM PatientMedications PM 
  inner join PatientOrders PO on PO.patient_medication_id = PM.id AND PO.order_code = @order_code
  inner join PatientVisits on PatientVisits.patient_id = PO.patient_id `;

  public async select(
    _req: PatientMedications
  ): Promise<Array<PatientMedications>> {
    var result: Array<PatientMedications> = [];
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
    _req: PatientMedications
  ): Promise<Array<PatientMedications>> {
    var result: Array<PatientMedications> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`PatientMedications.id = ${_req.id}`);
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
          var temp: PatientMedications = new PatientMedications();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.ihe_msg_id = v.ihe_msg_id != 0 ? parseInt(v.ihe_msg_id) : 0;
          temp.patient_id = v.patient_id != 0 ? parseInt(v.patient_id) : 0;
          temp.patient_visit_id =
            v.patient_visit_id != 0 ? parseInt(v.patient_visit_id) : 0;
          temp.patient_order_id =
            v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;
          temp.device_id = v.device_id != 0 ? parseInt(v.device_id) : 0;
          temp.drug_code =
            v != null && v.drug_code.length != 0 ? v.drug_code : "";
          temp.drug_displaytext =
            v != null && v.drug_displaytext.length != 0
              ? v.drug_displaytext
              : "";
          temp.rate = v.rate != 0 ? parseInt(v.rate) : 0;
          temp.dose = v.dose != 0 ? parseInt(v.dose) : 0;
          temp.dose_limit = v.dose_limit != 0 ? parseInt(v.dose_limit) : 0;
          temp.strength = v.strength != 0 ? parseInt(v.strength) : 0;
          temp.volume_tbi = v.volume_tbi != 0 ? parseInt(v.volume_tbi) : 0;
          temp.lockout = v.lockout != 0 ? parseInt(v.lockout) : 0;
          temp.time_expected =
            v.time_expected != 0 ? parseInt(v.time_expected) : 0;
          temp.rate_unit_code =
            v != null && v.rate_unit_code.length != 0 ? v.rate_unit_code : "";
          temp.rate_unit_displaytext =
            v != null && v.rate_unit_displaytext.length != 0
              ? v.rate_unit_displaytext
              : "";
          temp.rate_unit_system =
            v != null && v.rate_unit_system.length != 0
              ? v.rate_unit_system
              : "";
          temp.dose_unit_code =
            v != null && v.dose_unit_code.length != 0 ? v.dose_unit_code : "";
          temp.dose_unit_displaytext =
            v != null && v.dose_unit_displaytext.length != 0
              ? v.dose_unit_displaytext
              : "";
          temp.dose_unit_system =
            v != null && v.dose_unit_system.length != 0
              ? v.dose_unit_system
              : "";
          temp.volume_unit_code =
            v != null && v.volume_unit_code.length != 0
              ? v.volume_unit_code
              : "";
          temp.volume_unit_displaytext =
            v != null && v.volume_unit_displaytext.length != 0
              ? v.volume_unit_displaytext
              : "";
          temp.volume_unit_system =
            v != null && v.volume_unit_system.length != 0
              ? v.volume_unit_system
              : "";
          temp.strength_unit_code =
            v != null && v.strength_unit_code.length != 0
              ? v.strength_unit_code
              : "";
          temp.strength_unit_displaytext =
            v != null && v.strength_unit_displaytext.length != 0
              ? v.strength_unit_displaytext
              : "";
          temp.strength_unit_system =
            v != null && v.strength_unit_system.length != 0
              ? v.strength_unit_system
              : "";
          temp.time_unit_code =
            v != null && v.time_unit_code.length != 0 ? v.time_unit_code : "";
          temp.time_unit_displaytext =
            v != null && v.time_unit_displaytext.length != 0
              ? v.time_unit_displaytext
              : "";
          temp.time_unit_system =
            v != null && v.time_unit_system.length != 0
              ? v.time_unit_system
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
          temp.notes = v != null && v.notes.length != 0 ? v.notes : "";
          temp.attributes =
            v != null && v.attributes.length != 0 ? v.attributes : "";
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async getMedicationsForPatient(
    _req: PatientMedicationsCriteria
  ): Promise<Array<PatientMedicationsWrapper>> {
    var result: Array<PatientMedicationsWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        result = await this.getMedicationsForPatientTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async getMedicationsForPatientTransaction(
    db: DB,
    _req: PatientMedicationsCriteria
  ): Promise<Array<PatientMedicationsWrapper>> {
    var result: Array<PatientMedicationsWrapper> = [];
    try {
      var query: string = this.sql_get_medications_for_code;
      var rows = await db.executeQuery(query, {
        patient_identifier: _req.patient_identifier 
      });
      if (rows.length > 0) {
        _.forEach(rows, v => {
          var temp: PatientMedicationsWrapper = new PatientMedicationsWrapper();
          temp.id = v.id != null && v.id != 0 ? parseInt(v.id) : 0;
          temp.ihe_msg_id =
            v.ihe_msg_id != null && v.ihe_msg_id != 0
              ? parseInt(v.ihe_msg_id)
              : 0;
          temp.patient_id =
            v.patient_id != null && v.patient_id != 0
              ? parseInt(v.patient_id)
              : 0;
          temp.patient_visit_id =
            v.patient_visit_id != null && v.patient_visit_id != 0
              ? parseInt(v.patient_visit_id)
              : 0;
          temp.patient_order_id =
            v.patient_order_id != null && v.patient_order_id != 0
              ? parseInt(v.patient_order_id)
              : 0;
          temp.device_id =
            v.device_id != null && v.device_id != 0 ? parseInt(v.device_id) : 0;
          temp.drug_code =
            v.drug_code != null && v != null && v.drug_code.length != 0
              ? v.drug_code
              : "";
          temp.drug_displaytext =
            v.drug_displaytext != null &&
            v != null &&
            v.drug_displaytext.length != 0
              ? v.drug_displaytext
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
            v.enterprise_id != null && v.enterprise_id != 0
              ? parseInt(v.enterprise_id)
              : 0;
          temp.ent_location_id =
            v.ent_location_id != null && v.ent_location_id != 0
              ? parseInt(v.ent_location_id)
              : 0;
          temp.row_key =
            v.row_key != null && v != null && v.row_key.length != 0
              ? v.row_key
              : "";
          temp.created_by =
            v.created_by != null && v.created_by != 0
              ? parseInt(v.created_by)
              : 0;
          temp.modified_by =
            v.modified_by != null && v.modified_by != 0
              ? parseInt(v.modified_by)
              : 0;
          temp.created_on = v.created_on != null ? v.created_on : new Date();
          temp.modified_on = v.modified_on != null ? v.modified_on : new Date();
          temp.is_active = v.is_active;
          temp.is_suspended = v.is_suspended != null ? v.is_suspended : false;
          temp.parent_id =
            v.parent_id != null && v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          temp.is_factory = v.is_factory != null ? v.is_factory : false;
          temp.notes = v.notes != null && v.notes.length != 0 ? v.notes : "";
          temp.prescription_number =
            v.prescription_number != null && v.prescription_number.length != 0
              ? v.prescription_number
              : "";
          temp.attributes =
            v.attributes != null && v.attributes.length != 0
              ? v.attributes
              : "";

          temp.patient = new Patients();
          temp.patient.identifier =
            v.p_identifier != null && v.p_identifier.length != 0
              ? v.p_identifier
              : "";
          temp.patient.first_name =
            v.first_name != null && v.first_name.length != 0
              ? v.first_name
              : "";
          temp.patient.last_name =
            v.last_name != null && v.last_name.length != 0 ? v.last_name : "";

          temp.patient.dob = v.dob != null ? v.dob : new Date();
          temp.patient.gender =
            v.gender != null && v.gender.length != 0 ? v.gender : "";
          temp.patientvisit = new PatientVisitsWrapper();
          temp.patientvisit.point_of_care =
            v.point_of_care != null && v.point_of_care.length != 0
              ? v.point_of_care
              : "";
          temp.patientvisit.room =
            v.room != null && v.room.length != 0 ? v.room : "";
          temp.patientvisit.bed =
            v.bed != null && v.bed.length != 0 ? v.bed : "";
          temp.patientvisit.visit_number =
            v.visit_number != null && v.visit_number.length != 0
              ? v.visit_number
              : "";
          temp.patientvisit.admission_dttm =
            v.admission_dttm != null ? v.admission_dttm : new Date();

          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async insert(_req: PatientMedications): Promise<PatientMedications> {
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
    _req: PatientMedications
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        patient_visit_id: _req.patient_visit_id,
        patient_order_id: _req.patient_order_id,
        device_id: _req.device_id,
        drug_code: _req.drug_code,
        drug_displaytext: _req.drug_displaytext,
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
  public async update(_req: PatientMedications): Promise<PatientMedications> {
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
    _req: PatientMedications
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        patient_visit_id: _req.patient_visit_id,
        patient_order_id: _req.patient_order_id,
        device_id: _req.device_id,
        drug_code: _req.drug_code,
        drug_displaytext: _req.drug_displaytext,
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
  public async delete(_req: PatientMedications): Promise<PatientMedications> {
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
    _req: PatientMedications
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

  async getLatestMedicationDeviceWise(
    _device_id: number,
    _patient_id: number,
    _patient_order_id: number
  ): Promise<Array<PatientMedications>> {
    let result: Array<PatientMedications> = new Array<PatientMedications>();
    try {
      console.log("req", _device_id, _patient_id, _patient_order_id);
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(
          this.sql_get_latest_medication_device_wise
        );
        if (_device_id > 0) {
          qb.addParameter("PatientMedications.device_id", _device_id, "=");
        }
        if (_patient_id > 0) {
          qb.addParameter("PatientMedications.patient_id", _patient_id, "=");
        }
        if (_patient_order_id > 0) {
          qb.addParameter(
            "PatientMedications.patient_order_id",
            _patient_order_id,
            "="
          );
        }
        qb.sort_field = "PatientMedications.id";
        qb.sort_type = " desc";
        var query = qb.getQuery();
        const rows = await db.executeQuery(query);
        if (rows.length > 0) {
          _.forEach(rows, (v: any, k: any) => {
            var _pat_medication_device_wise = new PatientMedicationsWrapper();
            _pat_medication_device_wise.id = v.id != 0 ? parseInt(v.id) : 0;
            _pat_medication_device_wise.patient_order_id =
              v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;
            _pat_medication_device_wise.device_id =
              v.device_id != 0 ? parseInt(v.device_id) : 0;
            _pat_medication_device_wise.drug_code =
              v != null && v.drug_code != null && v.drug_code.length != 0
                ? v.drug_code
                : "";
            _pat_medication_device_wise.drug_displaytext =
              v != null &&
              v.drug_displaytext != null &&
              v.drug_displaytext.length != 0
                ? v.drug_displaytext
                : "";
            _pat_medication_device_wise.rate =
              v.rate != null && v.rate != 0 ? parseInt(v.rate) : 0;
            _pat_medication_device_wise.dose =
              v != null && v.dose != null && v.dose.length != 0 ? v.dose : "";
            _pat_medication_device_wise.strength =
              v != null && v.strength != null && v.strength.length != 0
                ? v.strength
                : "";
            _pat_medication_device_wise.volume_tbi =
              v != null && v.volume_tbi != null && v.volume_tbi.length != 0
                ? v.volume_tbi
                : "";
            _pat_medication_device_wise.rate_unit_code =
              v != null &&
              v.rate_unit_code != null &&
              v.rate_unit_code.length != 0
                ? v.rate_unit_code
                : "";
            _pat_medication_device_wise.dose_unit_displaytext =
              v != null &&
              v.dose_unit_displaytext != null &&
              v.dose_unit_displaytext.length != 0
                ? v.dose_unit_displaytext
                : "";
            _pat_medication_device_wise.volume_unit_displaytext =
              v != null &&
              v.volume_unit_displaytext != null &&
              v.volume_unit_displaytext.length != 0
                ? v.volume_unit_displaytext
                : "";
            _pat_medication_device_wise.device_info =
              v != null && v.device_info != null && v.device_info.length != 0
                ? v.device_info
                : "";
            result.push(_pat_medication_device_wise);
          });
        }
      });
    } catch (error) {
      let e: any = error;
      let err = new ErrorResponse<PatientMedications>();
      err.success = false;
      err.success = false;
      err.code = e.code;
      err.error = e.error;
      err.message = e.message;
      err.item = null;
      err.exception = e.stack;
      throw err;
    }
    return result;
  }

  async getMedicationByOrderCode(
    _order_core: string
  ): Promise<Array<PatientMedicationsCriteria>> {
    let result: Array<PatientMedicationsCriteria> = new Array<
      PatientMedicationsCriteria
    >();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_get_patient_medication_by_order_code,
          {
            order_code: _order_core
          }
        );
        if (rows.length > 0) {
          _.forEach(rows, (v: any, k: any) => {
            if (v != null) {
              var _pat_medication = new PatientMedicationsCriteria();
              _pat_medication.id = v.id != null ? parseInt(v.id) : 0;
              _pat_medication.patient_order_id =
                v.patient_order_id != null ? parseInt(v.patient_order_id) : 0;
              _pat_medication.patient_visit_id =
                v.patient_visit_id != null ? parseInt(v.patient_visit_id) : 0;
              _pat_medication.order_code =
                v.order_code != null && v.order_code.length != 0
                  ? v.order_code
                  : "";
              _pat_medication.visit_number =
                v.visit_number != null && v.visit_number.length != 0
                  ? v.visit_number.toString()
                  : "";
              _pat_medication.drug_code =
                v.drug_code != null && v.drug_code.length != 0
                  ? v.drug_code
                  : "";
              _pat_medication.drug_displaytext =
                v.drug_displaytext != null && v.drug_displaytext.length != 0
                  ? v.drug_displaytext
                  : "";
              _pat_medication.strength =
                v.strength != null ? parseInt(v.strength) : 0;
              _pat_medication.strength_unit_displaytext =
                v.strength_unit_displaytext != null &&
                v.strength_unit_displaytext.length != 0
                  ? v.strength_unit_displaytext
                  : "";
              _pat_medication.rate = v.rate != null ? parseInt(v.rate) : 0;
              _pat_medication.rate_unit_displaytext =
                v.rate_unit_displaytext != null &&
                v.rate_unit_displaytext.length != 0
                  ? v.rate_unit_displaytext
                  : "";
              _pat_medication.volume_tbi =
                v.volume_tbi != null ? parseInt(v.volume_tbi) : 0;
              _pat_medication.volume_unit_displaytext =
                v.volume_unit_displaytext != null &&
                v.volume_unit_displaytext.length != 0
                  ? v.volume_unit_displaytext
                  : "";
              _pat_medication.order_status =
                v.order_status != null && v.order_status.length != 0
                  ? v.order_status
                  : "";
              result.push(_pat_medication);
            }
          });
        }
      });
    } catch (error) {
      let e: any = error;
      let err = new ErrorResponse<PatientMedications>();
      err.success = false;
      err.success = false;
      err.code = e.code;
      err.error = e.error;
      err.message = e.message;
      err.item = null;
      err.exception = e.stack;
      throw err;
    }
    return result;
  }
  async getMedicationsPatientWise(
    patient_visit_id: number
  ): Promise<Array<PatientMedications>> {
    let result: Array<PatientMedications> = new Array<PatientMedications>();
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(
          this.sql_get_medications_patient_wise
        );
        // if (patient_visit_id > 0) {
        //   qb.addParameter("po.patient_visit_id", patient_visit_id, "=");
        // }
        qb.sort_field = "po.ordered_on";
        qb.sort_type = " desc";
        var query = qb.getQuery();
        const rows = await db.executeQuery(query, {
          patient_visit_id: patient_visit_id
        });
        if (rows.length > 0) {
          _.forEach(rows, (v: any, k: any) => {
            var patient_medication: PatientMedications = v;
            patient_medication.device_id = v.device_id;
            // patient_medication.device = new DeviceModel({
            //   id: v.device_id,
            //   device_name: v.device_name,
            //   device_type: v.device_type,
            //   device_serial_id: v.device_serial_id,
            // });
            result.push(patient_medication);
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
      // throw new ErrorResponse<PatientMedicationCustomModel>({
      // 	success: false,
      // 	code: transaction_error.code,
      // 	error: transaction_error.detail,
      // 	message: transaction_error.message,
      // 	item: null,
      // 	exception: transaction_error.stack,
      // });
    }
    return result;
  }
}
