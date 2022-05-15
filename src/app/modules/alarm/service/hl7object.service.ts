import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DeviceModel } from "../models/device.model";
import { PatientModel } from "../models/patient.model";
import { PatientVisitModel } from "../models/patientvisit.model";
import {
  PatientMedicationModel,
  PatientMedicationCustomModel,
} from "../models/patientmedication.model";
import {
  PatientOrderModel,
  PatientorderForAlarmsWithoutOrder,
  PatientorderCriteriaForAlarmsWithoutOrder,
} from "../models/patientorder.model";
import {
  DeviceObservationModel,
  DeviceObservationGraphModel,
  GraphData,
} from "../models/deviceobservation.model";
import { AlarmObservationModel } from "../models/alarmobservation.model";
import { parse } from "dotenv/types";
import moment, { Moment } from "moment";

export class HL7ObjectService extends BaseService {
  sql_insert_patient = `INSERT INTO patients
	(ihe_msg_id, first_name, last_name, identifier, identifier_type, identifier_authority, dob, 
		gender, enterprise_id, ent_location_id, row_key, created_by, created_on, is_active)
	VALUES (@ihe_msg_id, @first_name, @last_name, @identifier, @identifier_type_id, @identifier_authority, @dob, @gender, @enterprise_id, @ent_location_id, @row_key, @created_by, @created_on, @is_active)
	returning id
	`;
  sql_insert_patient_identifiers = `
  IF NOT EXISTS (SELECT 1 FROM PatientIdentifiers WHERE identifier_type = @identifier_type 
      AND identifier_value = @identifier_value)
  BEGIN
    INSERT INTO PatientIdentifiers (patient_id, identifier_type, identifier_value, is_primary, created_by, created_on, is_active)
    SELECT id, identifier_type, identifier, 1, created_by, created_on, is_active 
    FROM Patients WHERE id = @patient_id 
  END`;
  sql_insert_patientvisit = `INSERT INTO patientvisits
	(ihe_msg_id, patient_id, admission_dttm, point_of_care, room, bed, facility, building, floor, 
		patient_adm_class, row_key, visit_number, attending_dr_code, attending_dr_family_name, 
		attending_dr_given_name, created_by, created_on, is_active)
	VALUES (@ihe_msg_id, @patient_id, @admission_dttm, @point_of_care, @room, @bed, @facility, @building, @floor, @patient_adm_class, @row_key, @visit_number, @attending_dr_code, @attending_dr_family_name, @attending_dr_given_name, @created_by, @created_on, @is_active)
	returning id
	`;

  sql_insert_patientorder = `
  declare @pat_order_id bigint 
  INSERT INTO patientorders
	(ihe_msg_id, device_id, patient_id, ordered_on, order_code, order_type, 
		action_by_code, action_by_family_name, action_by_given_name, 
		row_key, assigning_authority, order_universal_code, order_universal_displaytext, patient_visit_id, 
		created_by, created_on, is_active, patient_medication_id, medication_base_id, medication_additive_id,
		volume_tbi, volume_unit_code, volume_unit_displaytext, volume_unit_system, 
		time_expected, time_unit_code, time_unit_displaytext,
		strength, strength_unit_code, strength_unit_displaytext, strength_unit_system,
    order_by_code, order_by_family_name, order_by_given_name,
    concentration, concentration_uom, concentration_final, concentration_final_uom,
    order_status, diluent_volume, diluent_uom, rate, rate_unit_displaytext, dose, dose_unit_displaytext)
	VALUES (@ihe_msg_id, @device_id, @patient_id, @ordered_on, @order_code, @order_type, @action_by_code, 
    @action_by_family_name, @action_by_given_name, @row_key, @assigning_authority, @order_universal_code, 
    @order_universal_displaytext, @patient_visit_id, @created_by, @created_on, @is_active, 
    @patient_medication_id, @medication_base_id, @medication_additive_id,
		@volume_tbi, @volume_unit_code, @volume_unit_displaytext, @volume_unit_system, 
    @time_expected, @time_unit_code, @time_unit_displaytext, @strength, 
    @strength_unit_code, @strength_unit_displaytext, @strength_unit_system,
    @ordering_provider_id, @ordering_provider_family_name, @ordering_provider_given_name,
    @concentration, @concentration_unit, @concentration_final, @concentration_final_unit,
    @order_status, @diluent, @diluent_unit, @rate, @rate_unit_name, @dose, @dose_unit_name)
	
  SELECT @pat_order_id = SCOPE_IDENTITY()

  UPDATE PM SET patient_order_id = @pat_order_id
  FROM PatientMedications PM WHERE PM.id = @patient_medication_id

  SELECT @pat_order_id as id
	`;

  sql_update_patientorder = `
	UPDATE PatientOrders 
	SET medication_base_id = CASE WHEN @medication_base_id > 0 THEN @medication_base_id ELSE medication_base_id END, 
	medication_additive_id = CASE WHEN @medication_additive_id > 0 THEN @medication_additive_id ELSE medication_additive_id END,
	patient_medication_id = CASE WHEN @medication_base_id > 0 THEN @medication_base_id ELSE medication_base_id END,
	volume_tbi = @volume_tbi, volume_unit_code = @volume_unit_code, volume_unit_displaytext = @volume_unit_displaytext, volume_unit_system = @volume_unit_system, 
	strength = @strength, strength_unit_code = @strength_unit_code, strength_unit_displaytext = @strength_unit_displaytext, strength_unit_system = @strength_unit_system
	WHERE id = @id

	UPDATE PM SET PM.patient_order_id = @id
	FROM PatientOrders PO, PatientMedications PM
	WHERE PO.id = @id AND (PM.id = PO.medication_base_id OR PM.id = PO.medication_additive_id);

	SELECT @id as id
	`;

  sql_insert_patientmedication = `INSERT INTO patientmedications
	(ihe_msg_id, device_id, patient_id, row_key, drug_type, drug_code, drug_displaytext, patient_order_id, patient_visit_id, 
		rate, rate_unit_code, rate_unit_displaytext, rate_unit_system, 
		dose, dose_unit_code, dose_unit_displaytext, dose_unit_system, 
		volume_tbi, volume_unit_code, volume_unit_displaytext, volume_unit_system, 
		strength, strength_unit_code, strength_unit_displaytext, strength_unit_system,
		created_by, created_on, is_active,
		prescribed_on, dispense_code, prescription_number, time_expected, 
		time_unit_displaytext, route_identifier, route_displaytext,
    concentration, concentration_uom
		)
	VALUES (@ihe_msg_id, @device_id, @patient_id, @row_key, @drug_type, @drug_code, @drug_displaytext, 
		@patient_order_id, @patient_visit_id, 
		@rate, @rate_unit_code, @rate_unit_displaytext, @rate_unit_system, 
		@dose, @dose_unit_code, @dose_unit_displaytext, @dose_unit_system, 
		@volume_tbi, @volume_unit_code, @volume_unit_displaytext, @volume_unit_system, 
		@strength, @strength_unit_code, @strength_unit_displaytext, @strength_unit_system,
		@created_by, @created_on, @is_active,
		@prescribed_on, @dispense_code, @prescription_number, @time_expected, 
		@time_unit_displaytext, @route_identifier, @route_displaytext,
    @strength, @strength_unit_displaytext)
	RETURNING id
	`;

  sql_update_patientmedication = `UPDATE patientmedications SET
		rate = @rate, rate_unit_code = @rate_unit_code, rate_unit_displaytext = @rate_unit_displaytext, 
		dose = @dose, dose_unit_code = @dose_unit_code, dose_unit_displaytext = @dose_unit_displaytext, 
		volume_tbi = @volume_tbi, volume_unit_code = @volume_unit_code, volume_unit_displaytext = @volume_unit_displaytext, 
		strength = @strength, strength_unit_code = @strength_unit_code, strength_unit_displaytext = @strength_unit_displaytext,
		drug_code = @drug_code, drug_displaytext = @drug_displaytext
	WHERE id = @id
	RETURNING id
	`;

  sql_insert_device_obs = `
	DECLARE @dev_obs_id bigint, @alarm_obs_id bigint, @device_id bigint, @patient_order_id bigint
	INSERT INTO deviceobservations
	(ihe_msg_id, device_id, patient_id, patient_order_id, patient_medication_id, 
		observations, device_displaytext, device_mds, device_vmd, device_channel, device_mode, 
		device_status, rate_unit_code, rate_unit_displaytext, rate_unit_system, dose_unit_code, 
		dose_unit_displaytext, dose_unit_system, volume_unit_code, volume_unit_displaytext, volume_unit_system, 
		strength_unit_code, strength_unit_displaytext, strength_unit_system, dose, dose_limit, rate, 
		strength, volume_delivered, volume_tbi, volume_remain, lockout_time, time_plan, time_remain, 
		time_expected, time_unit_code, time_unit_displaytext, time_unit_system, alarm_id, patient_visit_id, 
		delivery_status, created_by, created_on, is_active, observed_on, point_of_care, room, bed)
	VALUES
	(@ihe_msg_id, @_device_id, @patient_id, @_patient_order_id, @patient_medication_id, 
		@observations, @device_displaytext, @device_mds, @device_vmd, @device_channel, @device_mode, 
		@device_status, @rate_unit_code, @rate_unit_displaytext, @rate_unit_system, @dose_unit_code, 
		@dose_unit_displaytext, @dose_unit_system, @volume_unit_code, @volume_unit_displaytext, @volume_unit_system, 
		@strength_unit_code, @strength_unit_displaytext, @strength_unit_system, @dose, @dose_limit, @rate, 
		@strength, @volume_delivered, @volume_tbi, @volume_remain, @lockout_time, @time_plan, @time_remain, 
		@time_expected, @time_unit_code, @time_unit_displaytext, @time_unit_system, @alarm_id, @patient_visit_id, 
		@delivery_status, @created_by, @created_on, @is_active, @observed_on, @point_of_care, @room, @bed)
	SELECT @dev_obs_id = SCOPE_IDENTITY()	

	IF (@dev_obs_id > 0)
	BEGIN
		SELECT @device_id = device_id, @alarm_obs_id = ISNULL(alarm_id, 0), @patient_order_id = patient_order_id 
		FROM DeviceObservations WHERE id = @dev_obs_id
		
		IF (@alarm_obs_id > 0)
		BEGIN
      IF EXISTS (SELECT 1 FROM AlarmObservations outer_tbl, Alarmobservations inner_tbl
      where inner_tbl.patient_id = outer_tbl.patient_id
      and inner_tbl.patient_visit_id = outer_tbl.patient_visit_id
      and inner_tbl.patient_order_id = outer_tbl.patient_order_id
      and inner_tbl.device_id = outer_tbl.device_id
      and inner_tbl.alarm_type = outer_tbl.alarm_type 
      and outer_tbl.event_phase = 'start'
      and inner_tbl.event_phase = 'end' 
      and outer_tbl.id < inner_tbl.id)
      BEGIN
        UPDATE inner_tbl set row_key = 2, is_active = 1
        from AlarmObservations outer_tbl, Alarmobservations inner_tbl
        where inner_tbl.patient_id = outer_tbl.patient_id
        and inner_tbl.patient_visit_id = outer_tbl.patient_visit_id
        and inner_tbl.patient_order_id = outer_tbl.patient_order_id
        and inner_tbl.device_id = outer_tbl.device_id
        and inner_tbl.alarm_type = outer_tbl.alarm_type 
        and outer_tbl.event_phase = 'start'
        and inner_tbl.event_phase = 'end' 
        and outer_tbl.id < inner_tbl.id

        UPDATE outer_tbl set start_on = outer_tbl.observed_on, end_on = inner_tbl.observed_on, outer_tbl.is_active = 0, row_key = 1
        from AlarmObservations outer_tbl, Alarmobservations inner_tbl
        where inner_tbl.patient_id = outer_tbl.patient_id
        and inner_tbl.patient_visit_id = outer_tbl.patient_visit_id
        and inner_tbl.patient_order_id = outer_tbl.patient_order_id
        and inner_tbl.device_id = outer_tbl.device_id
        and inner_tbl.alarm_type = outer_tbl.alarm_type 
        and outer_tbl.event_phase = 'start'
        and inner_tbl.event_phase = 'end' 
        and outer_tbl.id < inner_tbl.id

        Delete AlarmObservations where is_active = 1 and row_key = 2
      END

			UPDATE PO SET device_id = @device_id, latest_device_observation_id = @dev_obs_id,
			latest_alarm_observation_id = 
				CASE WHEN (LOWER(event_phase) = 'end' AND LOWER(alarm_status) = 'inactive') THEN 0 ELSE @alarm_obs_id END
			FROM PatientOrders PO, AlarmObservations AO
			WHERE PO.id = @patient_order_id 
			AND AO.id = @alarm_obs_id 
			AND AO.device_id = @device_id 
			AND PO.patient_id = AO.patient_id
			AND PO.patient_visit_id = AO.patient_visit_id
		END
		ELSE
		BEGIN
			IF EXISTS (SELECT 1 FROM PatientOrders WHERE id = @patient_order_id AND ISNULL(latest_device_observation_id, 0) = 0)
			BEGIN
				UPDATE PO SET 
				rate = DO.rate,
				dose = DO.dose,
				dose_limit = DO.dose_limit,
				strength = DO.strength,
				volume_tbi = DO.volume_tbi,
				lockout = DO.lockout_time,
				--time_expected = DO.time_expected,
				rate_unit_code = DO.rate_unit_code,
				rate_unit_displaytext = DO.rate_unit_displaytext,
				rate_unit_system = DO.rate_unit_system,
				dose_unit_code = DO.dose_unit_code,
				dose_unit_displaytext = DO.dose_unit_displaytext,
				dose_unit_system = DO.dose_unit_system,
				volume_unit_code = DO.volume_unit_code,
				volume_unit_displaytext = DO.volume_unit_displaytext,
				volume_unit_system = DO.volume_unit_system,
				strength_unit_code = DO.strength_unit_code,
				strength_unit_displaytext = DO.strength_unit_displaytext,
				strength_unit_system = DO.strength_unit_system,
				time_unit_code = DO.time_unit_code,
				time_unit_displaytext = DO.time_unit_displaytext,
				time_unit_system = DO.time_unit_system,
				device_id = @device_id,
				--order_status = DO.delivery_status, 
				latest_device_observation_id = @dev_obs_id,
				latest_alarm_observation_id = @alarm_obs_id
				FROM PatientOrders PO, DeviceObservations DO
				WHERE PO.id = @patient_order_id AND DO.id = @dev_obs_id 
				AND DO.patient_order_id = PO.id
				AND DO.device_id = @device_id 
				AND PO.patient_id = DO.patient_id
				AND PO.patient_visit_id = DO.patient_visit_id
			END
			ELSE
			BEGIN
        UPDATE PO SET 
          --order_status = DO.delivery_status, 
					latest_device_observation_id = @dev_obs_id,
					latest_alarm_observation_id = @alarm_obs_id
				FROM PatientOrders PO, DeviceObservations DO
				WHERE PO.id = @patient_order_id 
				AND DO.id = @dev_obs_id 
				AND DO.patient_order_id = PO.id
				AND DO.device_id = @device_id 
				AND PO.patient_id = DO.patient_id
				AND PO.patient_visit_id = DO.patient_visit_id
			END
		END
	END
	SELECT @dev_obs_id AS id
	`;

  sql_insert_alarm_obs = `
	DECLARE @alarm_obs_id bigint 
  
	INSERT INTO AlarmObservations
	(ihe_msg_id, device_id, patient_id, patient_visit_id, patient_order_id, patient_medication_id, 
    observed_on, device_displaytext, power_status, maintenance_status, alarm_type, alarm_type_desc, event_phase, 
		alarm_status, alert_type, alarm_user_status, alarm_user_status_changed_by, 
		alarm_user_status_changed_on, alarm_user_status_reason, 
		created_by, created_on, is_active, point_of_care, room, bed, start_on)
	VALUES
	(@ihe_msg_id, @device_id, @patient_id, @patient_visit_id, @patient_order_id, @patient_medication_id, 
    @observed_on, @device_displaytext, @power_status, @maintenance_status, @alarm_type, @alarm_type_desc, @event_phase, 
		@alarm_status, @alert_type, @alarm_user_status, @alarm_user_status_changed_by, 
		@alarm_user_status_changed_on, @alarm_user_status_reason, @created_by, @created_on, @is_active, @point_of_care, 
    @room, @bed, @observed_on)
	
	SELECT @alarm_obs_id = SCOPE_IDENTITY()
	
	SELECT @alarm_obs_id AS id
	`;

  sql_find_patient_by_key = `SELECT COALESCE(id, -1) AS id FROM patients WHERE row_key = @row_key`;
  sql_find_patient_by_PID = `SELECT COALESCE(id, -1) AS id FROM patients WHERE identifier = @PID`;
  sql_find_patient_visit_by_key = `SELECT COALESCE(id, -1) AS id FROM patientvisits  WHERE patient_id = @patient_id AND row_key = @row_key`;
  sql_find_patient_visit_by_attributes = `SELECT COALESCE(id, -1) AS id FROM patientvisits  
    WHERE patient_id = @patient_id AND 
    point_of_care =  @point_of_care AND room = @room AND bed = @bed AND visit_number = @visit_number`;
  sql_find_patient_order_by_order_code = `
		SELECT COALESCE(id, -1) AS id FROM patientorders 
		WHERE patient_id = @patient_id AND patient_visit_id = @patient_visit_id AND order_code = @order_code`;
  sql_find_patient_order_by_key = `
			SELECT COALESCE(id, -1) AS id FROM patientorders 
			WHERE patient_id = @patient_id AND patient_visit_id = @patient_visit_id AND row_key = @row_key`;

  sql_find_patient_medication_id_by_order_id = `
		SELECT COALESCE(patient_medication_id, -1) AS patient_medication_id FROM patientorders WHERE patient_id = @patient_id AND patient_visit_id = @patient_visit_id AND id = @id`;

  sql_find_patient_medication_by_key = `SELECT COALESCE(id, -1) AS id FROM patientmedications WHERE patient_id = @patient_id AND patient_visit_id = @patient_visit_id AND prescription_number = @prescription_number`;

  sql_find_order_id_for_alarms_without_order = `
		SELECT po.id patient_order_id, pm.id patient_medication_id 
		from patientorders po
		inner join patientmedications pm on pm.patient_order_id = po.id and pm.device_id = po.device_id 
		and pm.patient_id = po.patient_id 
		inner join devices d on d.id = po.device_id
		and concat(po.patient_id, po.patient_visit_id, po.device_id) in 
		(select concat(devobs.patient_id, devobs.patient_visit_id, devobs.device_id) 
		from deviceobservations devobs where devobs.patient_id = po.patient_id and devobs.patient_visit_id = po.patient_visit_id 
		and devobs.device_id = po.device_id 
		)
		`;

  sql_update_patientvisit_for_discharge = `UPDATE patientvisits  SET is_active = 0, is_discharged = @is_discharged, discharged_dttm = @discharged_on, modified_on = @modified_on WHERE id = @id returning *`;

  async findPatientByKey(row_key: string): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_find_patient_by_key, {
          row_key,
        });
        /* var qb = new this.utils.QueryBuilder(this.sql_find_patient_by_key);
				if (_key != "") {
					qb.addParameter("key", _key, "=");
				}
				var query_string = qb.getQuery();
				const rows = await db.executeQuery(query_string); */
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientByPatientID(PID: string): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_find_patient_by_PID, {
          PID,
        });
        /* var qb = new this.utils.QueryBuilder(this.sql_find_patient_by_key);
				if (_key != "") {
					qb.addParameter("key", _key, "=");
				}
				var query_string = qb.getQuery();
				const rows = await db.executeQuery(query_string); */
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientVisitByKey(
    _patient_id: number,
    row_key: string
  ): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_find_patient_visit_by_key, {
          patient_id: _patient_id,
          row_key,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientVisitByVisitAttributes(
    _patient_id: number, point_of_care: string, room: string, bed: string, visit_number: string
  ): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_find_patient_visit_by_attributes, {
          patient_id: _patient_id, point_of_care, room, bed, visit_number});
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientOrderByOrderCode(
    _patient_id: number,
    _patient_visit_id: number,
    _order_identifier: string
  ): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_find_patient_order_by_order_code,
          {
            patient_id: _patient_id,
            patient_visit_id: _patient_visit_id,
            order_code: _order_identifier,
          }
        );
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientOrderByKey(
    _patient_id: number,
    _patient_visit_id: number,
    row_key: string
  ): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_find_patient_order_by_key, {
          patient_id: _patient_id,
          patient_visit_id: _patient_visit_id,
          row_key,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientMedicationByOrderID(
    _patient_id: number,
    _patient_visit_id: number,
    _order_id: number
  ): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_find_patient_medication_id_by_order_id,
          {
            patient_id: _patient_id,
            patient_visit_id: _patient_visit_id,
            id: _order_id,
          }
        );
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async findPatientMedicationByKey(
    _patient_id: number,
    _patient_visit_id: number,
    prescription_number: string
  ): Promise<number> {
    var result: number = -1;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_find_patient_medication_by_key,
          {
            patient_id: _patient_id,
            patient_visit_id: _patient_visit_id,
            prescription_number,
          }
        );
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async savePatientData(_patient_data: PatientModel): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          ihe_msg_id,
          given_name,
          family_name,
          patient_id,
          patient_id_type,
          patient_id_authority,
          date_of_birth,
          gender,
          enterprise_id,
          location_id,
          key,
          created_by,
          created_on,
          is_active,
        } = _patient_data;

        const rows = await db.executeQuery(this.sql_insert_patient, {
          ihe_msg_id: ihe_msg_id,
          first_name: given_name,
          last_name: family_name,
          identifier: patient_id,
          identifier_type_id: patient_id_type,
          identifier_authority: patient_id_authority,
          dob: date_of_birth,
          gender,
          enterprise_id,
          ent_location_id: location_id,
          row_key: key,
          created_by,
          created_on,
          is_active,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async savePatientIdentifierData(_patient_id: number, _pat_identifier_type: string, _pat_identifier_value:string): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();

        const rows = await db.executeQuery(this.sql_insert_patient_identifiers, {
          patient_id: _patient_id,
          identifier_type: _pat_identifier_type,
          identifier_value: _pat_identifier_value
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_id,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async savePatientVisitData(
    _patient_visit_data: PatientVisitModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          ihe_msg_id,
          patient_id,
          admission_on,
          nursing_unit,
          room,
          bed,
          facility,
          building,
          floor,
          patient_class,
          key,
          visit_number,
          attending_doctor_id,
          attending_doctor_family_name,
          attending_doctor_given_name,
          created_by,
          created_on,
          is_active,
        } = _patient_visit_data;

        const rows = await db.executeQuery(this.sql_insert_patientvisit, {
          ihe_msg_id,
          patient_id,
          admission_dttm: admission_on,
          point_of_care: nursing_unit,
          room,
          bed,
          facility,
          building,
          floor,
          patient_adm_class: patient_class,
          row_key: key,
          visit_number,
          attending_dr_code: attending_doctor_id,
          attending_dr_family_name: attending_doctor_family_name,
          attending_dr_given_name: attending_doctor_given_name,
          created_by,
          created_on,
          is_active,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_visit_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async savePatientOrderData(
    _patient_order_data: PatientOrderModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          ihe_msg_id,
          device_id,
          patient_id,
          ordered_on,
          order_id,
          order_type,
          action_by_id,
          action_by_family_name,
          action_by_given_name,
          key,
          assigning_authority,
          order_universal_id,
          order_universal_name,
          patient_visit_id,
          created_by,
          created_on,
          is_active,
          patient_medication_id,
          medication_base_id,
          medication_additive_id,
          volume_tbi,
          volume_unit_code,
          volume_unit_name,
          volume_unit_system,
          time_expected,
          time_unit_code,
          time_unit_name,
          strength,
          strength_unit_code,
          strength_unit_name,
          strength_unit_system,
          ordering_provider_id,
          ordering_provider_family_name,
          ordering_provider_given_name,
          concentration,
          concentration_unit,
          concentration_final,
          concentration_final_unit,
          order_status,
          diluent,
          diluent_unit,
          rate,
          rate_unit_name,
          dose,
          dose_unit_name
        } = _patient_order_data;

        const rows = await db.executeQuery(this.sql_insert_patientorder, {
          ihe_msg_id,
          device_id,
          patient_id,
          ordered_on,
          order_code: order_id,
          order_type,
          action_by_code: action_by_id,
          action_by_family_name,
          action_by_given_name,
          row_key: key,
          assigning_authority,
          order_universal_code: order_universal_id,
          order_universal_displaytext: order_universal_name,
          patient_visit_id,
          created_by,
          created_on,
          is_active,
          patient_medication_id,
          medication_base_id,
          medication_additive_id,
          volume_tbi,
          volume_unit_code,
          volume_unit_displaytext: volume_unit_name,
          volume_unit_system,
          time_expected,
          time_unit_code,
          time_unit_displaytext: time_unit_name,
          strength,
          strength_unit_code,
          strength_unit_displaytext: strength_unit_name,
          strength_unit_system,
          ordering_provider_id,
          ordering_provider_family_name,
          ordering_provider_given_name,
          concentration,
          concentration_unit,
          concentration_final,
          concentration_final_unit,
          order_status,
          diluent,
          diluent_unit,
          rate,
          rate_unit_name,
          dose,
          dose_unit_name
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_order_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async savePatientMedicationData(
    _patient_medication_data: PatientMedicationModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          ihe_msg_id,
          device_id,
          patient_id,
          key,
          drug_type,
          drug_code,
          drug_name,
          patient_order_id,
          patient_visit_id,
          rate,
          rate_unit_code,
          rate_unit_name,
          rate_unit_system,
          dose,
          dose_unit_code,
          dose_unit_name,
          dose_unit_system,
          volume_tbi,
          volume_unit_code,
          volume_unit_name,
          volume_unit_system,
          strength,
          strength_unit_code,
          strength_unit_name,
          strength_unit_system,
          created_by,
          created_on,
          is_active,
          prescribed_on,
          dispense_code,
          prescription_number,
          time_expected,
          time_unit_name,
          route_id,
          route_text,
        } = _patient_medication_data;

        const rows = await db.executeQuery(this.sql_insert_patientmedication, {
          ihe_msg_id,
          device_id,
          patient_id,
          row_key: key,
          drug_type,
          drug_code,
          drug_displaytext: drug_name,
          patient_order_id,
          patient_visit_id,
          rate,
          rate_unit_code,
          rate_unit_displaytext: rate_unit_name,
          rate_unit_system,
          dose,
          dose_unit_code,
          dose_unit_displaytext: dose_unit_name,
          dose_unit_system,
          volume_tbi,
          volume_unit_code,
          volume_unit_displaytext: volume_unit_name,
          volume_unit_system,
          strength,
          strength_unit_code,
          strength_unit_displaytext: strength_unit_name,
          strength_unit_system,
          created_by,
          created_on,
          is_active,
          prescribed_on,
          dispense_code,
          prescription_number,
          time_expected,
          time_unit_displaytext: time_unit_name,
          route_identifier: route_id,
          route_displaytext: route_text,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_medication_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async updatePatientMedicationData(
    _patient_medication_data: PatientMedicationModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          id,
          rate,
          rate_unit_code,
          rate_unit_name,
          dose,
          dose_unit_code,
          dose_unit_name,
          volume_tbi,
          volume_unit_code,
          volume_unit_name,
          strength,
          strength_unit_code,
          strength_unit_name,
          drug_code,
          drug_name,
        } = _patient_medication_data;

        const rows = await db.executeQuery(this.sql_update_patientmedication, {
          id,
          rate,
          rate_unit_code,
          rate_unit_displaytext: rate_unit_name,
          dose,
          dose_unit_code,
          dose_unit_displaytext: dose_unit_name,
          volume_tbi,
          volume_unit_code,
          volume_unit_displaytext: volume_unit_name,
          strength,
          strength_unit_code,
          strength_unit_displaytext: strength_unit_name,
          drug_code,
          drug_displaytext: drug_name,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_medication_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async saveDeviceObservationData(
    _device_obs_data: DeviceObservationModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          ihe_msg_id,
          device_id,
          patient_id,
          patient_visit_id,          
          patient_order_id,
          patient_medication_id,
          observations,
          device_name,
          device_mds,
          device_vmd,
          device_channel,
          device_mode,
          device_status,
          rate_unit_code,
          rate_unit_name,
          rate_unit_system,
          dose_unit_code,
          dose_unit_name,
          dose_unit_system,
          volume_unit_code,
          volume_unit_name,
          volume_unit_system,
          strength_unit_code,
          strength_unit_name,
          strength_unit_system,
          dose,
          dose_limit,
          rate,
          strength,
          volume_delivered,
          volume_tbi,
          volume_remain,
          lockout,
          time_plan,
          time_remain,
          time_expected,
          time_unit_code,
          time_unit_name,
          time_unit_system,
          alarm_id,
          delivery_status,
          created_by,
          created_on,
          is_active,
          received_on,
          point_of_care,
          room,
          bed
        } = _device_obs_data;

        const rows = await db.executeQuery(this.sql_insert_device_obs, {
          ihe_msg_id,
          _device_id:device_id,
          patient_id,
          patient_visit_id,          
          _patient_order_id:patient_order_id,
          patient_medication_id,
          observations,
          device_displaytext: device_name,
          device_mds,
          device_vmd,
          device_channel,
          device_mode,
          device_status,
          rate_unit_code,
          rate_unit_displaytext: rate_unit_name,
          rate_unit_system,
          dose_unit_code,
          dose_unit_displaytext: dose_unit_name,
          dose_unit_system,
          volume_unit_code,
          volume_unit_displaytext: volume_unit_name,
          volume_unit_system,
          strength_unit_code,
          strength_unit_displaytext: strength_unit_name,
          strength_unit_system,
          dose,
          dose_limit,
          rate,
          strength,
          volume_delivered,
          volume_tbi,
          volume_remain,
          lockout_time: lockout,
          time_plan,
          time_remain,
          time_expected,
          time_unit_code,
          time_unit_displaytext: time_unit_name,
          time_unit_system,
          alarm_id,
          delivery_status,
          created_by,
          created_on,
          is_active,
          observed_on:received_on,
          point_of_care,
          room,
          bed
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error_dev_obs) {
      // throw transaction_error;
      throw new ErrorResponse<DeviceObservationModel>({
        success: false,
        code: transaction_error_dev_obs.code,
        error: transaction_error_dev_obs.detail,
        message: transaction_error_dev_obs.message,
        item: _device_obs_data,
        exception: transaction_error_dev_obs.stack,
      });
    }
    return result;
  }

  async saveAlarmObservationData(
    _alarm_obs_data: AlarmObservationModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          ihe_msg_id,
          device_id,
          patient_id,
          patient_visit_id,
          patient_order_id,
          patient_medication_id,          
          received_on,
          device_name,
          power_status,
          maintenance_status,
          alarm_type,
          alarm_type_desc,
          event_phase,
          alarm_status,
          alert_type,
          alarm_user_status,
          alarm_user_status_changedby,
          alarm_user_status_changedon,
          alarm_user_status_reason,
          created_by,
          created_on,
          is_active,
          point_of_care,
          room,
          bed
        } = _alarm_obs_data;

        const rows = await db.executeQuery(this.sql_insert_alarm_obs, {
          ihe_msg_id,
          device_id,
          patient_id,
          patient_visit_id,
          patient_order_id,
          patient_medication_id,          
          observed_on: received_on,
          device_displaytext: device_name,
          power_status,
          maintenance_status,
          alarm_type,
          alarm_type_desc,
          event_phase,
          alarm_status,
          alert_type,
          alarm_user_status,
          alarm_user_status_changed_by: alarm_user_status_changedby,
          alarm_user_status_changed_on: alarm_user_status_changedon,
          alarm_user_status_reason,
          created_by,
          created_on,
          is_active,
          point_of_care,
          room,
          bed
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<AlarmObservationModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _alarm_obs_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async findOrderIDForAlarmsWithoutOrder(
    _input: PatientorderCriteriaForAlarmsWithoutOrder
  ): Promise<PatientorderForAlarmsWithoutOrder> {
    var result: PatientorderForAlarmsWithoutOrder =
      new PatientorderForAlarmsWithoutOrder();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var query_string = this.sql_find_order_id_for_alarms_without_order;

        if (_input.patient_id != 0) {
          query_string += " where po.patient_id = " + _input.patient_id;
        }
        if (_input.patient_visit_id != 0) {
          query_string +=
            " and po.patient_visit_id = " + _input.patient_visit_id;
          // qb.addParameter("po.patient_visit_id", _input.patient_visit_id, "=");
        }
        if (_input.device_id != 0) {
          query_string += " and po.device_id = " + _input.device_id;
          // qb.addParameter("po.device_id", _input.device_id, "=");
        }
        if (_input.device_serial_id != "") {
          query_string += " and identifier = '" + _input.device_serial_id + "'";
          // qb.addParameter("d.device_serial_id", _input.device_serial_id, "=");
        }
        query_string += " order by po.id desc, pm.id desc";
        // var query_string = qb.getQuery();
        const rows = await db.executeQuery(query_string);
        if (rows != null && rows.length > 0) {
          // result.patient_order_id = new PatientorderForAlarmsWithoutOrder(rows[rows.length-1]).patient_order_id;
          // result.patient_medication_id = new PatientorderForAlarmsWithoutOrder(rows[rows.length-1]).patient_medication_id;
          result.patient_order_id = rows[rows.length - 1].patient_order_id;
          result.patient_medication_id =
            rows[rows.length - 1].patient_medication_id;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async updatePatientVisitForDischarge(
    _patient_visit_id: number,
    _discharge_datetime: Date
  ): Promise<boolean> {
    let result: boolean = false;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var modified_on = new Date();
        var is_discharged = true;
        const rows = await db.executeQuery(
          this.sql_update_patientvisit_for_discharge,
          {
            is_discharged,
            discharged_on: _discharge_datetime,
            modified_on,
            id: _patient_visit_id,
          }
        );
        if (rows != null && rows.length > 0) {
          result = true;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_visit_id,
        exception: transaction_error.stack,
      });
    }
    return result;
  }

  async updatePatientOrderWithAdditives(
    _patient_order_data: PatientOrderModel
  ): Promise<number> {
    let result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          id,
          medication_base_id,
          medication_additive_id,
          volume_tbi,
          volume_unit_code,
          volume_unit_name,
          volume_unit_system,
          strength,
          strength_unit_code,
          strength_unit_name,
          strength_unit_system,
        } = _patient_order_data;

        const rows = await db.executeQuery(this.sql_update_patientorder, {
          id,
          medication_base_id,
          medication_additive_id,
          volume_tbi,
          volume_unit_code,
          volume_unit_name,
          volume_unit_system,
          strength,
          strength_unit_code,
          strength_unit_name,
          strength_unit_system,
        });
        if (rows != null && rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      throw new ErrorResponse<PatientModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _patient_order_data,
        exception: transaction_error.stack,
      });
    }
    return result;
  }
}
