import _ from "lodash";
import { DB, using } from "../../global/utils";
import {
  AlarmObservations,
  AlarmActorObservationsRES,
} from "../models/alarmobservations.model";
import { BaseService } from "./base.service";
import { Devices } from "../models/devices.model";
import { IVGatewayAssociationWrapper } from "../models/ivgateway.model";
import { DevicePeopleService } from "./devicepeople.service";
import {
  DevicePeople,
  DevicePeopleWrapper,
} from "../models/devicepeople.model";
import { AlarmService } from "./alarm.service";

export class AlarmObservationsService extends BaseService {
  sql_select: string = `
      SELECT alarmobservations.id, alarmobservations.ihe_msg_id, alarmobservations.patient_id, alarmobservations.patient_visit_id, alarmobservations.patient_order_id, alarmobservations.patient_medication_id, alarmobservations.device_id, alarmobservations.observations, alarmobservations.observed_on, alarmobservations.device_displaytext, alarmobservations.power_status, alarmobservations.maintenance_status, alarmobservations.alarm_type, alarmobservations.alarm_type_desc, alarmobservations.event_phase, alarmobservations.alarm_status, alarmobservations.alert_type, alarmobservations.alarm_user_status, alarmobservations.alarm_user_status_changed_by, alarmobservations.alarm_user_status_changed_on, alarmobservations.alarm_user_status_reason, alarmobservations.who_acted, alarmobservations.when_acted, alarmobservations.act_status, alarmobservations.enterprise_id, alarmobservations.ent_location_id, alarmobservations.row_key, alarmobservations.created_by, alarmobservations.modified_by, alarmobservations.created_on, alarmobservations.modified_on, alarmobservations.is_active, alarmobservations.is_suspended, alarmobservations.parent_id, alarmobservations.is_factory, alarmobservations.notes
      FROM alarmobservations 
      @condition;
      `;

  sql_insert: string = `
INSERT INTO alarmobservations(ihe_msg_id, patient_id, patient_visit_id, patient_order_id, patient_medication_id, device_id, observations, observed_on, device_displaytext, power_status, maintenance_status, alarm_type, alarm_type_desc, event_phase, alarm_status, alert_type, alarm_user_status, alarm_user_status_changed_by, alarm_user_status_changed_on, alarm_user_status_reason, who_acted, when_acted, act_status, enterprise_id, ent_location_id, row_key, created_by, modified_by, created_on, modified_on, is_active, is_suspended, parent_id, is_factory, notes)
VALUES (@ihe_msg_id, @patient_id, @patient_visit_id, @patient_order_id, @patient_medication_id, @device_id, @observations, @observed_on, @device_displaytext, @power_status, @maintenance_status, @alarm_type, @alarm_type_desc, @event_phase, @alarm_status, @alert_type, @alarm_user_status, @alarm_user_status_changed_by, @alarm_user_status_changed_on, @alarm_user_status_reason, @who_acted, @when_acted, @act_status, @enterprise_id, @ent_location_id, @row_key, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE alarmobservations
    SET  ihe_msg_id = @ihe_msg_id, patient_id = @patient_id, patient_visit_id = @patient_visit_id, patient_order_id = @patient_order_id, patient_medication_id = @patient_medication_id, device_id = @device_id, observations = @observations, observed_on = @observed_on, device_displaytext = @device_displaytext, power_status = @power_status, maintenance_status = @maintenance_status, alarm_type = @alarm_type, alarm_type_desc = @alarm_type_desc, event_phase = @event_phase, alarm_status = @alarm_status, alert_type = @alert_type, alarm_user_status = @alarm_user_status, alarm_user_status_changed_by = @alarm_user_status_changed_by, alarm_user_status_changed_on = @alarm_user_status_changed_on, alarm_user_status_reason = @alarm_user_status_reason, who_acted = @who_acted, when_acted = @when_acted, act_status = @act_status, enterprise_id = @enterprise_id, ent_location_id = @ent_location_id, row_key = @row_key, created_by = @created_by, modified_by = @modified_by, created_on = @created_on, modified_on = @modified_on, is_active = @is_active, is_suspended = @is_suspended, parent_id = @parent_id, is_factory = @is_factory, notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM alarmobservations
   WHERE id = @id
   RETURNING *; `;

  sql_get_devices_and_alarms = `select devices.id, devices.category, devices.display_text, devices.identifier, 
    AlarmObservations.id from devices 
	  inner join AlarmObservations on AlarmObservations.id = devices.id where AlarmObservations.alarm_status = 'active' `;
  //  `select d.id, d.device_name, d.device_type, device_serial_id,
  // count(a.id) alarm_count from device , alarmobservation a
  // where d.id = a.device_id
  // and a.alarm_type <> 'MDC_EVT_IDLE' and a.alarm_status = 'active'
  // group by d.id, d.device_name, d.device_type, device_serial_id
  // `;

  sql_get_alarmobservations_byid = `select aa.id,aa.patient_visit_id,aa.device_id,d.display_text device_displaytext 
  from AlarmObservations aa left join Devices d on aa.device_id = d.id where aa.id = @id
  `;

  sql_get_alarmactor_observations_byid = `
  
 with alarmusers
 as
 (
 select '1' readonlyuser, alarmobservations.id,Users.id userid,0 teamid,PointofCare.id pocid,
 PointofCare.display_text poc_name,PatientVisits.room,PatientVisits.bed,PointofCare.identifier poc_identifier,
 alarmobservations.alarm_type, Devices.display_text device_displaytext
 from alarmobservations
 inner join Devices on alarmobservations.device_id = Devices.id
 inner join PatientVisits on PatientVisits.patient_id = alarmobservations.patient_id
 inner join PointofCare on PointofCare.identifier = PatientVisits.point_of_care
 inner join PointofCareSubscribers on PointofCareSubscribers.poc_id = PointofCare.id
 
 inner join Users on Users.id = PointofCareSubscribers.subscriber_id
 where  alarmobservations.id = @alarm_id
 union all
 
 select case when readonlytable.identifier = 'READONLY' then '1' else '0' end readonlyuser, 
 alarmobservations.id,Users.id userid,teams.id teamid,PointofCare.id pocid, 
 PointofCare.display_text poc_name,PatientVisits.room,PatientVisits.bed,PointofCare.identifier poc_identifier,	
 alarmobservations.alarm_type, Devices.display_text device_displaytext
 from alarmobservations
 inner join PatientVisits on PatientVisits.patient_id = alarmobservations.patient_id
 inner join Devices on alarmobservations.device_id = Devices.id
 inner join PointofCare on PointofCare.identifier = PatientVisits.point_of_care
 inner join PointofCareEscalation on PointofCareEscalation.poc_id = PointofCare.id
 inner join ReferenceValues on ReferenceValues.id = PointofCareEscalation.escalated_to_type_id
 inner join Teams on teams.id = escalated_to_id
 inner join TeamMembers on TeamMembers.team_id = teams.id
 inner join ReferenceValues readonlytable on readonlytable.id=TeamMembers.member_action_id
 inner join Users on Users.id = TeamMembers.member_id
 where ReferenceValues.identifier ='TEAM' and alarmobservations.id = @alarm_id
 union all

   select '1' as readonlyuser,alarmobservations.id,Users.id userid,0 teamid,PointofCare.id pocid,
 PointofCare.display_text poc_name,PatientVisits.room,PatientVisits.bed,PointofCare.identifier poc_identifier,
 alarmobservations.alarm_type, Devices.display_text device_displaytext
 from alarmobservations
 inner join Devices on alarmobservations.device_id = Devices.id
 inner join PatientVisits on PatientVisits.patient_id = alarmobservations.patient_id
 inner join PointofCare on PointofCare.identifier = PatientVisits.point_of_care
 inner join PointofCareEscalation on PointofCareEscalation.poc_id = PointofCare.id
 inner join ReferenceValues on ReferenceValues.id = PointofCareEscalation.escalated_to_type_id
 inner join Users on Users.id = escalated_to_id
 where ReferenceValues.identifier != 'TEAM' and alarmobservations.id = @alarm_id
 )

 select distinct readonlyuser, id, userid, teamid, pocid, poc_name, room,bed, 
 poc_identifier, alarm_type, device_displaytext from alarmusers`;

  public async select(
    _req: AlarmObservations
  ): Promise<Array<AlarmObservations>> {
    var result: Array<AlarmObservations> = [];
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
    _req: AlarmObservations
  ): Promise<Array<AlarmObservations>> {
    var result: Array<AlarmObservations> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`AlarmObservations.id = ${_req.id}`);
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
          var temp: AlarmObservations = new AlarmObservations();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.ihe_msg_id = v.ihe_msg_id != 0 ? parseInt(v.ihe_msg_id) : 0;
          temp.patient_id = v.patient_id != 0 ? parseInt(v.patient_id) : 0;
          temp.patient_visit_id =
            v.patient_visit_id != 0 ? parseInt(v.patient_visit_id) : 0;
          temp.patient_order_id =
            v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;
          temp.patient_medication_id =
            v.patient_medication_id != 0
              ? parseInt(v.patient_medication_id)
              : 0;
          temp.device_id = v.device_id != 0 ? parseInt(v.device_id) : 0;

          temp.observed_on = v.observed_on;
          temp.device_displaytext =
            v != null && v.device_displaytext.length != 0
              ? v.device_displaytext
              : "";
          temp.power_status =
            v != null && v.power_status.length != 0 ? v.power_status : "";
          temp.maintenance_status =
            v != null && v.maintenance_status.length != 0
              ? v.maintenance_status
              : "";
          temp.alarm_type =
            v != null && v.alarm_type.length != 0 ? v.alarm_type : "";
          temp.alarm_type_desc =
            v != null && v.alarm_type_desc.length != 0 ? v.alarm_type_desc : "";
          temp.event_phase =
            v != null && v.event_phase.length != 0 ? v.event_phase : "";
          temp.alarm_status =
            v != null && v.alarm_status.length != 0 ? v.alarm_status : "";
          temp.alert_type =
            v != null && v.alert_type.length != 0 ? v.alert_type : "";
          temp.alarm_user_status =
            v != null && v.alarm_user_status.length != 0
              ? v.alarm_user_status
              : "";
          temp.alarm_user_status_changed_by =
            v.alarm_user_status_changed_by != 0
              ? parseInt(v.alarm_user_status_changed_by)
              : 0;
          temp.alarm_user_status_changed_on = v.alarm_user_status_changed_on;
          temp.alarm_user_status_reason =
            v != null && v.alarm_user_status_reason.length != 0
              ? v.alarm_user_status_reason
              : "";
          temp.who_acted = v.who_acted != 0 ? parseInt(v.who_acted) : 0;
          temp.when_acted = v.when_acted;
          temp.act_status =
            v != null && v.act_status.length != 0 ? v.act_status : "";
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
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async getAlarmActorObservationsV2(
    _req: AlarmObservations
  ): Promise<Array<AlarmActorObservationsRES>> {
    var result: Array<AlarmActorObservationsRES> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.getAlarmActorObservationsV2Transaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async getAlarmActorObservationsV2Transaction(
    db: DB,
    _req: AlarmObservations
  ): Promise<Array<AlarmActorObservationsRES>> {
    var result: Array<AlarmActorObservationsRES> = [];
    try {
      const rows = await db.executeQuery(
        this.sql_get_alarmactor_observations_byid,
        { alarm_id: _req.id }
      );
      if (rows.length > 0) {
        _.forEach(rows, (v) => {
          var temp: AlarmActorObservationsRES = new AlarmActorObservationsRES();
          temp.id = v.id != null ? parseInt(v.id) : 0;
          temp.user_id = v.userid != null ? parseInt(v.userid) : 0;
          temp.poc_id = v.pocid != null ? parseInt(v.pocid) : 0;
          temp.team_id = v.teamid != null ? parseInt(v.teamid) : 0;
          temp.readonlyuser =
            v.readonlyuser != null && parseInt(v.readonlyuser) == 1
              ? true
              : false;
          temp.poc_name =
            v.poc_name != null && v.poc_name.length > 0 ? v.poc_name : "";
          temp.poc_identifier =
            v.poc_identifier != null && v.poc_identifier.length > 0
              ? v.poc_identifier
              : "";
          temp.room =
            v.room != null && v.room.toString().length > 0 ? v.room : "";
          temp.alarm_type =
            v.alarm_type != null && v.alarm_type.toString().length > 0
              ? v.alarm_type
              : "";
          temp.device_displaytext =
            v.device_displaytext != null &&
            v.device_displaytext.toString().length > 0
              ? v.device_displaytext
              : "";
          temp.bed = v.bed != null && v.bed.toString().length > 0 ? v.bed : "";
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async getAlarmActorObservationsTemp(
    _req: AlarmObservations
  ): Promise<Array<AlarmActorObservationsRES>> {
    var result: Array<AlarmActorObservationsRES> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_get_alarmactor_observations_byid,
          { alarm_id: _req.id }
        );
        /*   if (rows.length > 0) {
          _.forEach(rows, v => {
            var alarm_id = v.id != null ? parseInt(v.id) : 0;
            var escalation_id =
              v.escalation_id != null ? parseInt(v.escalation_id) : 0;

            let index = _.findIndex(result, v => {
              return v.id == alarm_id;
            });
            let is_new = index == -1;
            if (is_new || escalation_id == 0) {
              var temp: AlarmActorObservationsRES = new AlarmActorObservationsRES();
              temp.id = alarm_id;
              temp.user_id = v.userid != null ? parseInt(v.userid) : 0;
              temp.poc_id = v.pocid != null ? parseInt(v.pocid) : 0;
              temp.team_id = v.teamid != null ? parseInt(v.teamid) : 0;
              temp.readonlyuser =
                v.readonlyuser != null && parseInt(v.readonlyuser) == 1
                  ? true
                  : false;
              temp.poc_name =
                v.poc_name != null && v.poc_name.length > 0 ? v.poc_name : "";
              temp.room =
                v.room != null && v.room.toString().length > 0 ? v.room : "";
              temp.bed =
                v.bed != null && v.bed.toString().length > 0 ? v.bed : "";
              result.push(temp);
            } else {
              var user_temp = {
                id: v.userid != null ? parseInt(v.userid) : 0,
                readonly:
                  v.readonlyuser != null && parseInt(v.readonlyuser) == 1
                    ? true
                    : false
              };
              result[index].userlist.push(user_temp);
            }
          });
        } */
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async getAlarmObservationsByID(
    _req: AlarmObservations
  ): Promise<Array<AlarmObservations>> {
    var result: Array<AlarmObservations> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.getAlarmObservationsByIDTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async getAlarmObservationsByIDTransaction(
    db: DB,
    _req: AlarmObservations
  ): Promise<Array<AlarmObservations>> {
    var result: Array<AlarmObservations> = [];
    try {
      const rows = await db.executeQuery(this.sql_get_alarmobservations_byid, {
        id: _req.id,
      });
      if (rows.length > 0) {
        _.forEach(rows, (v) => {
          var temp: AlarmObservations = new AlarmObservations();
          temp.id = v.id != 0 ? parseInt(v.id) : 0;
          temp.patient_visit_id =
            v.patient_visit_id != 0 ? parseInt(v.patient_visit_id) : 0;
          temp.device_id = v.device_id != 0 ? parseInt(v.device_id) : 0;
          temp.device_displaytext =
            v != null && v.device_displaytext.length != 0
              ? v.device_displaytext
              : "";
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async insert(_req: AlarmObservations): Promise<AlarmObservations> {
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
    _req: AlarmObservations
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        patient_visit_id: _req.patient_visit_id,
        patient_order_id: _req.patient_order_id,
        patient_medication_id: _req.patient_medication_id,
        device_id: _req.device_id,
        observations: _req.observations,
        observed_on: _req.observed_on,
        device_displaytext: _req.device_displaytext,
        power_status: _req.power_status,
        maintenance_status: _req.maintenance_status,
        alarm_type: _req.alarm_type,
        alarm_type_desc: _req.alarm_type_desc,
        event_phase: _req.event_phase,
        alarm_status: _req.alarm_status,
        alert_type: _req.alert_type,
        alarm_user_status: _req.alarm_user_status,
        alarm_user_status_changed_by: _req.alarm_user_status_changed_by,
        alarm_user_status_changed_on: _req.alarm_user_status_changed_on,
        alarm_user_status_reason: _req.alarm_user_status_reason,
        who_acted: _req.who_acted,
        when_acted: _req.when_acted,
        act_status: _req.act_status,
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
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async update(_req: AlarmObservations): Promise<AlarmObservations> {
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
    _req: AlarmObservations
  ): Promise<void> {
    try {
      var rows = await db.executeQuery(this.sql_update, {
        id: _req.id,
        ihe_msg_id: _req.ihe_msg_id,
        patient_id: _req.patient_id,
        patient_visit_id: _req.patient_visit_id,
        patient_order_id: _req.patient_order_id,
        patient_medication_id: _req.patient_medication_id,
        device_id: _req.device_id,
        observations: _req.observations,
        observed_on: _req.observed_on,
        device_displaytext: _req.device_displaytext,
        power_status: _req.power_status,
        maintenance_status: _req.maintenance_status,
        alarm_type: _req.alarm_type,
        alarm_type_desc: _req.alarm_type_desc,
        event_phase: _req.event_phase,
        alarm_status: _req.alarm_status,
        alert_type: _req.alert_type,
        alarm_user_status: _req.alarm_user_status,
        alarm_user_status_changed_by: _req.alarm_user_status_changed_by,
        alarm_user_status_changed_on: _req.alarm_user_status_changed_on,
        alarm_user_status_reason: _req.alarm_user_status_reason,
        who_acted: _req.who_acted,
        when_acted: _req.when_acted,
        act_status: _req.act_status,
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
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }
  public async delete(_req: AlarmObservations): Promise<AlarmObservations> {
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
    _req: AlarmObservations
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

  async getDevicesAndAlarms(): Promise<Array<Devices>> {
    let result: Array<Devices> = new Array<Devices>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("db.beginTransaction()");
        const rows = await db.executeQuery(this.sql_get_devices_and_alarms);
        _.forEach(rows, (v, k) => {
          var _device: Devices = v;
          result.push(_device);
        });
        // await db.commitTransaction();
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  createAlarm = async (_req: IVGatewayAssociationWrapper) => {
    try {
      var devicepeople_service = new DevicePeopleService();
      var _req_people = new DevicePeopleWrapper();
      _req_people.device_id = _req.device_id;
      _req_people.patient_id = _req.patient_id;
      _req_people.patient_order_id = _req.patient_order_id;
      _req_people.patient_visit_id = _req.patient_visit_id;

      _req_people.user_id = 0;
      _req_people.valid_from = new Date();
      _req_people.created_on = new Date();
      _req_people.created_by = 0;
      var device_people = await devicepeople_service.getNonDisassociatedDevices(
        _req_people
      );
      if (device_people.length == 0) {
        _req_people.request_status_identifier =
          DevicePeople.ACTION_RESPONSE.ASSOCIATED;
        await devicepeople_service.insert(_req_people);
      }
      var alarm_service = new AlarmService();
      await alarm_service.processMessages(_req.hl7_message);
    } catch (error) {
      throw error;
    }
    return true;
  };
}
