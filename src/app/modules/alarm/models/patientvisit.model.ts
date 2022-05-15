import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
import { PatientModel } from "./patient.model";
import { MonitoringDataValuesCriteria } from "./monitoringdatavaluesv2.model";
import { MonitoringDataset } from "./monitoringdataset.model";

export class PatientVisitModel extends BaseV2 {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  visited_on: Date = new Date();
  room: string = "";
  bed: string = "";
  facility: string = "";
  building: string = "";
  floor: string = "";
  patient_class: string = "";
  visit_number: string = "";
  attending_doctor_id: string = "";
  attending_doctor_family_name: string = "";
  attending_doctor_given_name: string = "";
  nursing_unit: string = "";
  //
  enterprise: any = [];
  location: any = [];
  enterprise_id: number = 0;
  location_id: number = 0;
  device_id: number = 0;
  key: string = "";
  admission_on: Date = new Date();
  is_discharged: boolean = false;
  discharged_on: Date = new Date();
  //
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = true;
  version: number = 1;
  //
  patient_info: string = "";

  constructor(init?: Partial<PatientVisitModel>) {
    super(init);
    if (init) {
      if (_.get(init, "id", null) != null) {
        this.id = parseInt(_.get(init, "id", 0).toString());
      }
      if (_.get(init, "ihe_msg_id", null) != null) {
        this.ihe_msg_id = parseInt(_.get(init, "ihe_msg_id", 0).toString());
      }
      //
      if (_.get(init, "patient_id", null) != null) {
        this.patient_id = parseInt(_.get(init, "patient_id", 0).toString());
      }
      if (_.get(init, "admission_on", null) != null) {
        if (typeof init?.admission_on == "string") {
          this.admission_on = new Date(init.admission_on);
        } else {
          this.admission_on = init?.admission_on!;
        }
      } else {
        this.admission_on = new Date();
      }
      if (_.get(init, "nursing_unit", null) != null) {
        this.nursing_unit = _.get(init, "nursing_unit", "");
      }
      if (_.get(init, "room", null) != null) {
        this.room = _.get(init, "room", "");
      }
      if (_.get(init, "bed", null) != null) {
        this.bed = _.get(init, "bed", "");
      }
      if (_.get(init, "facility", null) != null) {
        this.facility = _.get(init, "facility", "");
      }
      if (_.get(init, "building", null) != null) {
        this.building = _.get(init, "building", "");
      }
      if (_.get(init, "floor", null) != null) {
        this.floor = _.get(init, "floor", "");
      }
      if (_.get(init, "patient_class", null) != null) {
        this.patient_class = _.get(init, "patient_class", "");
      }
      if (_.get(init, "visit_number", null) != null) {
        this.visit_number = _.get(init, "visit_number", "");
      }
      if (_.get(init, "attending_doctor_id", null) != null) {
        this.attending_doctor_id = _.get(
          init,
          "attending_doctor_id",
          ""
        );
      }

      if (_.get(init, "attending_doctor_family_name", null) != null) {
        this.attending_doctor_family_name = _.get(
          init,
          "attending_doctor_family_name",
          ""
        );
      }
      if (_.get(init, "attending_doctor_given_name", null) != null) {
        this.attending_doctor_given_name = _.get(
          init,
          "attending_doctor_given_name",
          ""
        );
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
      if (_.get(init, "enterprise_id", null) != null) {
        this.enterprise_id = parseInt(init.enterprise_id!.toString());
      }
      if (_.get(init, "location_id", null) != null) {
        this.location_id = parseInt(init.location_id!.toString());
      }
      if (_.get(init, "device_id", null) != null) {
        this.device_id = parseInt(init.device_id!.toString());
      }
      if (_.get(init, "key", null) != null) {
        this.key = _.get(init, "key", "");
      }
      if (_.get(init, "is_discharged", null) != null) {
        this.is_discharged = _.get(init, "is_discharged", false);
      }
      if (_.get(init, "discharged_on", null) != null) {
        if (typeof init?.discharged_on == "string") {
          this.discharged_on = new Date(init.discharged_on);
        } else {
          this.discharged_on = init?.discharged_on!;
        }
      } else {
        this.discharged_on = new Date();
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
        this.created_on = new Date();
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
        this.modified_on = new Date();
      }
      if (_.get(init, "version", null) != null) {
        this.version = parseInt(init.version!.toString());
      }
      if (_.get(init, "patient_info", null) != null) {
        this.patient_info = _.get(init, "patient_info", "");
      }
      /* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */
    }
  }
}

export class PatientVisitModelCreteria extends PatientVisitModel {
  has_alarm: boolean = false;
  is_user_favourite: boolean = false;
  patient: PatientModel = new PatientModel();
  monitoring_type: string = MonitoringDataset.TYPES.scores;
  monitoringdatavalue_list: Array<MonitoringDataValuesCriteria> | null = null;
  constructor(init?: Partial<PatientVisitModelCreteria>) {
    super(init);
    if (init) {
      if (typeof init.has_alarm == "boolean") {
        this.has_alarm = init.has_alarm;
      }
      if (typeof init.is_user_favourite == "boolean") {
        this.is_user_favourite = init.is_user_favourite;
      }
      if (init.patient) {
        this.patient = init.patient;
      }
      if (init.monitoringdatavalue_list) {
        this.monitoringdatavalue_list = init.monitoringdatavalue_list;
      }
      if (typeof init.monitoring_type == "string") {
        this.monitoring_type = init.monitoring_type;
      }
    }
  }
}
