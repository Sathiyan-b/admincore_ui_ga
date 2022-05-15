import { Base } from "../../global/models/base.model";
export class PatientOrders extends Base {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  patient_visit_id: number = 0;
  device_id: number = 0;
  patient_medication_id: number = 0;
  ordered_on: Date = new Date();
  order_status: string = "";
  order_code: string = "";
  order_type: string = "";
  order_by_code: string = "";
  order_by_family_name: string = "";
  order_by_given_name: string = "";
  action_by_code: string = "";
  action_by_family_name: string = "";
  action_by_given_name: string = "";
  assigning_authority: string = "";
  order_universal_code: string = "";
  order_universal_displaytext: string = "";
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
}

export namespace PatientOrders {
  export enum ORDER_STATUS {
    SOME_RESULTS = "A",
    CANCELED = "CA",
    COMPLETED = "CM",
    DISCONTINUED = "DC",
    ERROR = "ER",
    HOLD = "HD",
    INPROGRESS_UNSPECIFIED = "IP",
    REPLACED = "RP",
    INPROGRESS_SCHEDULED = "SC"
  }
}
export class PatientOrdersWrapper extends PatientOrders {
  device_serial_id: string = "";
  device_identifier: string = "";
  patient_identifier: string = "";
  Barcode: string = "";
}

export class PatientorderForAlarmsWithoutOrder extends Base {
  patient_order_id: number = 0;
  patient_medication_id: number = 0;
}
