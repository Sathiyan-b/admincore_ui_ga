import * as moment from "moment";
import { Base } from "../../global/models/base.model";
import { json_custom_parser } from "../../global/utils";
import { UserTeam } from "./userteam.model";
import { RoleProfiles } from "./roleprofiles.model";

export class POCMonitoringDataConfig extends Base {
  id: number = 0;
  monitoringdataset_id: number = 0;
  poc_name: string = "";
  pointofcare_id: number = 0;
  access_control: Array<POCMonitoringDataConfig.AccessControlMember> = [];
  configuration: POCMonitoringDataConfig.Configuration = new POCMonitoringDataConfig.Configuration();
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
  // attributes: POCMonitoringDataConfig.Attributes = new POCMonitoringDataConfig.Attributes();

}

export class POCMonitoringDataConfigCriteria extends POCMonitoringDataConfig {
  // monitoringdataset: MonitoringDataset | null = null;
  // monitoring_type: ReferenceListModel | null = null;
}

export namespace POCMonitoringDataConfig {
  export enum TREND_INDICATORS {
    double_up = "DOUBLE_UP",
    double_down = "DOUBLE_DOWN",
  }
  export enum SPARK_LINE_OPTIONS {
    no_spark = "NO_SPARK",
  }
  export class Configuration {
    // spark_line: ReferenceListModel | null = null;
    // spark_line_time_frame: TimeFrame = new TimeFrame();
    // calculate_trend: boolean = false;
    // trend_timeframe: TimeFrame = new TimeFrame();
    // trend_calculation_window: TimeFrame = new TimeFrame();
    // trend_calculator: ReferenceListModel | null = null;
    // trend_indicator_map: Array<TrendIndicator> = [];
    // class_indicator_map: Array<ClassIndicator> = [];
    // valuerange_format_map: Array<ValueRangeFormat> = [];
  }
  export class TimeFrame {
    value: moment.DurationInputArg1 = 0;
    unit: moment.DurationInputArg2 = "second";
    constructor(init?: Partial<TimeFrame>) {
      if (init) {
        if (init.value) this.value = init.value;
        if (init.unit) this.unit = init.unit;
      }
    }
  }
  // export class TrendIndicator {
  //   icon: ReferenceListModel | null = null;
  //   from: number = 0;
  //   to: number = 0;
  //   constructor(init?: Partial<TrendIndicator>) {
  //     if (init) {
  //       if (init.icon) this.icon = new ReferenceListModel(init.icon);
  //       if (typeof init.from == "number") this.from = init.from;
  //       if (typeof init.to == "number") this.to = init.to;
  //     }
  //   }
  // }
  // export class ClassIndicator {
  //   color: ReferenceListModel | null = null;
  //   label: string = "";
  //   unit: string = "";
  //   from_value: number = 0;
  //   to_value: number = 0;
  //   constructor(init?: Partial<ClassIndicator>) {
  //     if (init) {
  //       if (init.color) this.color = new ReferenceListModel(init.color);
  //       if (typeof init.label == "string") this.label = init.label;
  //       if (typeof init.from_value == "number")
  //         this.from_value = init.from_value;
  //       if (typeof init.unit == "string") this.unit = init.unit;
  //       if (typeof init.to_value == "number") this.to_value = init.to_value;
  //     }
  //   }
  // }
  // export class ValueRangeFormat {
  //   shape: ReferenceListModel | null = null;
  //   color: ReferenceListModel | null = null;
  //   from: number = 0;
  //   to: number = 0;
  //   constructor(init?: Partial<ValueRangeFormat>) {
  //     if (init) {
  //       if (init.shape) this.shape = new ReferenceListModel(init.shape);
  //       if (init.color) this.color = new ReferenceListModel(init.color);
  //       if (typeof init.from == "number") this.from = init.from;
  //       if (typeof init.to == "number") this.to = init.to;
  //     }
  //   }
  // }
  export class AccessControlMember {
    type: string = "";
    item: UserTeam | RoleProfiles | null = null;
  }
  export enum ACCESS_CONTROL_MEMBER_TYPE {
    user_team = "USER_TEAM",
    role_profile = "ROLE_PROFILE",
  }
  export enum MONITORING_VALUE_COLOR {
    RED = "RED",
    YELLOW = "YELLOW",
    GREEN = "GREEN",
  }
  export enum MONITORING_VALUE_BACKGROUND_SHAPE {
    CIRCLE = "CIRCLE",
    SQUARE = "SQUARE",
  }
  // export class Attributes {
  //   concentration_value: number = 0;
  //   concentration_unit: string = "";
  //   strength_value: number = 0;
  //   strength_unit: string = "";
  //   rate_value: number = 0;
  //   rate_unit: string = "";
  //   class: ReferenceListModel | null = null;
  //   administration_mode: ReferenceListModel | null = null;

  //   constructor(init?: Partial<Attributes>) {
  //     if (init) {
  //       if (typeof init.concentration_value == "number")
  //         this.concentration_value = init.concentration_value;
  //       if (typeof init.concentration_unit == "string")
  //         this.concentration_unit = init.concentration_unit;
  //       if (typeof init.strength_value == "number")
  //         this.strength_value = init.strength_value;
  //       if (typeof init.strength_unit == "string")
  //         this.strength_unit = init.strength_unit;
  //       if (typeof init.rate_value == "number")
  //         this.rate_value = init.rate_value;
  //       if (typeof init.rate_unit == "string") this.rate_unit = init.rate_unit;
  //       if (init.class) this.class = new ReferenceListModel(init.class);
  //       if (init.administration_mode)
  //         this.administration_mode = new ReferenceListModel(
  //           init.administration_mode
  //         );
  //     }
  //   }
  // }
}
