import { Base, BaseV2 } from "../../global/models/base.model";
import { json_custom_parser } from "../../global/utils";
import {
  MonitoringDataset,
  MonitoringDatasetCriteria,
} from "./monitoringdataset.model";
import {
  POCMonitoringDataConfig,
  POCMonitoringDataConfigCriteria,
} from "./pocmonitoringdataconfig.model";
import { ReferenceListModel } from "./referencelist.model";

export class MonitoringDataValues extends BaseV2 {
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
  constructor(init?: Partial<MonitoringDataValues>) {
    super(init);
    if (init) {
      if (typeof init.id == "number") this.id = init.id;

      if (typeof init.monitoringdataconfig_id == "number")
        this.monitoringdataconfig_id = init.monitoringdataconfig_id;

      if (typeof init.poc_name == "string") this.poc_name = init.poc_name;

      if (typeof init.pointofcare_id == "number")
        this.pointofcare_id = init.pointofcare_id;

      if (typeof init.patient_id == "number") this.patient_id = init.patient_id;

      if (typeof init.patient_external_id == "number")
        this.patient_external_id = init.patient_external_id;

      if (typeof init.patient_visit_id == "number")
        this.patient_visit_id = init.patient_visit_id;

      if (init.tran_values) {
        if (typeof init.tran_values == "string") {
          init.tran_values = json_custom_parser.parse<MonitoringDataValues.TransValue>(
            init.tran_values,
            new MonitoringDataValues.TransValue()
          );
        }
        this.tran_values = new MonitoringDataValues.TransValue(
          init.tran_values
        );
      }

      if (typeof init.source_system == "string")
        this.source_system = init.source_system;
      /* template */
      if (typeof init.created_on == "string" || init.created_on instanceof Date)
        this.created_on = new Date(init.created_on);

      if (
        typeof init.modified_on == "string" ||
        init.modified_on instanceof Date
      )
        this.modified_on = new Date(init.modified_on);

      if (typeof init.version == "number") this.version = init.version;

      if (typeof init.is_active == "boolean") this.is_active = init.is_active;

      if (typeof init.lang_code == "string") this.lang_code = init.lang_code;

      if (typeof init.is_suspended == "boolean")
        this.is_suspended = init.is_suspended;

      if (typeof init.parent_id == "number") this.parent_id = init.parent_id;

      if (typeof init.is_factory == "boolean")
        this.is_factory = init.is_factory;

      if (typeof init.notes == "string") this.notes = init.notes;
    }
  }
}
export class MonitoringDataValuesCriteria extends MonitoringDataValues {
  monitoringdataconfig: POCMonitoringDataConfig | null = null;
  monitoringdataset: MonitoringDataset | null = null;
  monitoring_type: ReferenceListModel | null = null;
  constructor(init?: Partial<MonitoringDataValuesCriteria>) {
    super(init);
    if (init) {
      // if (init.monitoringdataconfig)
      //   this.monitoringdataconfig = new POCMonitoringDataConfig(
      //     init.monitoringdataconfig
      //   );
      // if (init.monitoringdataset)
      //   this.monitoringdataset = new MonitoringDataset(init.monitoringdataset);
      // if (init.monitoring_type)
      //   this.monitoring_type = new ReferenceListModel(init.monitoring_type);
    }
  }
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
