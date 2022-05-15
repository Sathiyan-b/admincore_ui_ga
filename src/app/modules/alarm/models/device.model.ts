import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
import {
  PatientMedicationCustomModel,
  PatientMedicationModel,
} from "./patientmedication.model";
import { PatientModel } from "./patient.model";
import { PatientVisitModel } from "./patientvisit.model";
import { AlarmObservationModel } from "./alarmobservation.model";
import { AlarmActorsModel } from "./alarmactorsv2.model";

export class DeviceModel extends BaseV2 {
  id: number = 0;
  device_name: string = "";
  device_type: string = "";
  device_sub_type: string = "";
  device_serial_id: string = "";
  device_barcode: string = "";
  out_of_service: boolean = false;
  out_of_service_reason: string = "";
  decommissioned: boolean = false;
  class: string = "";
  sub_class: string = "";
  is_suspended: boolean | null = false;
  last_result_on: Date = new Date();
  last_alarm_on: Date = new Date();

  //
  enterprise: any = [];
  location: any = [];
  enterprise_id: number = 0;
  location_id: number = 0;
  //
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = true;
  version: number = 1;
  alarm_count: number = 0;

  constructor(init?: Partial<DeviceModel>) {
    super(init);
    if (init) {
      if (_.get(init, "id", null) != null) {
        this.id = parseInt(_.get(init, "id", 0).toString());
      }
      if (_.get(init, "device_name", null) != null) {
        this.device_name = _.get(init, "device_name", "");
      }
      if (_.get(init, "out_of_service_reason", null) != null) {
        this.out_of_service_reason = init.out_of_service_reason as string;
      }

      if (_.get(init, "device_type", null) != null) {
        this.device_type = _.get(init, "device_type", "");
      }
      if (_.get(init, "device_sub_type", null) != null) {
        this.device_sub_type = _.get(init, "device_sub_type", "");
      }
      if (_.get(init, "device_barcode", null) != null) {
        this.device_barcode = _.get(init, "device_barcode", "");
      }
      if (_.get(init, "device_serial_id", null) != null) {
        this.device_serial_id = _.get(init, "device_serial_id", "");
      }
      if (_.get(init, "class", null) != null) {
        this.class = _.get(init, "class", "");
      }
      if (_.get(init, "sub_class", null) != null) {
        this.sub_class = _.get(init, "sub_class", "");
      }
      //
      if (_.get(init, "enterprise", null) != null) {
        try {
          if (typeof init!.enterprise == "string") {
            this.enterprise = JSON.parse(init!.enterprise);
          } else {
            this.enterprise = init!.enterprise;
          }
        } catch (error) {
          this.enterprise = {};
        }
      }
      if (_.get(init, "location", null) != null) {
        try {
          if (typeof init!.location == "string") {
            this.location = JSON.parse(init!.location);
          } else {
            this.location = init!.location;
          }
        } catch (error) {
          this.location = {};
        }
      }
      if (_.get(init, "is_suspended", null) != null) {
        this.is_suspended = _.get(init, "is_suspended", false);
      }
      if (_.get(init, "last_result_on", null) != null) {
        if (typeof init?.last_result_on == "string") {
          this.last_result_on = new Date(init.last_result_on);
        } else {
          this.last_result_on = init?.last_result_on!;
        }
      } else {
        this.last_result_on = new Date(9999, 11, 31, 23, 59, 59);
      }
      if (_.get(init, "last_alarm_on", null) != null) {
        if (typeof init?.last_alarm_on == "string") {
          this.last_alarm_on = new Date(init.last_alarm_on);
        } else {
          this.last_alarm_on = init?.last_alarm_on!;
        }
      } else {
        this.last_alarm_on = new Date(9999, 11, 31, 23, 59, 59);
      }
      if (_.get(init, "enterprise_id", null) != null) {
        this.enterprise_id = parseInt(init.enterprise_id!.toString());
      }
      if (_.get(init, "location_id", null) != null) {
        this.location_id = parseInt(init.location_id!.toString());
      }
      //
      if (_.get(init, "created_by", null) != null) {
        this.created_by = parseInt(init.created_by!.toString());
      }
      if (_.get(init, "created_on", null) != null) {
        if (typeof init?.created_on == "string") {
          this.created_on = new Date(init.created_on);
        } else {
          this.created_on = init?.created_on!;
        }
      } else {
        this.created_on = new Date(9999, 11, 31, 23, 59, 59);
      }
      if (_.get(init, "modified_by", null) != null) {
        this.modified_by = parseInt(init.modified_by!.toString());
      }

      if (_.get(init, "modified_on", null) != null) {
        if (typeof init?.modified_on == "string") {
          this.modified_on = new Date(init.modified_on);
        } else {
          this.modified_on = init?.modified_on!;
        }
      } else {
        this.modified_on = new Date(9999, 11, 31, 23, 59, 59);
      }
      if (_.get(init, "version", null) != null) {
        this.version = parseInt(init.version!.toString());
      }
      if (_.get(init, "is_active", null) != null) {
        this.is_active = _.get(init, "is_active", false);
      }
      if (_.get(init, "out_of_service", null) != null) {
        this.out_of_service = init.out_of_service as boolean;
      }
      if (_.get(init, "decommissioned", null) != null) {
        this.decommissioned = init.decommissioned as boolean;
      }
      /* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */
    }
  }
}
export class DeviceModelCreteria extends DeviceModel {
  latest_patient_medication: PatientMedicationModel =
    new PatientMedicationModel();
  patient: PatientModel = new PatientModel();
  patient_visit: PatientVisitModel = new PatientVisitModel();
  alarm_observartion: AlarmObservationModel = new AlarmObservationModel();
  alarm_actor: AlarmActorsModel = new AlarmActorsModel();
  has_alarm: boolean = false;
  constructor(init?: Partial<DeviceModelCreteria>) {
    super(init);
    if (init) {
      if (init.latest_patient_medication != null) {
        this.latest_patient_medication = new PatientMedicationModel(
          init.latest_patient_medication
        );
      }
      if (init.patient != null) {
        this.patient = new PatientModel(init.patient);
      }
      if (init.patient_visit != null) {
        this.patient_visit = new PatientVisitModel(init.patient_visit);
      }
      if (init.alarm_observartion != null) {
        this.alarm_observartion = new AlarmObservationModel(
          init.alarm_observartion
        );
      }
      if (init.alarm_actor != null) {
        this.alarm_actor = new AlarmActorsModel(init.alarm_actor);
      }
      if (typeof init.has_alarm == "boolean") {
        this.has_alarm = init.has_alarm;
      }
    }
  }
}
