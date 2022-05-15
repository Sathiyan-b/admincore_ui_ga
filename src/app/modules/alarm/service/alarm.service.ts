import { BaseService } from "./base.service";
import { AlarmObservations } from "../models/alarmobservations.model";
import { ErrorResponse } from "../../global/models/errorres.model";
import { AlarmActors } from "../models/alarmactors.model";

import { UserTeamMemberModel, UserTeam } from "../models/userteam.model";

import { AlarmActorsService } from "./alarmactors.service";
import { GuardianUserSessionsService } from "./guardianusersessions.service";
import { GuardianUserSessions } from "../models/guardianusersessions.model";
import { PushNotificationModel } from "../models/pushnotification.model";
import { PushNotificationService } from "./pushnotification.service";
import _ from "lodash";
import { PatientOrderResultAlarmService } from "./patient-order-result-alarm.service";
import { AlarmObservationsService } from "./alarmobservations.service";
import { logger } from "../utils";
import { Hl7Persister } from "../../global/utils/hl7persister";
import { mllp_logger } from "../../global/utils/mllplogger";

import { SchedulerService } from "./scheduler.service";
import {
  AlarmEscalationScheduler,
  Scheduler,
  SchedulerRule,
  ReminderScheduler
} from "../models/scheduler.model";
import moment, { Moment } from "moment";
import { using } from "../../global/utils/usingv2";
import { DB } from "../../global/utils";
import { PatientMedicationsWrapper } from "../models/patientmedications.model";
import { usersocketservice } from "./usersocket.service";
import { AlarmObservationModel } from "../models/alarmobservation.model";
import { PointofcareService } from "./pointofcare.service";
import { Pointofcare, PointofcareEscalation, PointofcareUser } from "../models/pointofcare.model";
import { AlarmsModel } from "../models/alarms.model";

export class AlarmService extends BaseService {

  sql_alarm_select:string = `SELECT * FROM alarms`;

  processMessages = async (data: string) => {
    var TAG = "[ALARM SERVICE PROCESS MESSSAGES ]\t";
    try {
      var service: Hl7Persister = new Hl7Persister();
      var alarm_object: AlarmObservationModel = await service.Persist(data);

      if (alarm_object.id > 0) {
        var alarm_service = new AlarmService();
        var _req: AlarmObservations = new AlarmObservations();
        _req.id = alarm_object.id;
        mllp_logger.info(TAG + "VALUE", alarm_object);
        if (
          alarm_object.alarm_status == "active" &&
          alarm_object.event_phase == "start"
        )
          var is_notification_sent = await alarm_service.sendNotification(_req);
      }
    } catch (error) {
      mllp_logger.error(TAG + "ERROR", error);
      // throw error
    }
  };
  async sendNotification(_req: AlarmObservations, _level: number = 0) {
    var result: boolean = false;
    try {
      await using(this.db_provider.getDisposableDB(), async db => {
        await db.connect();
        result = await this.sendNotificationTransaction(db, _req, _level);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async sendNotificationTransaction(
    db: DB,
    _req: AlarmObservations,
    _level: number = 0
  ) {
    var result: boolean = false;
    try {
      var alarmobservation_service = new AlarmObservationsService();
      var alarm_observations = await alarmobservation_service.getAlarmActorObservationsV2Transaction(
        db,
        _req
      );

      if (alarm_observations.length == 0) {
        var e = new ErrorResponse();
        e.message = "Alarm ID not found";
        throw e;
      }

      /* get pointofcare with poc_name(nursing_unit) from patientvisit  */
      var pointofcare_service = new PointofcareService();
      var _pointofcare_req = new Pointofcare();
      _pointofcare_req.identifier = alarm_observations[0].poc_identifier;
      _pointofcare_req.is_active = true;
      var point_of_care_list = await pointofcare_service.getpoinofCare(
        _pointofcare_req
      );
      if (point_of_care_list.length == 0) {
        let e = new ErrorResponse();
        e.message = "Pointofcare not found";
        throw e;
      }

      var alarm_actor_list: Array<AlarmActors> = [];
      /* subscribers who cant act */
      if (_level == 0) {
        var subscriber_list: Array<PointofcareUser> = _.get(
          point_of_care_list,
          "0.users_attribute",
          []
        );
        // user_list = _.concat(user_list, subscriber_list);
        for (var i = 0, length = subscriber_list.length; i < length; i++) {
          var temp_alarm_actors = new AlarmActors();
          temp_alarm_actors.is_read_only = true;
          temp_alarm_actors.alarm_id = _req.id;
          temp_alarm_actors.poc_id = point_of_care_list[0].id;
          temp_alarm_actors.action_response = "N";
          temp_alarm_actors.user_id = subscriber_list[i].id;
          temp_alarm_actors.user_team_id = 0;
          alarm_actor_list.push(temp_alarm_actors);
        }
      }

      /* extract user or team list from point of care escalation */
      var escalation_list: Array<PointofcareEscalation> = _.get(
        point_of_care_list,
        "0.escalation_attribute",
        []
      );
      var escalation_item: PointofcareEscalation;

      if (escalation_list.length > _level) {
        escalation_item = escalation_list[_level];

        switch (escalation_item.type.toUpperCase()) {
          case PointofcareEscalation.TYPE.user:
            var temp_alarmactor = new AlarmActors();
            temp_alarmactor.is_read_only = true;
            temp_alarmactor.alarm_id = _req.id;
            temp_alarmactor.poc_id = point_of_care_list[0].id;
            temp_alarmactor.action_response = "N";
            temp_alarmactor.user_id = escalation_item.id;
            temp_alarmactor.user_team_id = 0;
            alarm_actor_list.push(temp_alarmactor);

            break;
          case PointofcareEscalation.TYPE.team:
            var userteam_service = new PatientOrderResultAlarmService();
            let _temp_userteam = new UserTeam();
            _temp_userteam.id = escalation_item.id;
            var team_list = await userteam_service.getAllUserTeam(
              _temp_userteam
            );
            var member_list: Array<UserTeamMemberModel> = _.get(
              team_list,
              "0.members_attribute",
              []
            );
            for (var i = 0, length = member_list.length; i < length; i++) {
              let _temp_alarmactor_req = new AlarmActors();
              _temp_alarmactor_req.is_read_only =
                member_list[i].role == UserTeamMemberModel.ROLE.read_only;
              _temp_alarmactor_req.alarm_id = _req.id;
              _temp_alarmactor_req.poc_id = point_of_care_list[0].id;
              _temp_alarmactor_req.action_response = "N";
              _temp_alarmactor_req.user_id = member_list[i].id;
              _temp_alarmactor_req.user_team_id = escalation_item.id;
              alarm_actor_list.push(_temp_alarmactor_req);
            }
            break;
          default:
            break;
        }
      } else {
        var e = new ErrorResponse();
        e.code = 1111;
        e.message = "no escalation available";
        throw e;
      }

      /* Start Escalation scheduler */
      var _data = new AlarmEscalationScheduler();
      _data.alarm_id = _req.id;
      _data.level = _level + 1;
      _data.duration_unit_uom_value = escalation_item.duration_unit_uom_value;
      _data.duration = escalation_item.duration;
      var _scheduler_id = await this.ScheduleEscalation(db, _data);

      /* insert alarm actors into table */
      var alarmactors_service = new AlarmActorsService();
      for (var i = 0, length = alarm_actor_list.length; i < length; i++) {
        alarm_actor_list[i].scheduler_id = _scheduler_id;
        await alarmactors_service.insertTransaction(db, alarm_actor_list[i]);
      }
      /* extract and accumulate token list from the user list */
      var token_list: Array<string> = [];
      var userid_list: Array<number> = [];

      for (var i = 0, length = alarm_actor_list.length; i < length; i++) {
        var user_id = _.get(alarm_actor_list[i], "user_id", 0);
        if (user_id == 0) continue;
        userid_list.push(user_id);

        /* get active user sessions */
        var usersession_service = new GuardianUserSessionsService();
        let _usersession_req = new GuardianUserSessions();
        token_list = await usersession_service.getExpoPushTokenAgainstUser(
          user_id
        );
      }
      logger.info("ALARM SERVICE" + " RESULT TOKEN LIST ", token_list);

      /* send notification via socket */
      if (userid_list.length > 0) {
        userid_list.forEach(async v1 => {
          var pora_service = new PatientOrderResultAlarmService();
          var _alarm_obs = await pora_service.getPendingAlarmsTransaction(
            db,
            alarm_observations[0].id,
            v1
          );
          if (_alarm_obs.length > 0) {
            await usersocketservice.sendAlarmNotification(
              v1,
              _alarm_obs[0]
            );
          }
        });
      }

      if (token_list.length == 0) {
        let _alarmactor_req = new AlarmActors();
        _alarmactor_req.alarm_id = _req.id;
        await alarmactors_service.markAsReadonlyTransaction(
          db,
          _alarmactor_req
        );
        var scheduler_service = new SchedulerService();
        await scheduler_service.inactiveSchedulerTransaction(db, _scheduler_id);
        await this.sendNotificationTransaction(db, _req, _level + 1);
      }
      /* form notification model */
      var notification = new PushNotificationModel();
      notification.token_list = token_list;
      notification.title = alarm_observations[0].poc_name;
      // sub_title: _.get(point_of_care_list, "0.poc_name", "sample");
      notification.body = `${alarm_observations[0].alarm_type
        .split("_")
        .join(" ")}\nDevice - ${
        alarm_observations[0].device_displaytext
      } :: Room - ${alarm_observations[0].room} :: Bed - ${
        alarm_observations[0].bed
      }} `;

      var pushnotification_service = new PushNotificationService();

      /* send notification */
      var ticket_list = await pushnotification_service.sendNotification(
        notification
      );

      /* get receipt for sent notification */
      var receipt_list = await pushnotification_service.getNotificationReceipt(
        ticket_list
      );
      logger.info("ALARM SERVICE" + " RESULT ", receipt_list);
      result = true;
    } catch (error) {
      logger.error("ALARM SERVICE" + " ERROR ", error);
      throw error;
    }
    return result;
  }

  sendReminderNotification = async (_data: ReminderScheduler) => {
    try {
      /* get user session list for Reminder */
      var usersession_service = new GuardianUserSessionsService();
      var token_list = await usersession_service.getExpoPushTokenAgainstUser(
        _data.user_id
      );

      /* get Alarm details against patient_order_id */
      var patient_order_result_alarm_service = new PatientOrderResultAlarmService();
      var _medication_req = new PatientMedicationsWrapper();
      _medication_req.patient_order_id = _data.patient_order_id;
      var _devicewrapper = await patient_order_result_alarm_service.getMedicationWithPatientAndDeviceDetails(
        _medication_req
      );

      /* form notification model */
      var notification = new PushNotificationModel();
      var _message =
        _data.message && _data.message.length != 0
          ? _data.message
          : "Remainder";
      notification.token_list = token_list;
      notification.title = _devicewrapper.patientvisit.point_of_care;
      // sub_title: _.get(point_of_care_list, "0.poc_name", "sample");
      notification.body = `${_message}\nDevice - ${_devicewrapper.devices.display_text} :: Room - ${_devicewrapper.patientvisit.room} :: Bed - ${_devicewrapper.patientvisit.bed}} `;

      var pushnotification_service = new PushNotificationService();

      /* send notification */
      var ticket_list = await pushnotification_service.sendNotification(
        notification
      );

      /* get receipt for sent notification */
      var receipt_list = await pushnotification_service.getNotificationReceipt(
        ticket_list
      );
      logger.info("ALARM SERVICE" + " RESULT ", receipt_list);
    } catch (error) {
      throw error;
    }
  };

  ScheduleEscalation = async (
    db: DB,
    _data: AlarmEscalationScheduler
  ): Promise<number> => {
    var result: number = 0;
    try {
      var trigger_time: Moment = moment();
      switch (_data.duration_unit_uom_value) {
        case PointofcareEscalation.DURATION_UOM_TYPE.SEC:
          trigger_time = moment().add(_data.duration, "seconds");

          break;
        case PointofcareEscalation.DURATION_UOM_TYPE.MIN:
          trigger_time = moment().add(_data.duration, "minutes");

          break;
        case PointofcareEscalation.DURATION_UOM_TYPE.HRS:
          trigger_time = moment().add(_data.duration, "hours");

          break;
        default:
          break;
      }
      var scheduler_service = new SchedulerService();
      var _schedule_rule = new SchedulerRule();
      _schedule_rule.trigger_time = trigger_time.toDate();
      _schedule_rule.scheduler_type = Scheduler.SCHEDULER_TYPES.ESCALATION;
      result = await scheduler_service.createSchedulerTransaction(
        db,
        JSON.stringify(_data),
        _schedule_rule
      );
    } catch (error) {}
    return result;
  };

  async select(): Promise<Array<AlarmsModel>>  {
    let result: Array<AlarmsModel> = new Array<AlarmsModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_alarm_select);
        const rows = await db.executeQuery(qb.getQuery());
        _.forEach(rows, (v: any, k: any) => {
          var alarm_temp = new AlarmsModel();
          alarm_temp.id = v.id;
          alarm_temp.identifier = v.identifier;
          alarm_temp.alarm_desc = v.display_text;
          alarm_temp.is_priority = v.is_priority;
          alarm_temp.created_on = v.created_on;
          alarm_temp.modified_on = v.modified_on;
          alarm_temp.created_by = v.created_by;
          alarm_temp.modified_by = v.modified_by;
          alarm_temp.is_active = v.is_active;
          alarm_temp.is_factory = v.is_factory;
          alarm_temp.is_suspended = v.is_suspended;
          alarm_temp.notes = v.notes;
          alarm_temp.rules = v.rules;
          result.push(alarm_temp);
        });
      });
    }
    catch(error) {
      throw error;
    }
    return result;
  }
}
