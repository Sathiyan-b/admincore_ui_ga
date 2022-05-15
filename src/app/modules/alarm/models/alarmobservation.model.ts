import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
import { UserModel } from "./user.model";

export class AlarmObservationModel extends BaseV2 {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  patient_visit_id: number = 0;
  patient_order_id: number = 0;
  patient_medication_id: number = 0;
  received_on: Date = new Date();
  observations: any = [];
  device_name: string = "";
  power_status: string = "";
  maintenance_status: string = "";
  alarm_type: string = "";
  event_phase: string = "";
  alarm_status: string = "";
  alert_type: string = "";
  alarm_type_desc: string = "";
  alarm_user_status: string = "";
  alarm_user_status_changedby: number = 0;
  alarm_user_status_changedon: Date = new Date();
  alarm_user_status_reason: string = "";
  who_acted: number = 0;
  when_acted: Date = new Date();
  //
  enterprise: any = [];
  location: any = [];
  enterprise_id: number = 0;
  location_id: number = 0;
  device_id: number = 0;
  key: string = "";
  //
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = true;
  version: number = 1;
  point_of_care: string = "";
  room: string = "";
  bed: string = "";

  constructor(init?: Partial<AlarmObservationModel>) {
    super(init);
    if (init) {
      if (_.get(init, "id", null) != null) {
        this.id = parseInt(_.get(init, "id", 0).toString());
      }
      if (_.get(init, "ihe_msg_id", null) != null) {
        this.ihe_msg_id = parseInt(_.get(init, "ihe_msg_id", 0).toString());
      }

      if (_.get(init, "patient_id", null) != null) {
        this.patient_id = parseInt(_.get(init, "patient_id", 0).toString());
      }
      if (_.get(init, "patient_visit_id", null) != null) {
        this.patient_visit_id = parseInt(
          _.get(init, "patient_visit_id", 0).toString()
        );
      }
      if (_.get(init, "patient_order_id", null) != null) {
        this.patient_order_id = parseInt(
          _.get(init, "patient_order_id", 0).toString()
        );
      }
      if (_.get(init, "patient_medication_id", null) != null) {
        this.patient_medication_id = parseInt(
          _.get(init, "patient_medication_id", 0).toString()
        );
      }
      if (_.get(init, "received_on", null) != null) {
        if (typeof init?.received_on == "string") {
          this.received_on = new Date(init.received_on);
        } else {
          this.received_on = init?.received_on!;
        }
      } else {
        this.received_on = new Date();
      }
      if (_.get(init, "observations", null) != null) {
        try {
          if (typeof init!.observations == "string") {
            this.observations = JSON.parse(init!.observations);
          } else {
            this.observations = init!.observations;
          }
        } catch (error) {
          this.observations = {};
        }
      }
      if (_.get(init, "device_name", null) != null) {
        this.device_name = _.get(init, "device_name", "");
      }
      if (_.get(init, "power_status", null) != null) {
        this.power_status = _.get(init, "power_status", "");
      }
      if (_.get(init, "maintenance_status", null) != null) {
        this.maintenance_status = _.get(init, "maintenance_status", "");
      }
      if (_.get(init, "alarm_type", null) != null) {
        this.alarm_type = _.get(init, "alarm_type", "");
      }
      if (_.get(init, "event_phase", null) != null) {
        this.event_phase = _.get(init, "event_phase", "");
      }
      if (_.get(init, "alarm_status", null) != null) {
        this.alarm_status = _.get(init, "alarm_status", "");
      }
      if (_.get(init, "alert_type", null) != null) {
        this.alert_type = _.get(init, "alert_type", "");
      }
      if (_.get(init, "alarm_type_desc", null) != null) {
        this.alarm_type_desc = _.get(init, "alarm_type_desc", "");
      }
      if (_.get(init, "alarm_user_status", null) != null) {
        this.alarm_user_status = _.get(init, "alarm_user_status", "");
      }
      if (_.get(init, "alarm_user_status_changedby", null) != null) {
        this.alarm_user_status_changedby = parseInt(
          _.get(init, "alarm_user_status_changedby", 0).toString()
        );
      }
      if (_.get(init, "alarm_user_status_changedon", null) != null) {
        if (typeof init?.alarm_user_status_changedon == "string") {
          this.alarm_user_status_changedon = new Date(
            init.alarm_user_status_changedon
          );
        } else {
          this.alarm_user_status_changedon = init?.alarm_user_status_changedon!;
        }
      } else {
        this.alarm_user_status_changedon = new Date();
      }
      if (_.get(init, "alarm_user_status_reason", null) != null) {
        this.alarm_user_status_reason = _.get(
          init,
          "alarm_user_status_reason",
          ""
        );
      }
      if (_.get(init, "who_acted", null) != null) {
        this.who_acted = parseInt(_.get(init, "who_acted", 0).toString());
      }
      if (_.get(init, "when_acted", null) != null) {
        if (typeof init?.when_acted == "string") {
          this.when_acted = new Date(init.when_acted);
        } else {
          this.when_acted = init?.when_acted!;
        }
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
      if (_.get(init, "point_of_care", null) != null) {
        this.point_of_care = _.get(init, "point_of_care", "");
      }
      if (_.get(init, "room", null) != null) {
        this.room = _.get(init, "room", "");
      }
      if (_.get(init, "bed", null) != null) {
        this.bed = _.get(init, "bed", "");
      }
      /* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */
    }
  }
}
export namespace AlarmObservationModel {
  export enum ALARM_STATUS {
    active = "active",
    accepted = "accepted",
    escalated = "escalated"
  }
}

export class AlarmObservationModelCreteria extends AlarmObservationModel {
  user_acted: UserModel = new UserModel();
  constructor(init?: Partial<AlarmObservationModelCreteria>) {
    super(init);
    if (init) {
      if (init.user_acted != null) {
        this.user_acted = init.user_acted;
      }
    }
  }
}
