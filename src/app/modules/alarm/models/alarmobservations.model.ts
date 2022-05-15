import { Base } from "../../global/models/base.model";
import { Users } from "./users.model";
export class AlarmObservations extends Base {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  patient_visit_id: number = 0;
  patient_order_id: number = 0;
  patient_medication_id: number = 0;
  device_id: number = 0;
  observations: any = [];
  observed_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  device_displaytext: string = "";
  power_status: string = "";
  maintenance_status: string = "";
  alarm_type: string = "";
  alarm_type_desc: string = "";
  event_phase: string = "";
  alarm_status: string = "";
  alert_type: string = "";
  alarm_user_status: string = "";
  alarm_user_status_changed_by: number = 0;
  alarm_user_status_changed_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  alarm_user_status_reason: string = "";
  who_acted: number = 0;
  when_acted: Date = new Date(9999, 11, 31, 23, 59, 59);
  act_status: string = "";
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  row_key: string = "";
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = false;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";

  point_of_care: string = "";
  room: string = "";
  bed: string = "";
}
export class AlarmObservationsWrapper extends AlarmObservations {
  user_acted: Users = new Users();
}

export class AlarmActorObservationsRES extends Base {
  id: number = 0;
  user_id: number = 0;
  team_id: number = 0;
  poc_id: number = 0;
  readonlyuser : boolean = false
  poc_name:string = "";
  poc_identifier:string = "";
  device_displaytext:string = "";
  room:string = "";
  bed:string = "";
  alarm_type: string = "";
}

export namespace AlarmObservations {
  export enum ALARM_STATUS {
    active = "active",
    accepted = "accepted",
    escalated = "escalated"
  }
}
