import { Base } from "../../global/models/base.model";
import { Devices } from "./devices.model";
import { Patients } from "./patients.model";
import { PatientVisitsWrapper } from "./patientvisits.model";
export class PatientMedications extends Base {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  patient_visit_id: number = 0;
  patient_order_id: number = 0;
  device_id: number = 0;
  device_info: string = "";
  drug_code: string = "";
  drug_displaytext: string = "";
  rate: number = 0;
  dose: number = 0;
  dose_limit: number = 0;
  strength: number = 0;
  volume_tbi: number = 0;
  lockout: number = 0;
  time_expected: number = 0;
  rate_unit_code: string = "";
  rate_unit_displaytext: string = "";
  rate_unit_system: string = "";
  dose_unit_code: string = "";
  dose_unit_displaytext: string = "";
  dose_unit_system: string = "";
  volume_unit_code: string = "";
  volume_unit_displaytext: string = "";
  volume_unit_system: string = "";
  strength_unit_code: string = "";
  strength_unit_displaytext: string = "";
  strength_unit_system: string = "";
  time_unit_code: string = "";
  time_unit_displaytext: string = "";
  time_unit_system: string = "";
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  row_key: string = "";
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = false;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
  attributes: string = "";
  prescription_number:string = ""
}
export class PatientMedicationsWrapper extends PatientMedications {
  devices: Devices = new Devices();
  patient: Patients = new Patients();
  patientvisit: PatientVisitsWrapper = new PatientVisitsWrapper();
  has_alarm: boolean = false;
  message_time: Date = new Date();
}

export class PatientMedicationsCriteria extends PatientMedications {
  order_code: string = "";
  order_status: string = "";
  visit_number: string = "";
  patient_identifier: string = "";
}



