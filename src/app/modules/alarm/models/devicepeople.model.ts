import { Base } from "../../global/models/base.model";
export class DevicePeople extends Base {
  id: number = 0;
  device_id: number = 0;
  patient_id: number = 0;
  patient_order_id: number = 0;
  patient_visit_id: number = 0;
  user_id: number = 0;
  request_status_id: number = 0;
  valid_from: Date = new Date(9999, 11, 31, 23, 59, 59);
  valid_to: Date = new Date(9999, 11, 31, 23, 59, 59);
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = false;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}
export class DevicePeopleWrapper extends DevicePeople {
  request_status_identifier: string = "";
}

export namespace DevicePeople {
  export enum ACTION_RESPONSE {
    ASSOC_REQ = "ASSOC_REQ",
    ASSOCIATED = "ASSOCIATED",
    DISSOC_REQ = "DISSOC_REQ",
    DISSOCIATED = "DISSOCIATED",
  }
}
