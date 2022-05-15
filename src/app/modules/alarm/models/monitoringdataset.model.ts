import { Base } from "../../global/models/base.model";
import { json_custom_parser } from "../../global/utils";
import { POCMonitoringDataConfig } from "./pocmonitoringdataconfig.model";
import { ReferenceListModel } from "./referencelist.model";
import { MonitoringDataValuesWrapper } from "./monitoringdatavalues.model";

export class MonitoringDataset extends Base {
  id: number = 0;
  monitoring_type_id: number = 0;
  code: string = "";
  name: string = "";
  description: string = "";
  format_type: string = "";
  configuration: POCMonitoringDataConfig.Configuration = new POCMonitoringDataConfig.Configuration();
  attributes: MonitoringDataset.Attributes = new MonitoringDataset.Attributes();

  /* template */
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  version: number = 0;
  is_active: boolean = false;
  lang_code: string = "";
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}
export class MonitoringDatasetCriteria extends MonitoringDataset {
  monitoring_type: ReferenceListModel | null = null;
  monitoring_value_list: Array<MonitoringDataValuesWrapper> | null = null;
}
export namespace MonitoringDataset {
  export enum TYPES {
    scores = "SCORES",
    vitals = "VITALS",
    evals = "EVALS",
    resp = "RESP",
    meds = "MEDS",
    issues = "ISSUES",
    labs = "LABS",
  }
  export class Attributes {
    concentration_value: number = 0;
    concentration_unit: string = "";
    strength_value: number = 0;
    strength_unit: string = "";
    rate_value: number = 0;
    rate_unit: string = "";
    class: ReferenceListModel | null = null;
    administration_mode: ReferenceListModel | null = null;

  }

}
