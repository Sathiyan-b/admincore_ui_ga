import { Base } from "../../global/models/base.model";
import { Patients } from "./patients.model";
import { PatientMedications } from "./patientmedications.model";
import { PatientVisits } from "./patientvisits.model";
import { AlarmObservations } from "./alarmobservations.model";
import { AlarmActors } from "./alarmactors.model";
export class Devices extends Base {
  id: number = 0;
  identifier: string = "";
  display_text: string = "";
  manufacturer: string = "";
  model: string = "";
  category_id: number = 0;
  sub_category_id: number = 0;
  type: string = "";
  sub_type: string = "";
  category: string = "";
  sub_category: string = "";
  barcode: string = "";
  class_id: number = 0;
  subclass_id: number = 0;
  auto_program_enabled: boolean = false;
  auto_doc_enabled: boolean = false;
  is_wearable: boolean = false;
  is_disposable: boolean = false;
  suspended_reason_id: number = 0;
  inactive_reason_id: number = 0;
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  hw_version: string = "";
  sw_version: string = "";
  last_result_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  last_alarm_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  attributes: any = [];
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = false;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
  device_uid:string = "";
  error:string |undefined= ""
}

export class DevicesWrapper extends Devices {
  latest_patient_medication: PatientMedications | null = null;
	patient: Patients | null = null;
	patient_visit: PatientVisits | null = null;
	alarm_observartion: AlarmObservations | null = null;
	alarm_actor: AlarmActors | null = null;
  has_alarm : boolean = false;
  patient_info: string = "";
  associated_from : Date = new Date(9999, 11, 31, 23, 59, 59);
}

