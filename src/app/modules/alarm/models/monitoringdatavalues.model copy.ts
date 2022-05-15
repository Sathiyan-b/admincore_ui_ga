import { Base } from "../../global/models/base.model";
import { json_custom_parser } from "../../global/utils";
import { POCMonitoringDataConfig } from "./pocmonitoringdataconfig.model";
import { ReferenceListModel } from "./referencelist.model";
import { MonitoringDataset } from "./monitoringdataset.model";

export class MonitoringDataValues extends Base {
  id: number = 0;
  monitoringdataconfig_id: number = 0;
  poc_name: string = "";
  pointofcare_id: number = 0;
  patient_id: number = 0;
  patient_external_id: number = 0;
  patient_visit_id: number = 0;
  tran_values: MonitoringDataValues.TransValue = new MonitoringDataValues.TransValue();
  source_system: string = "";
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
export class MonitoringDataValuesWrapper extends MonitoringDataValues {
  monitoringdataconfig: POCMonitoringDataConfig | null = null;
  monitoringdataset: MonitoringDataset | null = null;
  monitoring_type: ReferenceListModel | null = null;
}
export namespace MonitoringDataValues {
  export class TransValue {
    name: string = "";
    value: number | string | null = null;
    constructor(init?: Partial<TransValue>) {
      if (init) {
        if (typeof init.value == "number" || typeof init.value == "string") {
          this.value = init.value;
        }
        if (typeof init.name == "string") this.name = init.name;
      }
    }
  }
}
