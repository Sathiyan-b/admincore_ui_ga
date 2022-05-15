import * as _ from "lodash";
import { Base } from "../../global/models/base.model";

export class Pointofcare extends Base {
  id: number = 0;
  ent_hierarchy_parent_id: number = 0;
  identifier: string = "";
  display_text: string = "";
  purpose: string = "";
  enterprise: any = [];
  location: any = [];
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean | null = true;
  version: number = 1;
  lang_code: string = "en-GB";
  is_suspended: boolean | null = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  users_attribute: Array<PointofcareUserModel> = [];
  escalation_attribute: Array<PointofcareEscalation> = [];
  overlap_duration: number = 0;
  overlap_duration_unit: string = Base.DURATION_TYPES.minutes;
  overlap_duration_uom_id: number = 0;
  allow_subscriber: boolean = false;
  notes: string = "";
  app_id: number = 0;
  map_data: string = "";
}

export class PointofcareUserModel {
  id: number = 0;
  user_first_name: string = "";
  user_middle_name: string = "";
  user_last_name: string = "";
}
export class PointofcareUser {
  id: number = 0;
  name: string = "";
}
export class PointofcareEscalation extends Base {
  type: string = PointofcareEscalation.TYPE.user;
  id: number = 0;
  level: number = 0;
  duration: number = 0;
  duration_unit_uom: number = 0;
  duration_unit_uom_value: string = "";
  name: string = "";
  mname: string = "";
  lname: string = "";
}
export namespace PointofcareEscalation {
  export enum TYPE {
    user = "USER",
    team = "TEAM",
  }

  export enum DURATION_UOM_TYPE {
    SEC = "SEC",
    MIN = "MIN",
    HRS = "HRS",
  }
}

export class PointofcareModelCreteria extends Pointofcare {
  is_user_subscribed: boolean = false;
  is_subscribed: boolean = false;
}
export class PointofcareWrapper extends Pointofcare {
  is_subscribed: boolean = false;
  is_user_subscribed: boolean = false;
}
