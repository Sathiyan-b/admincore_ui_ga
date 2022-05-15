import { using, DB } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import {
  PatientVisitsWrapper,
  PatientVisits,
} from "../models/patientvisits.model";
import { Users, UsersWrapper } from "../models/users.model";
import { DevicesWrapper, Devices } from "../models/devices.model";
import {
  PatientMedications,
  PatientMedicationsWrapper,
} from "../models/patientmedications.model";
import { Patients, PatientsWrapper } from "../models/patients.model";
import {
  AlarmObservations,
  AlarmObservationsWrapper,
} from "../models/alarmobservations.model";
import { AlarmActors, AlarmActorsWrapper } from "../models/alarmactors.model";
import { AlarmActorsService } from "./alarmactors.service";
import axios, { AxiosRequestConfig } from "axios";
import { ActionRes } from "../../global/models/actionres.model";
import { PointofcareEscalation, PointofcareWrapper } from "../models/pointofcare.model";
import { UserTeam, UserTeamMemberModel } from "../models/userteam.model";
import { PatientVisitsService } from "./patientvisits.service";
import { AlarmService } from "./alarm.service";
import { AlarmObservationsService } from "./alarmobservations.service";
import { SchedulerService } from "./scheduler.service";
import PointofcareService from "./pointofcare.service";

export class PatientOrderResultAlarmService extends BaseService {
  // modified
  sql_get_devices_and_alarms = `select d.id, d.display_text, d.category, d.identifier,
  d.manufacturer, d.model, d.type, d.sub_type,
    count(a.id) alarm_count from Devices d, AlarmObservations a
    where d.id = a.device_id
    and a.alarm_type <> 'MDC_EVT_IDLE' and a.alarm_status = 'active'
    group by d.id, d.display_text, d.category,d.identifier,d.manufacturer, 
    d.model, d.type,d.sub_type
  
	`;
  // modified
  sql_get_pending_alarms_against_user_id = `with ActiveOrderingDeviceList As (
    select PatientOrders.id patient_order_id, PatientOrders.patient_id, 
	PatientOrders.patient_visit_id, medication_base_id ,
    rate,rate_unit_displaytext, volume_tbi, volume_unit_displaytext, strength, strength_unit_displaytext ,
	DevicePeople.device_id
	from DevicePeople
	inner join PatientOrders on  PatientOrders.id = DevicePeople.patient_order_id
	where DevicePeople.is_active = 1
    )

	

    --select * from cte_current_alarms
    select a.alarm_status a_alarm_status, a.id alarm_id,a.alarm_type a_alarm_type, a.alarm_type_desc a_alarm_type_desc, d.id, 
      d.display_text, d.category, d.identifier, d.manufacturer, d.model, d.type,
	  d.sub_type, po_cte.medication_base_id, 
      pm.id pm_id, pm.drug_displaytext pm_drug_displaytext, po_cte.rate pm_rate, po_cte.rate_unit_displaytext pm_rate_unit_displaytext, 
      po_cte.volume_tbi pm_volume_tbi, po_cte.volume_unit_displaytext pm_volume_unit_displaytext,
	  po_cte.strength pm_strength,po_cte.strength_unit_displaytext pm_strength_unit_displaytext, po_cte.patient_order_id, 
      p.id p_id, p.last_name p_family_name, p.first_name p_given_name,
      pv.id pv_id, pv.point_of_care pv_nursing_unit, pv.room pv_room, pv.floor pv_floor, pv.patient_adm_class pv_patient_class,
	  aa.user_team_id aa_user_team_id ,aa.is_read_only aa_is_readonly, aa.id aa_id
      from ActiveOrderingDeviceList po_cte
	  inner join devices d on d.id = po_cte.device_id
      inner join alarmobservations a on a.device_id = d.id  and alarm_type <> 'MDC_EVT_IDLE'
      inner join patientvisits pv on pv.id = po_cte.patient_visit_id
      inner join patients p on p.id = po_cte.patient_id
	  inner join patientmedications pm on pm.id = po_cte.medication_base_id
	  left join alarmactors aa on aa.alarm_id = a.id and aa.action_response <> 'A'
     
      where aa.user_id = @user_id
      `;
  // sql_get_pending_alarms_against_user_id = `select distinct a.alarm_status a_alarm_status, a.id alarm_id,a.alarm_type a_alarm_type, a.alarm_type_desc a_alarm_type_desc, d.id,
  // d.display_text, d.category, d.identifier, pm.id pm_id, pm.drug_displaytext pm_drug_displaytext, pm.rate pm_rate, pm.rate_unit_displaytext pm_rate_unit_displaytext,
  // pm.volume_tbi pm_volume_tbi,
  // pm.volume_unit_displaytext pm_volume_unit_displaytext,pm.patient_order_id, p.id p_id, p.last_name p_family_name, p.first_name p_given_name,
  // pv.id pv_id, pv.point_of_care pv_nursing_unit, pv.room pv_room, pv.floor pv_floor, pv.patient_adm_class pv_patient_class,
  // aa.is_read_only aa_is_readonly, aa.id aa_id
  // from devices d
  // inner join alarmobservations a on a.device_id = d.id and a.alarm_status = 'active'
  // inner join patientvisits pv on pv.id = a.patient_visit_id
  // left join (
  //     SELECT alarmactors.*,
  //     rank() OVER (PARTITION BY user_id, alarm_id ORDER BY id DESC) rank
  //     FROM alarmactors
  //   ) aa on aa.alarm_id = a.id
  // left join
  //   (
  //     SELECT patientmedications.*,
  //     rank() OVER (PARTITION BY device_id ORDER BY id DESC) rank
  //     FROM patientmedications
  //   ) pm on pm.device_id = d.id
  // inner join patients p on p.id = pv.patient_id

  // where  a.alarm_type <> 'MDC_EVT_IDLE' and a.alarm_status <> 'accepted' and ( pm.rank <= 1 or pm.rank is NULL ) and ( aa.rank <= 1 or aa.rank is NULL )

  // `;
  // modified
  sql_update_alarmobeservation = `
	UPDATE AlarmObservations
	SET 
		alarm_status = @alarm_status,
		who_acted = @who_acted,
		when_acted = @when_acted
	WHERE id = @id RETURNING *;
	`;
  // modified
  sql_get_alarm_by_id = `
	SELECT id, is_active,ent_location_id, device_id, patient_id, observed_on, observations, device_displaytext, power_status, maintenance_status, 
  alarm_type, event_phase, alarm_status, alert_type, alarm_user_status, 
  alarm_user_status_changed_by, alarm_user_status_changed_on, alarm_user_status_reason, created_by, created_on, modified_by, modified_on, enterprise_id, ent_location_id, is_active, patient_visit_id, who_acted, when_acted, act_status
	FROM AlarmObservations where id = @id
	`;
  // modified
  sql_getdevicemedicationforuserpoc = `
  with userteam_list as (
    SELECT TM.team_id, T.identifier, T.display_text, TM.member_id
	FROM TeamMembers TM, Teams T WHERE T.id = TM.team_id 
	AND T.is_active = 1 and TM.is_active = 1
  ),
  pointofcare_list_with_first_escalation as (
    SELECT poc.id, poc.identifier, poc.display_text, 
    (select top 1 RV.identifier from PointofCareEscalation poc_esc, ReferenceTypes RT, ReferenceValues RV 
    WHERE poc_esc.poc_id = poc.id AND poc_esc.escalated_to_type_id = RV.id AND RT.id = RV.ref_type_id AND RT.identifier = 'POC_ESC_TO_TYPE' order by poc_esc.id) member_type,
    (select top 1 escalated_to_id from PointofCareEscalation WHERE poc_id = poc.id order by id) member_id, 0 as is_subscribed,
    '[{' + STUFF((SELECT '{' + '"escalated_to_type_id":' + convert(varchar, poc_esc.escalated_to_type_id) + 
    ',"escalated_to_id":' + convert(varchar, poc_esc.escalated_to_id) + ',"escalation_level":' + convert(varchar, poc_esc.escalation_level) +
    + ',"escalation_duration":' + convert(varchar, poc_esc.escalation_duration) + ',"escalation_duration_uom":' + convert(varchar, poc_esc.escalation_duration_uom) + '},'
    FROM PointofCareEscalation poc_esc WHERE poc_esc.poc_id = poc.id
    FOR XML PATH('')),1,1,'') + ']' AS escalation_attribute 
    FROM PointofCare AS poc
    GROUP BY poc.id, poc.identifier, poc.display_text
  ),
  pointofcare_list_with_subscribers as (
    SELECT poc.id, poc.identifier, poc.display_text, 'USER' as member_type,
    (select top 1 subscriber_id from PointofCareSubscribers WHERE poc_id = poc.id order by id) member_id, 1 as is_subscribed,
    '[{' + STUFF((SELECT '{' + '"subscriber_id":' + convert(varchar, poc_subs.subscriber_id) +
    ', "subscriber":"' + u.first_name + ' ' + u.last_name + '"},'
    FROM PointofCareSubscribers poc_subs, Users u WHERE poc_subs.poc_id = poc.id AND u.id = poc_subs.subscriber_id
    FOR XML PATH('')),1,1,'') + ']' AS subscribers_attribute 
    FROM PointofCare AS poc 
    GROUP BY poc.id, poc.identifier, poc.display_text
  ),
  combined_pointofcare_list as (
    select id, identifier, member_id, member_type, is_subscribed from pointofcare_list_with_first_escalation
    union
    select id, identifier, member_id, member_type, is_subscribed from pointofcare_list_with_subscribers
  ),
  user_pointofcare_list as (
  select * from 
    combined_pointofcare_list
    where 
      (member_id in (select member_id from userteam_list ) 
      and member_type = (select RV.identifier from ReferenceValues RV, ReferenceTypes RT where RT.identifier = 'POC_ESC_TO_TYPE' AND RT.id = RV.ref_type_id AND RV.identifier = 'TEAM') or 
      ( member_id = @user_id
      and member_type = (select RV.identifier from ReferenceValues RV, ReferenceTypes RT where RT.identifier = 'POC_ESC_TO_TYPE' AND RT.id = RV.ref_type_id AND RV.identifier = 'USER')))
  ),
  user_pointofcare_patientvisit_list as (
      select * 
      from PatientVisits
      where point_of_care in ( select identifier from user_pointofcare_list ) and is_active = 1
  )
  --select * from user_pointofcare_patientvisit_list
  select distinct
    pm.id,
    pm.drug_displaytext,
    pm.volume_tbi,
    pm.volume_unit_displaytext,
    po.rate,
    po.rate_unit_displaytext,
    pm.time_expected,
    pm.time_unit_displaytext,
    po.id patient_order_id,
    isnull(a.id, 0) has_alarm
  from PatientMedications pm
  inner join PatientOrders po on po.patient_medication_id = pm.id
  left join AlarmObservations a on a.device_id = pm.device_id and a.patient_visit_id = po.patient_visit_id 
  left join AlarmActors aa on aa.alarm_id = a.id and UPPER(aa.action_response) <> 'A'
  where  po.patient_visit_id in ( select id from user_pointofcare_patientvisit_list ) @condition
	`;

  //   sql_get_pending_alarms01 = `
  // 	select distinct a.alarm_status a_alarm_status, a.id alarm_id,a.alarm_type a_alarm_type, a.alarm_type_desc a_alarm_type_desc, d.id, d.display_text, d.category, d.identifier,
  // pm.id pm_id, pm.drug_displaytext pm_drug_displaytext, pm.rate pm_rate, pm.rate_unit_displaytext pm_rate_unit_displaytext, pm.volume_tbi pm_volume_tbi,
  // pm.volume_unit_displaytext pm_volume_unit_displaytext,pm.patient_order_id, p.id p_id, p.dob as p_dob, p.last_name p_family_displaytext, p.first_name p_given_displaytext,
  // pv.id pv_id, pv.point_of_care pv_nursing_unit, pv.room pv_room, pv.floor pv_floor, pv.patient_adm_class pv_patient_class,
  // aa.is_read_only aa_is_readonly, aa.id aa_id
  // from Devices d
  // inner join AlarmObservations a on a.device_id = d.id
  // inner join PatientVisits pv on pv.id = a.patient_visit_id
  // inner join (
  // 		SELECT AlarmActors.*,
  // 		rank() OVER (PARTITION BY user_id, alarm_id ORDER BY id DESC) rank
  // 		FROM AlarmActors
  // 	) aa on aa.alarm_id = a.id
  // left join
  // 	(
  // 		SELECT PatientMedications.*,
  // 		rank() OVER (PARTITION BY device_id ORDER BY id DESC) rank
  // 		FROM PatientMedications
  // 	) pm on pm.device_id = d.id
  // inner join Patients p on p.id = pv.patient_id
  // where  a.alarm_type <> 'MDC_EVT_IDLE' and a.alarm_status <> 'accepted' and ( pm.rank <= 1 or pm.rank is NULL ) and ( aa.rank <= 1 or aa.rank is NULL ) and a.id = @id
  // and aa.user_id = @user_id
  //   `;
  sql_get_pending_alarms = `with cte_current_alarms As (
    select AlarmActors.id aa_id, AlarmActors.is_read_only,AlarmActors.user_team_id, 
   AlarmObservations.id latest_alarm_observation_id, PatientOrders.id patient_order_id, PatientOrders.patient_id, 
   DevicePeople.patient_visit_id, medication_base_id ,
     rate,rate_unit_displaytext, volume_tbi, volume_unit_displaytext, strength, strength_unit_displaytext ,
   DevicePeople.device_id,AlarmObservations.alarm_status,AlarmObservations.id a_id,
   AlarmObservations.alarm_type, AlarmObservations.alarm_type_desc,
   AlarmActors.scheduler_id
   from DevicePeople
   inner join PatientOrders on  PatientOrders.id = DevicePeople.patient_order_id
   inner join AlarmActors on  AlarmActors.user_id = @user_id
   inner join AlarmObservations on AlarmObservations.device_id = DevicePeople.device_id and AlarmObservations.id = @alarm_id
   where DevicePeople.is_active = 1
     )
     --select * from cte_current_alarms
     select distinct aa_id, po_cte.alarm_status a_alarm_status, po_cte.a_id alarm_id,po_cte.alarm_type a_alarm_type, po_cte.alarm_type_desc a_alarm_type_desc, d.id, 
       d.display_text, d.category, d.identifier, d.manufacturer, d.model, d.type,
     d.sub_type, po_cte.medication_base_id, 
       pm.id pm_id, pm.drug_displaytext pm_drug_displaytext, po_cte.rate pm_rate, po_cte.rate_unit_displaytext pm_rate_unit_displaytext, 
       po_cte.volume_tbi pm_volume_tbi, po_cte.volume_unit_displaytext pm_volume_unit_displaytext,po_cte.scheduler_id,
     po_cte.strength pm_strength,po_cte.strength_unit_displaytext pm_strength_unit_displaytext, pm.patient_order_id, 
       p.id p_id, p.last_name p_family_displaytext, p.first_name p_given_displaytext,p.dob p_dob,
       pv.id pv_id, pv.point_of_care pv_nursing_unit, pv.room pv_room, pv.bed pv_bed, pv.floor pv_floor, pv.patient_adm_class pv_patient_class,
     po_cte.user_team_id aa_user_team_id ,po_cte.is_read_only aa_is_readonly, po_cte.device_id
       from cte_current_alarms po_cte
     inner join Devices d on d.id = po_cte.device_id
       inner join patientvisits pv on pv.id = po_cte.patient_visit_id
       inner join patients p on p.id = pv.patient_id
     inner join patientmedications pm on pm.id = po_cte.medication_base_id `;
  /* modified */
  sql_get_latest_medication_device_wise = `SELECT pm.id, patient_order_id, device_id, patient_id, drug_code, drug_displaytext, rate, dose, strength, 
	volume_tbi, rate_unit_displaytext, dose_unit_displaytext, volume_unit_displaytext, 
	concat(d.display_text, '|', d.category, '|', d.identifier) AS device_info
	from PatientMedications pm, devices d WHERE pm.device_id = d.id`;

  // sql_getlatestmedicationforuserpoc = `
  // with userteam_list as (
  //   SELECT tm_outer.team_id, t.identifier, t.display_text, (select top 1 member_id from TeamMembers WHERE team_id = tm_outer.team_ID ORDER BY id) as member_id,
  //   STUFF((SELECT ',' + convert(varchar, tm_inner.member_id) FROM TeamMembers tm_inner WHERE tm_inner.team_ID = tm_outer.team_ID
  //   FOR XML PATH('')),1,1,'') AS member
  //   FROM TeamMembers AS tm_outer, Teams AS T WHERE tm_outer.team_id = t.id
  //   GROUP BY tm_outer.team_id, t.identifier, t.display_text
  // ),
  // pointofcare_list_with_first_escalation as (
  //   SELECT poc.id, poc.identifier, poc.display_text,
  //   (select top 1 RV.identifier from PointofCareEscalation poc_esc, ReferenceTypes RT, ReferenceValues RV
  //   WHERE poc_esc.poc_id = poc.id AND poc_esc.escalated_to_type_id = RV.id AND RT.id = RV.ref_type_id AND RT.identifier = 'POC_ESC_TO_TYPE' order by poc_esc.id) member_type,
  //   (select top 1 escalated_to_id from PointofCareEscalation WHERE poc_id = poc.id order by id) member_id, 0 as is_subscribed,
  //   '[{' + STUFF((SELECT '{' + '"escalated_to_type_id":' + convert(varchar, poc_esc.escalated_to_type_id) +
  //   ',"escalated_to_id":' + convert(varchar, poc_esc.escalated_to_id) + ',"escalation_level":' + convert(varchar, poc_esc.escalation_level) +
  //   + ',"escalation_duration":' + convert(varchar, poc_esc.escalation_duration) + ',"escalation_duration_uom":' + convert(varchar, poc_esc.escalation_duration_uom) + '},'
  //   FROM PointofCareEscalation poc_esc WHERE poc_esc.poc_id = poc.id
  //   FOR XML PATH('')),1,1,'') + ']' AS escalation_attribute
  //   FROM PointofCare AS poc
  //   GROUP BY poc.id, poc.identifier, poc.display_text
  // ),
  // pointofcare_list_with_subscribers as (
  //   SELECT poc.id, poc.identifier, poc.display_text, 'USER' as member_type,
  //   (select top 1 subscriber_id from PointofCareSubscribers WHERE poc_id = poc.id order by id) member_id, 1 as is_subscribed,
  //   '[{' + STUFF((SELECT '{' + '"subscriber_id":' + convert(varchar, poc_subs.subscriber_id) +
  //   ', "subscriber":"' + u.first_name + ' ' + u.last_name + '"},'
  //   FROM PointofCareSubscribers poc_subs, Users u WHERE poc_subs.poc_id = poc.id AND u.id = poc_subs.subscriber_id
  //   FOR XML PATH('')),1,1,'') + ']' AS subscribers_attribute
  //   FROM PointofCare AS poc
  //   GROUP BY poc.id, poc.identifier, poc.display_text
  // ),
  // combined_pointofcare_list as (
  //   select id, identifier, member_id, member_type, is_subscribed from pointofcare_list_with_first_escalation
  //   union
  //   select id, identifier, member_id, member_type, is_subscribed from pointofcare_list_with_subscribers
  // ),
  // user_pointofcare_list as (
  // select * from
  //   combined_pointofcare_list
  //   where
  //     (member_id in (select id from userteam_list where member_id = @user_id )
  //     and member_type = (select RV.identifier from ReferenceValues RV, ReferenceTypes RT where RT.identifier = 'POC_ESC_TO_TYPE' AND RT.id = RV.ref_type_id AND RV.identifier = 'TEAM') or
  //     ( member_id = @user_id
  //     and member_type = (select RV.identifier from ReferenceValues RV, ReferenceTypes RT where RT.identifier = 'POC_ESC_TO_TYPE' AND RT.id = RV.ref_type_id AND RV.identifier = 'USER')))
  // ),
  // user_pointofcare_patientvisit_list as (
  //   select * from Patientvisits
  //   where point_of_care in ( select identifier from user_pointofcare_list ) and is_active = 1
  // )

  // SELECT pm.* from Patientmedications pm
  // inner join Patientorders po on po.id = pm.patient_order_id
  // where po.patient_visit_id in ( select id from user_pointofcare_patientvisit_list)

  // `;

  sql_getlatestmedicationforuserpoc = `
  with cte_current_alarms As (
    select id, device_id, patient_id, patient_visit_id, medication_base_id, latest_device_observation_id, latest_alarm_observation_id 
    from PatientOrders where latest_alarm_observation_id > 0
    )
    --select * from cte_current_alarms
    select distinct a.alarm_status a_alarm_status, a.id alarm_id,a.alarm_type a_alarm_type, a.alarm_type_desc a_alarm_type_desc, d.id, 
      d.display_text, d.category, d.identifier, po_cte.medication_base_id, 
      pm.id pm_id, pm.drug_displaytext pm_drug_displaytext, pm.rate pm_rate, pm.rate_unit_displaytext pm_rate_unit_displaytext, 
      pm.volume_tbi pm_volume_tbi, pm.volume_unit_displaytext pm_volume_unit_displaytext,pm.patient_order_id, 
      p.id p_id, p.last_name p_family_name, p.first_name p_given_name,
      pv.id pv_id, pv.point_of_care pv_nursing_unit, pv.room pv_room, pv.floor pv_floor, pv.patient_adm_class pv_patient_class,
      aa.is_read_only aa_is_readonly, aa.id aa_id
      from devices d
      inner join cte_current_alarms po_cte on po_cte.device_id = d.id
      inner join alarmobservations a on a.device_id = d.id and a.alarm_status = 'active' and a.id = po_cte.latest_alarm_observation_id
      inner join patientvisits pv on pv.id = a.patient_visit_id
      inner join patients p on p.id = pv.patient_id
      left join (
          SELECT alarmactors.*,
          rank() OVER (PARTITION BY user_id, alarm_id ORDER BY id DESC) rank
          FROM alarmactors
        ) aa on aa.alarm_id = a.id
      left join 
        (
          SELECT patientmedications.*,
          rank() OVER (PARTITION BY device_id ORDER BY id DESC) rank
          FROM patientmedications
        ) pm on pm.id = po_cte.medication_base_id
      where  a.alarm_type <> 'MDC_EVT_IDLE' --and ( pm.rank <= 1 or pm.rank is NULL ) and ( aa.rank <= 1 or aa.rank is NULL ) 
      
      `;

  // modified
  sql_get_patients_and_latest_visit_for_userpoc = `
  with PointOfCareUsers
  as
  (
  select poc_id,subscriber_id userid from PointofCareSubscribers
  where subscriber_id = @user_id
  union all
  select PointofCareEscalation.poc_id ,PointofCareEscalation.escalated_to_id userid from ReferenceTypes
  inner join ReferenceValues on ReferenceValues.ref_type_id = ReferenceTypes.id
  inner join PointofCareEscalation on PointofCareEscalation.escalated_to_type_id = ReferenceValues.id
  inner join Users on Users.id = PointofCareEscalation.escalated_to_id
  where  ReferenceTypes.identifier = 'POC_ESC_TO_TYPE' and ReferenceValues.identifier = 'USER'
  and PointofCareEscalation.escalated_to_id = @user_id
  union all
  select PointofCareEscalation.poc_id,TeamMembers.member_id from ReferenceTypes
  inner join ReferenceValues on ReferenceValues.ref_type_id = ReferenceTypes.id
  inner join PointofCareEscalation on PointofCareEscalation.escalated_to_type_id = ReferenceValues.id
  inner join Teams on Teams.id = PointofCareEscalation.escalated_to_id
  inner join TeamMembers on TeamMembers.team_id = Teams.id
  where  ReferenceTypes.identifier = 'POC_ESC_TO_TYPE' and ReferenceValues.identifier = 'TEAM'
  and TeamMembers.member_id = @user_id
  )
 
  select PatientVisits.*, concat(Patients.first_name, ' ' , Patients.last_name, '|', dob, '|', gender, '|', Patients.identifier) patient_info,
      Patients.identifier patient_identifier,
	   (select top 1 AlarmObservations.id 
  from AlarmObservations AlarmObservations
  inner join AlarmActors on AlarmActors.alarm_id = AlarmObservations.id and AlarmActors.action_response = 'N'
  where AlarmObservations.patient_visit_id = PatientVisits.id
  order by AlarmObservations.id desc) has_alarm
  from PatientVisits 
  inner join Patients on Patients.id = PatientVisits.patient_id
  inner join PointofCare on PointofCare.identifier = PatientVisits.point_of_care 
  inner join PointOfCareUsers on PointOfCareUsers.poc_id = PointofCare.id
  where PatientVisits.is_active = 1 and
  patients.id not in (select patient_id from FavouritePatients where user_id = @user_id and is_active = 1)
  `;

  /* modified */
  sql_get_patients_and_latest_visit = `
	select 
	pv.id, concat(p.first_name, ' ' , p.last_name, '|', 
	dob, '|', gender, '|', p.id) patient_info,
	pv.patient_id, pv.visited_on,  pv.room, pv.bed, pv.building, 
	pv.floor, pv.facility, pv.patient_adm_class,pv.point_of_care
	from PatientVisits pv 
	inner JOIN Patients p on p.id = pv.patient_id
	where pv.is_active = true
  `;
  // modified
  sql_get_patients_and_latest_visit_against_user_favourite = `
  select distinct pv.id, concat(p.first_name, ' ' , p.last_name, '|', dob, '|', gender, '|', p.identifier) patient_info,
  pv.patient_id, pv.visited_on, pv.point_of_care, pv.room, pv.bed, pv.building, 
  pv.floor, pv.facility, pv.patient_adm_class_id patient_adm_class, --  a.id has_alarm
  fp.tag_name,fp.tag_colour,fp.id favourite_id,
  (select top 1 AlarmObservations.id 
  from AlarmObservations AlarmObservations
  inner join AlarmActors on AlarmActors.alarm_id = AlarmObservations.id and AlarmActors.action_response = 'N'
  where AlarmObservations.patient_visit_id = pv.id
  order by AlarmObservations.id desc) has_alarm
  from favouritepatients fp
  inner join patientvisits pv on pv.patient_id = fp.patient_id and pv.is_active = 1
  inner JOIN patients p on p.id = fp.patient_id
  where fp.user_id = @user_id 
	`;

  sql_get_medications_patient_wise = `
  with alarmlist
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

select po.id,pm.id, d.id device_id, d.display_text, d.category, d.identifier, 
  d.manufacturer d_manufacturer, d.model d_model,d.type d_type,d.sub_type d_sub_type,
  pm.drug_displaytext, po.id patient_order_id, pm.created_on, po.ordered_on,
  case when alarmlist.activealarms >0 then 'Yes' else 'No' end hasalarm
  from PatientOrders po
  inner join PatientMedications pm on pm.id = po.medication_base_id
  inner join observations on observations.patient_order_id = po.id
  left outer join alarmlist on alarmlist.patient_order_id = po.id
  inner join Devices d on d.id = po.device_id
  where po.patient_visit_id = @patient_visit_id
   `;

  sql_get_graph_data_for_order = `select patient_order_id, 
	(select concat('volume_tbi:', volume_tbi::varchar, ' ', volume_unit_name, '~', 
	'time_plan:', time_plan::varchar, ' ', time_unit_name, '~', 
	'rate:', rate::varchar, ' ', rate_unit_name, '~', 
	'volume_delivered:', volume_delivered::varchar, ' ', volume_unit_name) 
	as order_details from deviceobservation inner_devobs 
	where inner_devobs.patient_order_id = outer_devobs.patient_order_id 
	and volume_tbi > 0 and rate > 0 and volume_delivered > 0 
	order by id desc limit 1),
	string_agg(volume_delivered::text, ', ' ORDER BY id) as volume_delivered, 
	string_agg((time_plan)::text, ', ' ORDER BY id) as time_elapsed,
	min(message_time) as start_on, max(message_time) as end_on, count(1) as total_record
	from deviceobservation outer_devobs where outer_devobs.patient_order_id = $1 group by patient_order_id`;

  sql_getpocforsubscription = `
	with userteam_list as (
    SELECT T.id as team_id, T.identifier, T.display_text, TM.member_id 
      FROM TeamMembers TM, Teams T where T.id = TM.team_id and TM.member_id = @member_id
    ),
  pointofcare_list_with_first_escalation as (
    select poc.id, poc.identifier, poc.display_text, RV1.identifier as member_type, poc_esc.escalated_to_id as member_id, 0 as is_subscribed
    from PointofCareEscalation poc_esc, PointofCare poc, ReferenceTypes RT1, ReferenceValues RV1
    where poc_esc.poc_id = poc.id 
    and ((poc_esc.escalated_to_type_id = RV1.id and RT1.id = RV1.ref_type_id and RT1.identifier = 'POC_ESC_TO_TYPE') OR 
      (poc_esc.escalated_to_type_id = RV1.id and RT1.id = RV1.ref_type_id and RT1.identifier = 'POC_ESC_TO_TYPE')) 
    ),
  pointofcare_list_with_subscribers as (
      select poc.id, poc.identifier, poc.display_text, 'USER' as member_type, poc_subs.subscriber_id as member_id, 0 as is_subscribed
    from PointofCareSubscribers poc_subs, PointofCare poc where poc_subs.poc_id = poc.id
    ),
  combined_pointofcare_list as (
      select id, identifier, display_text, member_id, member_type, is_subscribed from pointofcare_list_with_first_escalation
      union
      select id, identifier, display_text, member_id, member_type, is_subscribed from pointofcare_list_with_subscribers
    ),
    --select * from combined_pointofcare_list
  user_pointofcare_list as (
      select distinct id, identifier, display_text from 
      combined_pointofcare_list
      where (member_id in (select team_id from userteam_list where member_id = @member_id ) and member_type = 'TEAM') OR (( member_id = @member_id and member_type = 'USER'))
    )
  select poc.* from PointoFCare poc 
  where id not in ( select id from user_pointofcare_list) and allow_subscriber = 1
  `;
  /* modified */
  sql_getmedicationwithpatientanddevicedetails: string = `
  select 
  p.last_name p_family_name, p.first_name p_given_name, 
  p.dob p_date_of_birth, pv.point_of_care pv_point_of_care, 
   pv.patient_adm_class pv_patient_adm_class, 
  pv.id pv_id, pv.room pv_room,pv.bed pv_bed, pv.floor pv_floor,
  d.display_text d_device_name, d.identifier d_identifier,
  d.manufacturer d_manufacturer, d.model d_model,d.type d_type, d.sub_type d_sub_type,
  po.rate, po.rate_unit_displaytext, po.volume_tbi, pm.volume_unit_displaytext,
  pm.time_expected, pm.time_unit_displaytext, pm.drug_displaytext,po.device_id
from PatientOrders po
inner join patients p on p.id = po.patient_id
inner join PatientMedications pm on po.patient_medication_id = pm.id
inner join PatientVisits pv on pv.id = po.patient_visit_id
inner join Devices d on d.id = po.device_id
where po.id = @patient_order_id
  `;
  /* modified prv(users => patients) */
  sql_getalarmobservationwithpatientvisitanddevice: string = `
	select 
		a.*,
		u.first_name u_f_name, u.middle_name u_m_name, u.last_name u_l_name
	from AlarmObservations a 
	left join Patients u on u.id = a.who_acted
	where a.patient_visit_id = @patient_visit_id and a.device_id = @device_id`;

  async getPatientsAndLatestVisitAgainstUserFavourite(): Promise<
    Array<PatientVisitsWrapper>
  > {
    let result: Array<PatientVisitsWrapper> = new Array<PatientVisitsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await client.query("BEGIN");
        const rows = await db.executeQuery(
          this.sql_get_patients_and_latest_visit_against_user_favourite,
          { user_id: this.user_context.user.id }
        );
        if (rows.length > 0) {
          _.forEach(rows, (v) => {
            if (v != null) {
              var patient_visit: PatientVisitsWrapper =
                new PatientVisitsWrapper();
              patient_visit.id = v.id != null ? parseInt(v.id) : 0;
              patient_visit.favourite_id =
                v.favourite_id != null ? parseInt(v.favourite_id) : 0;
              patient_visit.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";
              patient_visit.patient_id =
                v.patient_id != 0 ? parseInt(v.patient_id) : 0;
              patient_visit.visited_on =
                v.visited_on != null ? v.visited_on : new Date();
              patient_visit.point_of_care =
                v.point_of_care != null && v.point_of_care.length != 0
                  ? v.point_of_care
                  : "";
              patient_visit.room =
                v.room != null && v.room.length != 0 ? v.room : "";
              patient_visit.bed =
                v.bed != null && v.bed.length != 0 ? v.bed : "";
              patient_visit.building =
                v.building != null && v.building.length != 0 ? v.building : "";
              patient_visit.floor =
                v.floor != null && v.floor.length != 0 ? v.floor : "";
              patient_visit.facility =
                v.facility != null && v.facility.length != 0 ? v.facility : "";
              patient_visit.patient_adm_class =
                v.patient_adm_class != null && v.patient_adm_class.length != 0
                  ? v.patient_adm_class
                  : "";
              patient_visit.tag_name =
                v.tag_name != null && v.tag_name.length != 0 ? v.tag_name : "";
              patient_visit.tag_colour =
                v.tag_colour != null && v.tag_colour.length != 0
                  ? v.tag_colour
                  : "";
              patient_visit.has_alarm =
                v.has_alarm != null && v.has_alarm ? v.has_alarm : false;
              result.push(patient_visit);
            }
          });
        }
        // await client.query("COMMIT");
      });
    } catch (transaction_error) {
      var error = transaction_error;
      var e = new ErrorResponse<PatientVisitsWrapper>();
      e.success = false;
      e.error = _.get(transaction_error, "detail", "");
      e.message = _.get(transaction_error, "message", "");
      e.item = null;
      e.exception = _.get(transaction_error, "stack", "");
      throw e;
    }
    return result;
  }
  async getPendingAlarmsAgainstUser() {
    let result: Array<DevicesWrapper> = new Array<DevicesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var rows = await db.executeQuery(
          this.sql_get_pending_alarms_against_user_id,
          {
            user_id: this.user_context.user.id,
          }
        );
        _.forEach(rows, (v, k) => {
          var _device = new DevicesWrapper();
          _device.id =
            v.device_id != null && v.device_id != 0 ? parseInt(v.device_id) : 0;
          _device.display_text =
            v != null && v.display_text != null && v.display_text.length != 0
              ? v.display_text
              : "";
          _device.identifier =
            v != null && v.identifier != null && v.identifier.length != 0
              ? v.identifier
              : "";
          _device.category =
            v != null && v.category != null && v.category.length != 0
              ? v.category
              : "";

          _device.manufacturer =
            v != null && v.manufacturer != null && v.manufacturer.length != 0
              ? v.manufacturer
              : "";
          _device.model =
            v != null && v.model != null && v.model.length != 0 ? v.model : "";
          _device.type =
            v != null && v.type != null && v.type.length != 0 ? v.type : "";
          _device.sub_type =
            v != null && v.sub_type != null && v.sub_type.length != 0
              ? v.sub_type
              : "";

          _device.latest_patient_medication = new PatientMedications();
          _device.latest_patient_medication.drug_displaytext =
            v != null &&
            v.pm_drug_displaytext != null &&
            v.pm_drug_displaytext.length != 0
              ? v.pm_drug_displaytext
              : "";
          _device.latest_patient_medication.rate =
            v.rate != 0 ? parseInt(v.rate) : 0;
          _device.latest_patient_medication.rate_unit_displaytext =
            v != null &&
            v.pm_rate_unit_displaytext != null &&
            v.pm_rate_unit_displaytext.length != 0
              ? v.pm_rate_unit_displaytext
              : "";
          _device.latest_patient_medication.volume_tbi =
            v.pm_volume_tbi != 0 ? parseInt(v.pm_volume_tbi) : 0;
          _device.latest_patient_medication.volume_unit_displaytext =
            v != null &&
            v.pm_volume_unit_displaytext != null &&
            v.pm_volume_unit_displaytext.length != 0
              ? v.pm_volume_unit_displaytext
              : "";

          _device.latest_patient_medication.strength =
            v.pm_strength != 0 ? parseInt(v.pm_strength) : 0;
          _device.latest_patient_medication.strength_unit_displaytext =
            v != null &&
            v.pm_strength_unit_displaytext != null &&
            v.pm_strength_unit_displaytext.length != 0
              ? v.pm_strength_unit_displaytext
              : "";

          _device.latest_patient_medication.patient_order_id =
            v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;

          _device.patient = new Patients();
          _device.patient.id = v.p_id != 0 ? parseInt(v.p_id) : 0;
          _device.patient.first_name =
            v != null && v.p_family_name != null && v.p_family_name.length != 0
              ? v.p_family_name
              : "";
          _device.patient.last_name =
            v != null && v.p_given_name != null && v.p_given_name.length != 0
              ? v.p_given_name
              : "";

          _device.patient_visit = new PatientVisits();
          _device.patient_visit.id = v.p_id != 0 ? parseInt(v.pv_id) : 0;
          _device.patient_visit.point_of_care =
            v != null &&
            v.pv_nursing_unit != null &&
            v.pv_nursing_unit.length != 0
              ? v.pv_nursing_unit
              : "";
          _device.patient_visit.room =
            v != null && v.pv_room != null && v.pv_room.length != 0
              ? v.pv_room
              : "";
          _device.patient_visit.floor =
            v != null && v.pv_floor != null && v.pv_floor.length != 0
              ? v.pv_floor
              : "";
          _device.patient_visit.patient_adm_class =
            v != null &&
            v.pv_patient_class != null &&
            v.pv_patient_class.length != 0
              ? v.pv_patient_class
              : "";

          _device.alarm_observartion = new AlarmObservations();
          _device.alarm_observartion.id =
            v.alarm_id != 0 ? parseInt(v.alarm_id) : 0;
          _device.alarm_observartion.alarm_type =
            v != null && v.a_alarm_type != null && v.a_alarm_type.length != 0
              ? v.a_alarm_type
              : "";
          _device.alarm_observartion.alarm_status =
            v != null &&
            v.a_alarm_status != null &&
            v.a_alarm_status.length != 0
              ? v.a_alarm_status
              : "";
          _device.alarm_observartion.alarm_type_desc =
            v != null &&
            v.a_alarm_type_desc != null &&
            v.a_alarm_type_desc.length != 0
              ? v.a_alarm_type_desc
              : "";

          _device.alarm_actor = new AlarmActors();
          _device.alarm_actor.user_team_id =
            v.aa_user_team_id != null ? parseInt(v.aa_user_team_id) : 0;
          _device.alarm_actor.id =
            v.aa_id != null ? parseInt(v.aa_user_team_id) : 0;
          _device.alarm_actor.is_read_only =
            v != null && v.aa_is_readonly ? v.aa_is_readonly : false;
          _device.alarm_actor.action_response =
            v != null &&
            v.aa_action_response != null &&
            v.aa_action_response.length != 0
              ? v.aa_action_response
              : "";

          result.push(_device);
        });
      });
    } catch (transaction_error) {
      var e = new ErrorResponse<Users>();
      e.success = false;
      e.code = _.get(transaction_error, "code", "");
      e.error = _.get(transaction_error, "detail", "");
      e.message = _.get(transaction_error, "message", "");
      e.item = null;
      e.exception = _.get(transaction_error, "stack", "");
      throw e;
    }
    return result;
  }

  async getDevicesAndAlarms(): Promise<Array<Devices>> {
    let result: Array<Devices> = new Array<Devices>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await client.query("BEGIN");
        const rows = await db.executeQuery(this.sql_get_devices_and_alarms);
        _.forEach(rows, (v, k) => {
          var _device = new Devices();
          _device.id = v.id != 0 ? parseInt(v.id) : 0;
          _device.display_text =
            v != null && v.display_text != null && v.display_text.length != 0
              ? v.display_text
              : "";
          _device.category =
            v != null && v.category != null && v.category.length != 0
              ? v.category
              : "";
          _device.identifier =
            v != null && v.identifier != null && v.identifier.length != 0
              ? v.identifier
              : "";

          _device.manufacturer =
            v != null && v.manufacturer != null && v.manufacturer.length != 0
              ? v.manufacturer
              : "";
          _device.model =
            v != null && v.model != null && v.model.length != 0 ? v.model : "";

          _device.type =
            v != null && v.type != null && v.type.length != 0 ? v.type : "";
          _device.sub_type =
            v != null && v.sub_type != null && v.sub_type.length != 0
              ? v.sub_type
              : "";
          // _device.id = v.id != 0 ? parseInt(v.id) : 0;
          result.push(_device);
        });
        // await client.query("COMMIT");
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async getPendingAlarms(_req: AlarmObservations) {
    let result: Array<DevicesWrapper> = new Array<DevicesWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await client.query("BEGIN");
        const rows = await db.executeQuery(this.sql_get_pending_alarms, {
          alarm_id: _req.id,
          user_id: this.user_context.user.id,
        });
        _.forEach(rows, (v, k) => {
          var _device = new DevicesWrapper();
          _device.id =
            v.device_id != null && v.device_id != 0 ? parseInt(v.device_id) : 0;
          _device.display_text =
            v != null && v.display_text != null && v.display_text.length != 0
              ? v.display_text
              : "";
          _device.identifier =
            v != null && v.identifier != null && v.identifier.length != 0
              ? v.identifier
              : "";
          _device.category =
            v != null && v.category != null && v.category.length != 0
              ? v.category
              : "";

          _device.manufacturer =
            v != null && v.manufacturer != null && v.manufacturer.length != 0
              ? v.manufacturer
              : "";
          _device.model =
            v != null && v.model != null && v.model.length != 0 ? v.model : "";
          _device.type =
            v != null && v.type != null && v.type.length != 0 ? v.type : "";
          _device.sub_type =
            v != null && v.sub_type != null && v.sub_type.length != 0
              ? v.sub_type
              : "";
          _device.latest_patient_medication = new PatientMedications();
          _device.latest_patient_medication.drug_displaytext =
            v != null &&
            v.pm_drug_displaytext != null &&
            v.pm_drug_displaytext.length != 0
              ? v.pm_drug_displaytext
              : "";
          _device.latest_patient_medication.rate =
            v != null && v.po_rate != null && v.po_rate.length != 0
              ? v.po_rate
              : "";
          _device.latest_patient_medication.rate_unit_displaytext =
            v != null &&
            v.po_rate_unit_displaytext != null &&
            v.po_rate_unit_displaytext.length != 0
              ? v.po_rate_unit_displaytext
              : "";
          _device.latest_patient_medication.volume_tbi =
            v != null && v.po_volume_tbi != null && v.po_volume_tbi.length != 0
              ? v.po_volume_tbi
              : "";
          _device.latest_patient_medication.volume_unit_displaytext =
            v != null &&
            v.po_volume_unit_displaytext != null &&
            v.po_volume_unit_displaytext.length != 0
              ? v.po_volume_unit_displaytext
              : "";

          _device.latest_patient_medication.strength =
            v != null && v.po_strength != null && v.po_strength.length != 0
              ? v.po_strength
              : "";
          _device.latest_patient_medication.strength_unit_displaytext =
            v != null &&
            v.po_strength_unit_displaytext != null &&
            v.po_strength_unit_displaytext.length != 0
              ? v.po_strength_unit_displaytext
              : "";

          _device.latest_patient_medication.time_expected =
            v.time_expected != 0 ? parseInt(v.time_expected) : 0;
          _device.latest_patient_medication.time_unit_displaytext =
            v != null &&
            v.time_unit_displaytext != null &&
            v.time_unit_displaytext.length != 0
              ? v.time_unit_displaytext
              : "";
          _device.latest_patient_medication.patient_order_id =
            v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;

          _device.patient = new Patients();
          _device.patient.id = v.p_id != 0 ? parseInt(v.p_id) : 0;
          _device.patient.last_name =
            v != null &&
            v.p_family_displaytext != null &&
            v.p_family_displaytext.length != 0
              ? v.p_family_displaytext
              : "";
          _device.patient.first_name =
            v != null &&
            v.p_given_displaytext != null &&
            v.p_given_displaytext.length != 0
              ? v.p_given_displaytext
              : "";
          // _device.patient.dob = v != null && v.p_dob != new Date() ? v.p_dob : new Date();
          _device.patient.dob = v.p_dob != null ? v.p_dob : new Date();
          _device.patient_visit = new PatientVisits();
          _device.patient_visit.id = v.pv_id != 0 ? parseInt(v.pv_id) : 0;
          _device.patient_visit.point_of_care =
            v != null &&
            v.pv_nursing_unit != null &&
            v.pv_nursing_unit.length != 0
              ? v.pv_nursing_unit
              : "";
          _device.patient_visit.room =
            v != null && v.pv_room != null && v.pv_room.length != 0
              ? v.pv_room
              : "";
          _device.patient_visit.patient_adm_class =
            v != null &&
            v.pv_patient_class != null &&
            v.pv_patient_class.length != 0
              ? v.pv_patient_class
              : "";
          _device.patient_visit.floor =
            v != null && v.pv_floor != null && v.pv_floor.length != 0
              ? v.pv_floor
              : "";
          _device.alarm_observartion = new AlarmObservations();
          _device.alarm_observartion.id =
            v.alarm_id != 0 ? parseInt(v.alarm_id) : 0;
          _device.alarm_observartion.alarm_type =
            v != null && v.alarm_type != null && v.alarm_type.length != 0
              ? v.alarm_type
              : "";
          _device.alarm_observartion.alarm_status =
            v != null &&
            v.a_alarm_status != null &&
            v.a_alarm_status.length != 0
              ? v.a_alarm_status
              : "";
          _device.alarm_observartion.alarm_type_desc =
            v != null &&
            v.a_alarm_type_desc != null &&
            v.a_alarm_type_desc.length != 0
              ? v.a_alarm_type_desc
              : "";
          _device.alarm_actor = new AlarmActors();
          _device.alarm_actor.user_team_id =
            v.aa_user_team_id != null ? parseInt(v.aa_user_team_id) : 0;
          _device.alarm_actor.id = v.aa_id != null ? parseInt(v.aa_id) : 0;
          _device.alarm_actor.user_id =
            v.aa_user_id != null ? parseInt(v.aa_user_id) : 0;
          _device.alarm_actor.is_read_only =
            v != null && v.aa_is_readonly ? v.aa_is_readonly : false;
          _device.alarm_actor.id = v.aa_id != 0 ? parseInt(v.aa_id) : 0;
          _device.alarm_actor.scheduler_id =
            v.scheduler_id != null ? parseInt(v.scheduler_id) : 0;

          result.push(_device);
        });
        // await client.query("COMMIT");
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getPendingAlarmsTransaction(db: DB, alarm_id: number, user_id: number) {
    let result: Array<DevicesWrapper> = new Array<DevicesWrapper>();
    try {
      // await client.query("BEGIN");
      const rows = await db.executeQuery(this.sql_get_pending_alarms, {
        alarm_id: alarm_id,
        user_id,
      });
      _.forEach(rows, (v, k) => {
        var _device = new DevicesWrapper();
        _device.id =
          v.device_id != null && v.device_id != 0 ? parseInt(v.device_id) : 0;
        _device.display_text =
          v != null && v.display_text != null && v.display_text.length != 0
            ? v.display_text
            : "";
        _device.identifier =
          v != null && v.identifier != null && v.identifier.length != 0
            ? v.identifier
            : "";
        _device.category =
          v != null && v.category != null && v.category.length != 0
            ? v.category
            : "";

        _device.manufacturer =
          v != null && v.manufacturer != null && v.manufacturer.length != 0
            ? v.manufacturer
            : "";
        _device.model =
          v != null && v.model != null && v.model.length != 0 ? v.model : "";
        _device.type =
          v != null && v.type != null && v.type.length != 0 ? v.type : "";
        _device.sub_type =
          v != null && v.sub_type != null && v.sub_type.length != 0
            ? v.sub_type
            : "";
        _device.latest_patient_medication = new PatientMedications();
        _device.latest_patient_medication.drug_displaytext =
          v != null &&
          v.pm_drug_displaytext != null &&
          v.pm_drug_displaytext.length != 0
            ? v.pm_drug_displaytext
            : "";
        _device.latest_patient_medication.rate =
          v != null && v.po_rate != null && v.po_rate.length != 0
            ? v.po_rate
            : "";
        _device.latest_patient_medication.rate_unit_displaytext =
          v != null &&
          v.po_rate_unit_displaytext != null &&
          v.po_rate_unit_displaytext.length != 0
            ? v.po_rate_unit_displaytext
            : "";
        _device.latest_patient_medication.volume_tbi =
          v != null && v.po_volume_tbi != null && v.po_volume_tbi.length != 0
            ? v.po_volume_tbi
            : "";
        _device.latest_patient_medication.volume_unit_displaytext =
          v != null &&
          v.po_volume_unit_displaytext != null &&
          v.po_volume_unit_displaytext.length != 0
            ? v.po_volume_unit_displaytext
            : "";

        _device.latest_patient_medication.strength =
          v != null && v.po_strength != null && v.po_strength.length != 0
            ? v.po_strength
            : "";
        _device.latest_patient_medication.strength_unit_displaytext =
          v != null &&
          v.po_strength_unit_displaytext != null &&
          v.po_strength_unit_displaytext.length != 0
            ? v.po_strength_unit_displaytext
            : "";

        _device.latest_patient_medication.time_expected =
          v.time_expected != 0 ? parseInt(v.time_expected) : 0;
        _device.latest_patient_medication.time_unit_displaytext =
          v != null &&
          v.time_unit_displaytext != null &&
          v.time_unit_displaytext.length != 0
            ? v.time_unit_displaytext
            : "";
        _device.latest_patient_medication.patient_order_id =
          v.patient_order_id != 0 ? parseInt(v.patient_order_id) : 0;

        _device.patient = new Patients();
        _device.patient.id = v.p_id != 0 ? parseInt(v.p_id) : 0;
        _device.patient.last_name =
          v != null &&
          v.p_family_displaytext != null &&
          v.p_family_displaytext.length != 0
            ? v.p_family_displaytext
            : "";
        _device.patient.first_name =
          v != null &&
          v.p_given_displaytext != null &&
          v.p_given_displaytext.length != 0
            ? v.p_given_displaytext
            : "";
        // _device.patient.dob = v != null && v.p_dob != new Date() ? v.p_dob : new Date();
        _device.patient.dob = v.p_dob != null ? v.p_dob : new Date();
        _device.patient_visit = new PatientVisits();
        _device.patient_visit.id = v.pv_id != 0 ? parseInt(v.pv_id) : 0;
        _device.patient_visit.point_of_care =
          v != null &&
          v.pv_nursing_unit != null &&
          v.pv_nursing_unit.length != 0
            ? v.pv_nursing_unit
            : "";
        _device.patient_visit.room =
          v != null && v.pv_room != null && v.pv_room.length != 0
            ? v.pv_room
            : "";
        _device.patient_visit.bed =
          v != null && v.pv_bed != null && v.pv_bed.length != 0 ? v.pv_bed : "";
        _device.patient_visit.patient_adm_class =
          v != null &&
          v.pv_patient_class != null &&
          v.pv_patient_class.length != 0
            ? v.pv_patient_class
            : "";
        _device.patient_visit.floor =
          v != null && v.pv_floor != null && v.pv_floor.length != 0
            ? v.pv_floor
            : "";
        _device.alarm_observartion = new AlarmObservations();
        _device.alarm_observartion.id =
          v.alarm_id != 0 ? parseInt(v.alarm_id) : 0;
        _device.alarm_observartion.alarm_type =
          v != null && v.alarm_type != null && v.alarm_type.length != 0
            ? v.alarm_type
            : "";
        _device.alarm_observartion.alarm_status =
          v != null && v.a_alarm_status != null && v.a_alarm_status.length != 0
            ? v.a_alarm_status
            : "";
        _device.alarm_observartion.alarm_type_desc =
          v != null &&
          v.a_alarm_type_desc != null &&
          v.a_alarm_type_desc.length != 0
            ? v.a_alarm_type_desc
            : "";
        _device.alarm_actor = new AlarmActors();
        _device.alarm_actor.user_team_id =
          v.aa_user_team_id != null ? parseInt(v.aa_user_team_id) : 0;
        _device.alarm_actor.id = v.aa_id != null ? parseInt(v.aa_id) : 0;
        _device.alarm_actor.user_id =
          v.aa_user_id != null ? parseInt(v.aa_user_id) : 0;
        _device.alarm_actor.is_read_only =
          v != null && v.aa_is_readonly ? v.aa_is_readonly : false;
        _device.alarm_actor.id = v.aa_id != 0 ? parseInt(v.aa_id) : 0;
        _device.alarm_actor.scheduler_id =
          v.scheduler_id != null ? parseInt(v.scheduler_id) : 0;

        result.push(_device);
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getUserTeamForUser(access_token: string): Promise<Array<UserTeam>> {
    let result: Array<UserTeam> = new Array<UserTeam>();
    try {
      let config: AxiosRequestConfig = {
        headers: {
          Authorization: access_token,
        },
      };
      let url =
        this.environment.AUTH_SERVER_URL +
        this.environment.TEAM_SERVER_TEAM_USER_ENDPOINT;
      try {
        var resp = await axios.get<ActionRes<Array<UserTeam>>>(url, config);
        if (resp.data) {
          result = _.get(resp.data, "item", []);
        }
      } catch (error) {
        let e: any = _.get(error, "response.data");
        let err = new ErrorResponse<UserTeam>();
        err.success = e.success;
        err.code = e.code;
        err.message = e.message;
        err.item = null;
        throw err;
      }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getAllUserTeam(_userteam: UserTeam): Promise<Array<UserTeam>> {
    let result: Array<UserTeam> = new Array<UserTeam>();
    try {
      let config: AxiosRequestConfig = {
        headers: {
          // Authorization: this.user_context.token
        },
      };
      let url =
        this.environment.AUTH_SERVER_URL +
        this.environment.TEAM_SERVER_TEAMS_ENDPOINT;
      if (_userteam.id > 0) {
        url += `?id=${_userteam.id}`;
      }
      try {
        var resp = await axios.get<ActionRes<Array<UserTeam>>>(url, config);
        if (resp.data) {
          result = _.get(resp.data, "item", []);
        }
      } catch (error) {
        let e: any = _.get(error, "response.data");
        let err = new ErrorResponse<UserTeam>();
        err.success = e.success;
        err.code = e.code;
        err.message = e.message;
        err.item = null;
        throw err;
      }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getPocforSubscription(): Promise<Array<PointofcareWrapper>> {
    let result: Array<PointofcareWrapper> = new Array<PointofcareWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await client.query("BEGIN");
        const rows = await db.executeQuery(this.sql_getpocforsubscription, {
          member_id: this.user_context.user.id,
        });
        _.forEach(rows, (v, k) => {
          if (v != null) {
            var pointofcare = new PointofcareWrapper();
            pointofcare.id = v.id != 0 ? parseInt(v.id) : 0;
            pointofcare.ent_hierarchy_parent_id =
              v.ent_hierarchy_parent_id != 0
                ? parseInt(v.ent_hierarchy_parent_id)
                : 0;
            pointofcare.identifier =
              v != null && v.identifier != null && v.identifier.length != 0
                ? v.identifier
                : "";
            pointofcare.display_text =
              v != null && v.display_text != null && v.display_text.length != 0
                ? v.display_text
                : "";
            pointofcare.purpose =
              v != null && v.purpose != null && v.purpose.length != 0
                ? v.purpose
                : "";
            pointofcare.enterprise =
              v != null && v.enterprise != null && v.enterprise.length != 0
                ? v.enterprise
                : "";
            pointofcare.location =
              v != null && v.location != null && v.location.length != 0
                ? v.location
                : "";
            pointofcare.created_by =
              v.created_by != 0 ? parseInt(v.created_by) : 0;
            pointofcare.modified_by =
              v.modified_by != 0 ? parseInt(v.modified_by) : 0;
            pointofcare.created_on =
              v != null && v.created_on != null && v.created_on.length != 0
                ? v.created_on
                : new Date();
            pointofcare.modified_on =
              v != null && v.modified_on != null && v.modified_on.length != 0
                ? v.modified_on
                : new Date();
            pointofcare.is_active = v.is_active != 0 ? v.is_active : false;
            pointofcare.lang_code =
              v != null && v.lang_code != null && v.lang_code.length != 0
                ? v.lang_code
                : "";
            pointofcare.is_suspended =
              v.is_suspended != 0 ? v.is_suspended : false;
            pointofcare.parent_id =
              v.parent_id != 0 ? parseInt(v.parent_id) : 0;
            pointofcare.is_factory = v.is_factory != 0 ? v.is_factory : false;
            pointofcare.overlap_duration =
              v.overlap_duration != 0 ? parseInt(v.overlap_duration) : 0;
            pointofcare.overlap_duration_unit =
              v != null &&
              v.overlap_duration_unit != null &&
              v.overlap_duration_unit.length != 0
                ? v.overlap_duration_unit
                : "";
            pointofcare.overlap_duration_uom_id =
              v.overlap_duration_uom_id != 0
                ? parseInt(v.overlap_duration_uom_id)
                : 0;
            pointofcare.allow_subscriber =
              v.allow_subscriber != 0 ? v.allow_subscriber : false;
            pointofcare.notes =
              v != null && v.notes != null && v.notes.length != 0
                ? v.notes
                : "";
            pointofcare.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
            pointofcare.is_subscribed =
              v.is_subscribed != 0 ? v.is_subscribed : false;
            result.push(pointofcare);
          }
        });
        // await client.query("COMMIT");
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getMedicationForUserPoc(
    _req: PatientMedications,
    user_id: number
  ): Promise<Array<PatientMedications>> {
    let result: Array<PatientMedications> = new Array<PatientMedications>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await client.query("BEGIN");
        var query_string = this.sql_getlatestmedicationforuserpoc;
        if (_req.device_id) {
          query_string += ` and pm.device_id = ${_req.device_id}`;
        }
        const rows = await db.executeQuery(query_string, { user_id });
        _.forEach(rows, (v, k) => {
          if (v != null) {
            var patient_medication = new PatientMedications();
            patient_medication.id = v.id != null ? parseInt(v.id) : 0;
            patient_medication.patient_id =
              v.patient_id != null ? parseInt(v.patient_id) : 0;
            patient_medication.patient_visit_id =
              v.patient_visit_id != null ? parseInt(v.patient_visit_id) : 0;
            patient_medication.patient_order_id =
              v.patient_order_id != null ? parseInt(v.patient_order_id) : 0;
            patient_medication.device_id =
              v.device_id != null ? parseInt(v.device_id) : 0;
            patient_medication.device_info =
              v.device_info != null && v.device_info.length != 0
                ? v.device_info
                : "";
            patient_medication.drug_code =
              v.drug_code != null && v.drug_code.length != 0 ? v.drug_code : "";
            patient_medication.drug_displaytext =
              v.drug_displaytext != null && v.drug_displaytext.length != 0
                ? v.drug_displaytext
                : "";
            patient_medication.rate = v.rate != null ? parseInt(v.rate) : 0;
            patient_medication.dose = v.dose != null ? parseInt(v.dose) : 0;
            patient_medication.dose_limit =
              v.dose_limit != null ? parseInt(v.dose_limit) : 0;
            patient_medication.strength =
              v.strength != null ? parseInt(v.strength) : 0;
            patient_medication.volume_tbi =
              v.volume_tbi != null ? parseInt(v.volume_tbi) : 0;
            patient_medication.lockout =
              v.lockout != null ? parseInt(v.lockout) : 0;
            patient_medication.time_expected =
              v.time_expected != null ? parseInt(v.time_expected) : 0;
            patient_medication.rate_unit_code =
              v.rate_unit_code != null && v.rate_unit_code.length != 0
                ? v.rate_unit_code
                : "";
            patient_medication.rate_unit_displaytext =
              v.rate_unit_displaytext != null &&
              v.rate_unit_displaytext.length != 0
                ? v.rate_unit_displaytext
                : "";
            patient_medication.rate_unit_system =
              v.rate_unit_system != null && v.rate_unit_system.length != 0
                ? v.rate_unit_system
                : "";
            patient_medication.dose_unit_code =
              v.dose_unit_code != null && v.dose_unit_code.length != 0
                ? v.dose_unit_code
                : "";
            patient_medication.dose_unit_displaytext =
              v.dose_unit_displaytext != null &&
              v.dose_unit_displaytext.length != 0
                ? v.dose_unit_displaytext
                : "";
            patient_medication.dose_unit_system =
              v.dose_unit_system != null && v.dose_unit_system.length != 0
                ? v.dose_unit_system
                : "";
            patient_medication.volume_unit_code =
              v.volume_unit_code != null && v.volume_unit_code.length != 0
                ? v.volume_unit_code
                : "";
            patient_medication.volume_unit_displaytext =
              v.volume_unit_displaytext != null &&
              v.volume_unit_displaytext.length != 0
                ? v.volume_unit_displaytext
                : "";
            patient_medication.volume_unit_system =
              v.volume_unit_system != null && v.volume_unit_system.length != 0
                ? v.volume_unit_system
                : "";
            patient_medication.strength_unit_code =
              v.strength_unit_code != null && v.strength_unit_code.length != 0
                ? v.strength_unit_code
                : "";
            patient_medication.strength_unit_displaytext =
              v.strength_unit_displaytext != null &&
              v.strength_unit_displaytext.length != 0
                ? v.strength_unit_displaytext
                : "";
            patient_medication.strength_unit_system =
              v.strength_unit_system != null &&
              v.strength_unit_system.length != 0
                ? v.strength_unit_system
                : "";
            patient_medication.time_unit_code =
              v.time_unit_code != null && v.time_unit_code.length != 0
                ? v.time_unit_code
                : "";
            patient_medication.time_unit_displaytext =
              v.time_unit_displaytext != null &&
              v.time_unit_displaytext.length != 0
                ? v.time_unit_displaytext
                : "";
            patient_medication.time_unit_system =
              v.time_unit_system != null && v.time_unit_system.length != 0
                ? v.time_unit_system
                : "";
            patient_medication.enterprise_id =
              v.enterprise_id != null ? parseInt(v.enterprise_id) : 0;
            patient_medication.ent_location_id =
              v.ent_location_id != null ? parseInt(v.ent_location_id) : 0;
            patient_medication.row_key =
              v.row_key != null && v.row_key.length != 0 ? v.row_key : "";
            patient_medication.created_by =
              v.created_by != null ? parseInt(v.created_by) : 0;
            patient_medication.modified_by =
              v.modified_by != null ? parseInt(v.modified_by) : 0;
            patient_medication.created_on =
              v.created_on != null && v.created_on.length != 0
                ? v.created_on
                : new Date();
            patient_medication.modified_on =
              v.modified_on != null && v.modified_on.length != 0
                ? v.modified_on
                : new Date();
            patient_medication.is_active =
              v.is_active != null ? v.is_active : false;
            patient_medication.is_suspended =
              v.is_suspended != null ? v.is_suspended : false;
            patient_medication.parent_id =
              v.parent_id != null ? parseInt(v.parent_id) : 0;
            patient_medication.is_factory =
              v.is_factory != null ? v.is_factory : false;
            patient_medication.notes =
              v.notes != null && v.notes.length != 0 ? v.notes : "";
            patient_medication.attributes =
              v.attributes != null && v.attributes.length != 0
                ? v.attributes
                : "";
            result.push(patient_medication);
          }
        });
        // await client.query("COMMIT");
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async getDeviceMedicationForUserPOC(_req: PatientMedications) {
    let result: Array<PatientMedicationsWrapper> =
      new Array<PatientMedicationsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var query: string = this.sql_getdevicemedicationforuserpoc;
        var condition_array: Array<string> = [];
        if (_req.device_id > 0) {
          condition_array.push(`po.device_id = ${_req.device_id}`);
        }
        if (condition_array.length > 0) {
          query = query.replace(
            /@condition/g,
            `and ${condition_array.join(" and ")}`
          );
        } else {
          query = query.replace(/@condition/g, "");
        }
        const rows = await db.executeQuery(query, {
          user_id: this.user_context.user.id,
        });
        _.forEach(rows, (v, k) => {
          if (v != null) {
            var patient_medication_temp = new PatientMedicationsWrapper();
            patient_medication_temp.id = v.id != null ? parseInt(v.id) : 0;
            patient_medication_temp.drug_displaytext =
              v.drug_displaytext != null && v.drug_displaytext.length != 0
                ? v.drug_displaytext
                : "";
            patient_medication_temp.volume_tbi =
              v.volume_tbi != null ? parseInt(v.volume_tbi) : 0;
            patient_medication_temp.volume_unit_displaytext =
              v.volume_unit_displaytext != null &&
              v.volume_unit_displaytext.length != 0
                ? v.volume_unit_displaytext
                : "";
            patient_medication_temp.rate =
              v.rate != null ? parseInt(v.rate) : 0;
            patient_medication_temp.rate_unit_displaytext =
              v.rate_unit_displaytext != null &&
              v.rate_unit_displaytext.length != 0
                ? v.rate_unit_displaytext
                : "";

            patient_medication_temp.time_expected =
              v.time_expected != null ? parseInt(v.time_expected) : 0;
            patient_medication_temp.time_unit_displaytext =
              v.time_unit_displaytext != null &&
              v.time_unit_displaytext.length != 0
                ? v.time_unit_displaytext
                : "";

            patient_medication_temp.patient_order_id =
              v.patient_order_id != null ? parseInt(v.patient_order_id) : 0;
            patient_medication_temp.has_alarm =
              v.has_alarm != null ? v.has_alarm : false;
            result.push(patient_medication_temp);
          }
        });
      });
    } catch (e) {
      var error = e;
      throw error;
    }
    return result;
  }
  async getMedicationWithPatientAndDeviceDetails(
    _req: PatientMedicationsWrapper
  ) {
    let result: PatientMedicationsWrapper = new PatientMedicationsWrapper();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_getmedicationwithpatientanddevicedetails,
          {
            patient_order_id: _req.patient_order_id,
          }
        );
        if (_.has(rows, "0")) {
          var v = rows[0];
          var patientmed = new PatientMedicationsWrapper();
          patientmed.device_id =
            v.device_id != null && v.device_id != 0 ? parseInt(v.device_id) : 0;

          patientmed.drug_displaytext =
            v != null &&
            v.drug_displaytext != null &&
            v.drug_displaytext.length != 0
              ? v.drug_displaytext
              : "";

          patientmed.volume_tbi =
            v != null && v.volume_tbi != null && v.volume_tbi.length != 0
              ? v.volume_tbi
              : "";
          patientmed.volume_unit_displaytext =
            v != null &&
            v.volume_unit_displaytext != null &&
            v.volume_unit_displaytext.length != 0
              ? v.volume_unit_displaytext
              : "";

          patientmed.strength =
            v != null && v.strength != null && v.strength.length != 0
              ? v.strength
              : "";
          patientmed.strength_unit_displaytext =
            v != null &&
            v.strength_unit_displaytext != null &&
            v.strength_unit_displaytext.length != 0
              ? v.strength_unit_displaytext
              : "";

          patientmed.rate =
            v != null && v.rate != null && v.rate.length != 0 ? v.rate : "";
          patientmed.rate_unit_displaytext =
            v != null &&
            v.rate_unit_displaytext != null &&
            v.rate_unit_displaytext.length != 0
              ? v.rate_unit_displaytext
              : "";

          patientmed.time_expected =
            v != null && v.time_expected != null && v.time_expected.length != 0
              ? v.time_expected
              : "";
          patientmed.time_unit_displaytext =
            v != null &&
            v.time_unit_displaytext != null &&
            v.time_unit_displaytext.length != 0
              ? v.time_unit_displaytext
              : "";

          patientmed.devices = new Devices();
          patientmed.devices.id =
            v.device_id != null && v.device_id != 0 ? parseInt(v.device_id) : 0;
          patientmed.devices.display_text =
            v != null && v.d_device_name != null && v.d_device_name.length != 0
              ? v.d_device_name
              : "";
          patientmed.devices.category =
            v != null && v.d_device_type != null && v.d_device_type.length != 0
              ? v.d_device_type
              : "";
          patientmed.devices.identifier =
            v != null && v.d_identifier != null && v.d_identifier.length != 0
              ? v.d_identifier
              : "";

          patientmed.devices.manufacturer =
            v != null &&
            v.d_manufacturer != null &&
            v.d_manufacturer.length != 0
              ? v.d_manufacturer
              : "";
          patientmed.devices.model =
            v != null && v.d_model != null && v.d_model.length != 0
              ? v.d_model
              : "";

          patientmed.devices.type =
            v != null && v.d_type != null && v.d_type.length != 0
              ? v.d_type
              : "";
          patientmed.devices.sub_type =
            v != null && v.d_sub_type != null && v.d_sub_type.length != 0
              ? v.d_sub_type
              : "";
          // patient.devices.device_serial_id =  _.defaultTo(v.device_serial_id,"");

          patientmed.patient = new PatientsWrapper();
          patientmed.patient.id = v.p_id != 0 ? parseInt(v.p_id) : 0;
          patientmed.patient.last_name =
            v != null && v.p_family_name != null && v.p_family_name.length != 0
              ? v.p_family_name
              : "";
          patientmed.patient.first_name =
            v != null && v.p_given_name != null && v.p_given_name.length != 0
              ? v.p_given_name
              : "";
          patientmed.patient.dob =
            v != null &&
            v.p_date_of_birth != null &&
            v.p_date_of_birth.length != 0
              ? v.p_date_of_birth
              : "";

          patientmed.patientvisit = new PatientVisitsWrapper();
          patientmed.patientvisit.id = v.pv_id != 0 ? parseInt(v.pv_id) : 0;
          patientmed.patientvisit.room =
            v != null && v.pv_room != null && v.pv_room.length != 0
              ? v.pv_room
              : "";
          patientmed.patientvisit.bed =
            v != null && v.pv_bed != null && v.pv_bed.length != 0
              ? v.pv_bed
              : "";
          patientmed.patientvisit.floor =
            v != null && v.pv_floor != null && v.pv_floor.length != 0
              ? v.pv_floor
              : "";
          patientmed.patientvisit.point_of_care =
            v != null &&
            v.pv_point_of_care != null &&
            v.pv_point_of_care.length != 0
              ? v.pv_point_of_care
              : "";
          patientmed.patientvisit.patient_adm_class =
            v != null &&
            v.pv_patient_class != null &&
            v.pv_patient_class.length != 0
              ? v.pv_patient_class
              : "";
          patientmed.patientvisit.patient_adm_class =
            v != null &&
            v.pv_patient_adm_class != null &&
            v.pv_patient_adm_class.length != 0
              ? v.pv_patient_adm_class
              : "";
          result = patientmed;
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getAlarmObservationWithPatientVisitAndDevice(
    _req: AlarmObservationsWrapper
  ) {
    let result: Array<AlarmObservationsWrapper> =
      new Array<AlarmObservationsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(
          this.sql_getalarmobservationwithpatientvisitanddevice,
          {
            patient_visit_id: _req.patient_visit_id,
            device_id: _req.device_id,
          }
        );
        if (_.has(rows, "0")) {
          _.forEach(rows, (v) => {
            var alarm_observartion = new AlarmObservationsWrapper();
            alarm_observartion.user_acted = new Users();
            alarm_observartion.user_acted.id =
              v.who_acted != 0 ? parseInt(v.who_acted) : 0;
            alarm_observartion.user_acted.first_name =
              v != null && v.u_f_name != null && v.u_f_name.length != 0
                ? v.u_f_name
                : "";
            alarm_observartion.user_acted.middle_name =
              v != null && v.u_m_name != null && v.u_m_name.length != 0
                ? v.u_m_name
                : "";
            alarm_observartion.user_acted.last_name =
              v != null && v.u_l_name != null && v.u_l_name.length != 0
                ? v.u_l_name
                : "";
            result.push(alarm_observartion);
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async alarmAction(_req: AlarmActorsWrapper) {
    let result: AlarmActorsWrapper = new AlarmActorsWrapper();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await db.beginTransaction();
        try {
          _req.user_id = this.user_context.user.id;
          _req.action_on = new Date();
          var alarm_actor_service = new AlarmActorsService();
          result = await alarm_actor_service.updateTransaction(db, _req);

          switch (_req.action_response) {
            case AlarmActorsWrapper.ACTION_RESPONSE.Accept:
              var alarm_observation = new AlarmObservationsWrapper();
              alarm_observation.id = _req.alarm_id;

              alarm_observation.alarm_status =
                AlarmObservationsWrapper.ALARM_STATUS.accepted;
              alarm_observation.who_acted = _req.user_id;
              alarm_observation.when_acted = new Date();
              await this.updateAlarmObservationTransaction(
                db,
                alarm_observation
              );
              break;
            case AlarmActorsWrapper.ACTION_RESPONSE.Excalate:
              var alarm_observation = new AlarmObservationsWrapper();
              alarm_observation.id = _req.alarm_id;

              alarm_observation.alarm_status =
                AlarmObservationsWrapper.ALARM_STATUS.escalated;
              alarm_observation.who_acted = _req.user_id;
              alarm_observation.when_acted = new Date();
              await this.updateAlarmObservationTransaction(
                db,
                alarm_observation
              );
              await this.handleEscalation(db, result);
              break;

            default:
              break;
          }
          if (_req.scheduler_id && _req.scheduler_id > 0) {
            var scheduler_service = new SchedulerService();
            await scheduler_service.inactiveSchedulerTransaction(
              db,
              _req.scheduler_id
            );
          }
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async handleEscalation(db: DB, alarm_actor: AlarmActorsWrapper) {
    try {
      /* mark previous alarm actors as inactive */
      var alarmactor_service = new AlarmActorsService();
      var _req_alarmactor = new AlarmActors();
      _req_alarmactor.alarm_id = alarm_actor.alarm_id;
      await alarmactor_service.markAsReadonlyTransaction(db, _req_alarmactor);
      /* get alarm observation by id */

      var alarmobservation_service = new AlarmObservationsService();
      var _req = new AlarmObservationsWrapper();
      _req.id = alarm_actor.alarm_id;
      var alarm_observations =
        await alarmobservation_service.getAlarmObservationsByIDTransaction(
          db,
          _req
        );
      if (alarm_observations.length == 0) {
        var e = new ErrorResponse();
        e.message = "Alarm ID not found";
        throw e;
      }
      var alarm: AlarmObservations = alarm_observations[0];

      // var alarm: AlarmObservationsWrapper = await this.getAlarmObservation(
      //   _req
      // );

      /* get patient visit with patient_visit_id */
      var patientvisit_service = new PatientVisitsService();
      var req = new PatientVisitsWrapper();
      req.id = alarm.patient_visit_id;
      var patientvisit_list = await patientvisit_service.selectTransaction(
        db,
        req
      );

      if (patientvisit_list.length == 0) {
        var e = new ErrorResponse();
        e.message = "Patient visit not found";
      }

      /* get pointofcare with poc_name(nursing_unit) from patientvisit  */
      var pointofcare_service = new PointofcareService();

      var poc = new PointofcareWrapper();
      poc.identifier = patientvisit_list[0].point_of_care;
      var point_of_care_list = await pointofcare_service.getpoinofCare(poc);

      if (point_of_care_list.length == 0) {
        var e = new ErrorResponse();
        e.message = "Pointofcare not found";
      }

      // /* get next team for escalation */
      var escalation_list: Array<PointofcareEscalation> = _.get(
        point_of_care_list,
        "0.escalation_attribute",
        []
      );
      var previous_subscriber_type =
        alarm_actor.user_team_id == 0 ? "USER" : "TEAM";
      var previous_subscriber_index = _.findIndex(escalation_list, (v) => {
        if (previous_subscriber_type == "USER") {
          return v.id == alarm_actor.user_id;
        } else {
          return v.id == alarm_actor.user_team_id;
        }
      });
      if (previous_subscriber_index == -1) {
        var e = new ErrorResponse();
        e.message = "invalid subscriber";
      }

      var alarm_service = new AlarmService();
      await alarm_service.sendNotificationTransaction(
        db,
        alarm,
        previous_subscriber_index + 1
      );
    } catch (e) {
      throw e;
    }
  }

  async updateAlarmObservation(
    _req: AlarmObservationsWrapper
  ): Promise<AlarmObservationsWrapper> {
    let result: AlarmObservationsWrapper = new AlarmObservationsWrapper();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        this.updateAlarmObservationTransaction(db, _req);
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async updateAlarmObservationTransaction(
    db: DB,
    _req: AlarmObservationsWrapper
  ): Promise<AlarmObservationsWrapper> {
    let result: AlarmObservationsWrapper = new AlarmObservationsWrapper();
    try {
      const rows = await db.executeQuery(this.sql_update_alarmobeservation, {
        id: _req.id,
        alarm_status: _req.alarm_status,
        who_acted: _req.who_acted,
        when_acted: _req.when_acted,
      });
      if (rows.length > 0) {
        result = new AlarmObservationsWrapper();
        result.id = _.get(rows[0], "id", 0);
      }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async getPatientsAndLatestVisit(
    _patient_visit_id: number,
    user_id: number
  ): Promise<Array<PatientVisitsWrapper>> {
    let result: Array<PatientVisitsWrapper> = new Array<PatientVisitsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        // const client = await pool.connect();
        await db.connect();
        var query_string = "";
        query_string = this.sql_get_patients_and_latest_visit;
        if (_patient_visit_id > 0)
          query_string += `and pv.id = ${_patient_visit_id}`;
        const rows = await db.executeQuery(query_string, []);
        if (rows.length > 0) {
          _.forEach(rows, (v, k) => {
            var _pateintvisits = new PatientVisitsWrapper();
            _pateintvisits.id = v.id != 0 ? parseInt(v.id) : 0;
            _pateintvisits.patient_id =
              v.patient_id != 0 ? parseInt(v.patient_id) : 0;
            _pateintvisits.patient_info =
              v != null && v.patient_info != null && v.patient_info.length != 0
                ? v.patient_info
                : "";
            _pateintvisits.visited_on =
              v != null && v.visited_on != null && v.visited_on.length != 0
                ? v.visited_on
                : new Date();
            _pateintvisits.room =
              v != null && v.room != null && v.room.length != 0 ? v.room : "";
            _pateintvisits.bed =
              v != null && v.bed != null && v.bed.length != 0 ? v.bed : "";
            _pateintvisits.building =
              v != null && v.building != null && v.building.length != 0
                ? v.building
                : "";
            _pateintvisits.floor =
              v != null && v.floor != null && v.floor.length != 0
                ? v.floor
                : "";
            _pateintvisits.facility =
              v != null && v.facility != null && v.facility.length != 0
                ? v.facility
                : "";
            _pateintvisits.patient_adm_class =
              v != null &&
              v.patient_adm_class != null &&
              v.patient_adm_class.length != 0
                ? v.patient_adm_class
                : "";
            _pateintvisits.point_of_care =
              v != null &&
              v.point_of_care != null &&
              v.point_of_care.length != 0
                ? v.point_of_care
                : "";
            _pateintvisits.has_alarm =
              v != null && v.has_alarm != null && v.has_alarm == 1
                ? true
                : false;

            result.push(_pateintvisits);
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  // incomplete
  async getPatientsAndLatestVisitForUserPOC(
    _req: PatientVisitsWrapper
  ): Promise<Array<PatientVisitsWrapper>> {
    let result: Array<PatientVisitsWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        const client = await db.connect();
        var query_string = "";
        query_string = this.sql_get_patients_and_latest_visit_for_userpoc;
        var condition_array: Array<string> = [];
        // if (_req.id > 0) {
        //   condition_array.push(`pv.id = ${_req.id}`);
        // }
        if (
          _req.patient &&
          _req.patient.identifier &&
          _req.patient.identifier.length > 0
        ) {
          condition_array.push(
            `Patients.identifier = '${_req.patient.identifier}'`
          );
        }
        // condition_array.push(
        //   `PatientVisits.is_active = 1`
        // );
        // condition_array.push(
        //   `FavouritePatients.id is null`
        // );
        // if (_req.is_user_favourite == false) {
        //   condition_array.push(
        //     `pv.id not in (select patient_visit_id from favouritepatient where user_id = $1 )`
        //   );
        // } else {
        //   condition_array.push(
        //     `pv.id in (select patient_visit_id from favouritepatient where user_id = $1 )`
        //   );
        // }
        if (condition_array.length > 0) {
          if (condition_array.length == 1)
            query_string += `${
              condition_array.length == 1 ? " and " : ""
            }${condition_array.join(" and ")}`;
        }
        const rows = await db.executeQuery(query_string, {
          user_id: this.user_context.user.id,
        });
        if (rows.length > 0) {
          _.forEach(rows, (v, k) => {
            if (v != null) {
              var patient_visit: PatientVisitsWrapper =
                new PatientVisitsWrapper();
              patient_visit.id = v != null && v.id ? parseInt(v.id) : 0;
              patient_visit.patient_info =
                v.patient_info != null && v.patient_info.length != 0
                  ? v.patient_info
                  : "";

              patient_visit.point_of_care =
                v.point_of_care != null && v.point_of_care.length != 0
                  ? v.point_of_care
                  : "";
              patient_visit.room =
                v.room != null && v.room.length != 0 ? v.room : "";
              patient_visit.floor =
                v.floor != null && v.floor.length != 0 ? v.floor : "";
              patient_visit.patient_adm_class =
                v.patient_adm_class != null && v.patient_adm_class.length != 0
                  ? v.patient_adm_class
                  : "";

              result.push(patient_visit);
            }
          });
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  async getLatestMedicationDeviceWise(
    _device_id: number,
    _patient_id: number,
    _patient_order_id: number
  ): Promise<Array<PatientMedicationsWrapper>> {
    let result: Array<PatientMedicationsWrapper> =
      new Array<PatientMedicationsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        const client = await db.connect();
        var qb = new this.utils.QueryBuilder(
          this.sql_get_latest_medication_device_wise
        );
        if (_device_id > 0) {
          qb.addParameter("pm.device_id", _device_id, "=");
        }
        if (_patient_id > 0) {
          qb.addParameter("pm.patient_id", _patient_id, "=");
        }
        if (_patient_order_id > 0) {
          qb.addParameter("pm.patient_order_id", _patient_order_id, "=");
        }
        qb.sort_field = "pm.id";
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
              v.rate != 0 ? parseInt(v.rate) : 0;
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
    } catch (transaction_error) {
      // throw transaction_error;
      var e = new ErrorResponse<PatientMedicationsWrapper>();
      e.success = false;
      e.code = _.get(transaction_error, "code", "");
      e.error = _.get(transaction_error, "details", "");
      e.message = _.get(transaction_error, "message", "");
      e.item = null;
      e.exception = _.get(transaction_error, "stack", "");
    }
    return result;
  }

  async getMedicationsPatientWise(
    patient_visit_id: number
  ): Promise<Array<PatientMedicationsWrapper>> {
    let result: Array<PatientMedicationsWrapper> =
      new Array<PatientMedicationsWrapper>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        const client = await db.connect();
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
          patient_visit_id: patient_visit_id,
        });
        if (rows.length > 0) {
          _.forEach(rows, (v: any, k: any) => {
            if (v != null) {
              var patient_medication = new PatientMedicationsWrapper();
              patient_medication.id = v.id != null ? parseInt(v.id) : 0;
              patient_medication.created_on =
                v.created_on != null ? v.created_on : new Date();
              patient_medication.message_time =
                v.ordered_on != null ? v.ordered_on : new Date();
              patient_medication.has_alarm =
                v.has_alarm != null ? v.has_alarm : false;
              patient_medication.drug_displaytext =
                v.drug_displaytext != null && v.drug_displaytext.length != 0
                  ? v.drug_displaytext
                  : "";

              patient_medication.devices = new DevicesWrapper();
              patient_medication.devices.id =
                v.device_id != null ? parseInt(v.device_id) : 0;
              patient_medication.devices.display_text =
                v.display_text != null && v.display_text.length != 0
                  ? v.display_text
                  : "";
              patient_medication.devices.identifier =
                v.identifier != null && v.identifier.length != 0
                  ? v.identifier
                  : "";
              patient_medication.devices.category =
                v.category != null && v.category.length != 0 ? v.category : "";
              patient_medication.patient_order_id =
                v.patient_order_id != null ? parseInt(v.patient_order_id) : 0;
              patient_medication.devices.manufacturer =
                v != null &&
                v.d_manufacturer != null &&
                v.d_manufacturer.length != 0
                  ? v.d_manufacturer
                  : "";
              patient_medication.devices.model =
                v != null && v.d_model != null && v.d_model.length != 0
                  ? v.d_model
                  : "";

              patient_medication.devices.type =
                v != null && v.d_type != null && v.d_type.length != 0
                  ? v.d_type
                  : "";
              patient_medication.devices.sub_type =
                v != null && v.d_sub_type != null && v.d_sub_type.length != 0
                  ? v.d_sub_type
                  : "";

              result.push(patient_medication);
            }
          });
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      var e = new ErrorResponse<PatientMedicationsWrapper>();
      e.success = false;
      e.code = _.get(transaction_error, "code", "");
      e.error = _.get(transaction_error, "detail", "");
      e.message = _.get(transaction_error, "message", "");
      e.item = null;
      e.exception = _.get(transaction_error, "stack", "");
    }
    return result;
  }

  // async getGraphDataForOrder(
  //   _patient_order_id: number
  // ): Promise<Array<GraphData>> {
  //   let result: Array<GraphData> = new Array<GraphData>();
  //   var _start_on: Date, _volume_delivered: any, _time_elapsed: any;
  //   var _min: Date, _max: Date, _total_minutes, _label_minute;
  //   try {
  //     await using(this.db.getDisposablePool(), async pool => {
  //       const client = await pool.connect();
  //       const { rows } = await client.query(this.sql_get_graph_data_for_order, [
  //         _patient_order_id
  //       ]);
  //       _.forEach(rows, (v, k) => {
  //         /* split by seperator and parse to float */
  //         var volume_delivered_arr: Array<string | number> = _.split(
  //           v.volume_delivered,
  //           ","
  //         );
  //         volume_delivered_arr = _.map(
  //           volume_delivered_arr,
  //           (v: string | number) => {
  //             return parseFloat(_.trim(v as string));
  //           }
  //         );
  //         var time_elapsed_arr: Array<string | number> = _.split(
  //           v.time_elapsed,
  //           ","
  //         );
  //         time_elapsed_arr = _.map(time_elapsed_arr, (v: string | number) => {
  //           return parseFloat(_.trim(v as string));
  //         });

  //         /* create graph data */
  //         var graph_data: Array<GraphData> = new Array<GraphData>();
  //         for (
  //           var i = 0, length = volume_delivered_arr.length;
  //           i < length;
  //           i++
  //         ) {
  //           var data: GraphData = new GraphData();
  //           data.volume_delivered = volume_delivered_arr[i];
  //           data.time_elapsed = time_elapsed_arr[i];
  //           graph_data.push(data);
  //         }

  //         /* delete element having 0 as value and add time elapsed to next value*/
  //         var filtered_graph_data: Array<GraphData> = [];
  //         var ignored_time: number = 0;
  //         _.forEach(graph_data, (v: GraphData) => {
  //           if (
  //             (v.volume_delivered as number) != 0 &&
  //             (v.time_elapsed as number) != 0
  //           ) {
  //             (v.time_elapsed as number) += ignored_time;
  //             ignored_time = 0;
  //             filtered_graph_data.push(v);
  //           } else {
  //             ignored_time += v.time_elapsed as number;
  //           }
  //         });
  //         graph_data = filtered_graph_data;

  //         /* convert to moment comparing with start on time */
  //         var start_on_moment = moment(v.start_on, "YYYY-MM-DD HH:mm:ss");
  //         graph_data = _.map(graph_data, (v: GraphData) => {
  //           var time_elapsed = parseFloat(_.trim(v.time_elapsed as string));
  //           start_on_moment.add(time_elapsed, "minutes");
  //           v.time_elapsed = moment(start_on_moment);
  //           return v;
  //         }) as Array<GraphData>;

  //         /* filter by condition value should be between start_on and end_on date */
  //         start_on_moment = moment(v.start_on, "YYYY-MM-DD HH:mm:ss");
  //         var end_on_moment = moment(v.end_on, "YYYY-MM-DD HH:mm:ss");
  //         graph_data = _.filter(graph_data, (v: GraphData) => {
  //           return (
  //             (v.time_elapsed as Moment).isSameOrAfter(start_on_moment) &&
  //             (v.time_elapsed as Moment).isSameOrBefore(end_on_moment)
  //           );
  //         }) as Array<GraphData>;

  //         /* format to required format */
  //         graph_data = _.map(graph_data, v => {
  //           v.time_elapsed = (v.time_elapsed as Moment).format("hh:mm a");
  //           return v;
  //         }) as Array<GraphData>;

  //         result = graph_data;
  //       });
  //     });
  //   } catch (transaction_error) {
  //     throw transaction_error;
  //     // throw new ErrorResponse<DeviceObservationGraphModel>({
  //     // 	success: false,
  //     // 	code: transaction_error.code,
  //     // 	error: transaction_error.detail,
  //     // 	message: transaction_error.message,
  //     // 	item: null,
  //     // 	exception: transaction_error.stack,
  //     // });
  //   }
  //   return result;
  // }
  async getAlarmObservation(
    _req: AlarmObservationsWrapper
  ): Promise<AlarmObservationsWrapper> {
    let result: AlarmObservationsWrapper = new AlarmObservationsWrapper();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_get_alarm_by_id, {
          id: _req.id,
        });
        if (rows.length > 0) {
          result = new AlarmObservationsWrapper();
          result.id = _.get(rows[0], "id", 0);
        } else {
          var e = new ErrorResponse<AlarmObservationsWrapper>();
          e.message = "Alarm not found";
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
}
