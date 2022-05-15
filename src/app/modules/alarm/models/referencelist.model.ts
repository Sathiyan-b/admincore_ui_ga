import * as _ from "lodash";
import { Base } from "../../global/models/base.model";
import { json_custom_parser } from "../../global/utils";
export class ReferenceListModel extends Base {
  id: number = 0;
  ref_type_id: number = 0;
  identifier: string = "";
  display_text: string = "";
  lang_code: string = "en-GB";
  app_id: number = 0;
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = true;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}

export namespace ReferenceListModel {
  export enum TYPES {
    MONITORING_DATA = "MONITORING_DATA",
    MONITORING_VALUE_SPARK_LINE = "MONITORING_VALUE_SPARK_LINE",
    MONITORING_VALUE_COLOR = "MONITORING_VALUE_COLOR",
    MONITORING_VALUE_BACKGROUND_SHAPE = "MONITORING_VALUE_BACKGROUND_SHAPE",
    TREND_INDICATORS = "TREND_INDICATORS",
    DATE_RANGE_UNITS = "DATE_RANGE_UNITS",
    DRUG_CLASS = "DRUG_CLASS",
    DRUG_ADMINISTRATION_MODE = "DRUG_ADMINISTRATION_MODE",
    SECURITY_MODE = "SECURITY_MODE",
    DEVICE_PAT = "DEVICE_PAT",
    DEVICE_MANF = "DEVICE_MANF",
    DEVICE_MODEL = "DEVICE_MODEL",
    DEVICE_TYPE = "DEVICE_TYPE",
  }
}
