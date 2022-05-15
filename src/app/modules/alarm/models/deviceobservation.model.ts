import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
import moment, { Moment } from "moment";

export class GraphData extends BaseV2 {
  volume_delivered: string | number = 0;
  time_elapsed: string | number | Moment = 0;
  volume: number = 0;
  delivered_on: Date = new Date();
  show_label: boolean = false;
  constructor(init?: Partial<GraphData>) {
    super(init);
    if (init) {
      if (_.get(init, "volume", null) != null) {
        this.volume = parseFloat(_.get(init, "volume", 0).toString());
      }
      if (_.get(init, "delivered_on", null) != null) {
        if (typeof init?.delivered_on == "string") {
          this.delivered_on = new Date(init.delivered_on);
        } else {
          this.delivered_on = init?.delivered_on!;
        }
      } else {
        this.delivered_on = new Date();
      }
      if (_.get(init, "show_label", null) != null) {
        this.show_label = _.get(init, "show_label", false);
      }
    }
  }
}

export class DeviceObservationGraphModel extends BaseV2 {
  patient_order_id: number = 0;
  order_details: string = "";
  volume_delivered: string = "";
  time_elapsed: string = "";
  total_record: number = 0;
  constructor(init?: Partial<DeviceObservationGraphModel>) {
    super(init);
    if (init) {
      if (_.get(init, "patient_order_id", null) != null) {
        this.patient_order_id = parseInt(
          _.get(init, "patient_order_id", 0).toString()
        );
      }
      if (_.get(init, "order_details", null) != null) {
        this.order_details = _.get(init, "order_details", "");
      }
      if (_.get(init, "volume_delivered", null) != null) {
        this.volume_delivered = _.get(init, "volume_delivered", "");
      }
      if (_.get(init, "time_elapsed", null) != null) {
        this.time_elapsed = _.get(init, "time_elapsed", "");
      }
      if (_.get(init, "total_record", null) != null) {
        this.total_record = parseInt(_.get(init, "total_record", 0).toString());
      }
    }
  }
}

export class DeviceObservationModel extends BaseV2 {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  received_on: Date = new Date();
  set_id: number = 0;
  patient_order_id: number = 0;
  patient_medication_id: number = 0;
  observations: any = [];
  device_name: string = "";
  device_mds: string = "";
  device_vmd: string = "";
  device_channel: string = "";
  device_mode: string = "";
  device_status: string = "";
  rate_unit_code: string = "";
  rate_unit_name: string = "";
  rate_unit_system: string = "";
  dose_unit_code: string = "";
  dose_unit_name: string = "";
  dose_unit_system: string = "";
  volume_unit_code: string = "";
  volume_unit_name: string = "";
  volume_unit_system: string = "";
  strength_unit_code: string = "";
  strength_unit_name: string = "";
  strength_unit_system: string = "";
  dose: number = 0;
  dose_limit: number = 0;
  rate: number = 0;
  strength: number = 0;
  volume_delivered: number = 0;
  volume_tbi: number = 0;
  volume_remain: number = 0;
  lockout: number = 0;
  time_plan: number = 0;
  time_remain: number = 0;
  time_expected: number = 0;
  time_unit_code: string = "";
  time_unit_name: string = "";
  time_unit_system: string = "";
  delivery_status: string = "";
  alarm_id: number = 0;
  patient_visit_id: number = 0;
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

  constructor(init?: Partial<DeviceObservationModel>) {
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
      if (_.get(init, "received_on", null) != null) {
        if (typeof init?.received_on == "string") {
          this.received_on = new Date(init.received_on);
        } else {
          this.received_on = init?.received_on!;
        }
      } else {
        this.received_on = new Date();
      }
      if (_.get(init, "set_id", null) != null) {
        this.set_id = parseInt(_.get(init, "set_id", 0).toString());
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

      // if (_.get(init, "observations", null) != null) { this.observations = _.get(init, "observations", ""); }
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
      //
      if (_.get(init, "device_name", null) != null) {
        this.device_name = _.get(init, "device_name", "");
      }
      if (_.get(init, "device_mds", null) != null) {
        this.device_mds = _.get(init, "device_mds", "");
      }
      if (_.get(init, "device_vmd", null) != null) {
        this.device_vmd = _.get(init, "device_vmd", "");
      }
      if (_.get(init, "device_channel", null) != null) {
        this.device_channel = _.get(init, "device_channel", "");
      }
      if (_.get(init, "device_mode", null) != null) {
        this.device_mode = _.get(init, "device_mode", "");
      }
      if (_.get(init, "device_status", null) != null) {
        this.device_status = _.get(init, "device_status", "");
      }
      if (_.get(init, "rate_unit_code", null) != null) {
        this.rate_unit_code = _.get(init, "rate_unit_code", "");
      }
      if (_.get(init, "rate_unit_name", null) != null) {
        this.rate_unit_name = _.get(init, "rate_unit_name", "");
      }
      if (_.get(init, "rate_unit_system", null) != null) {
        this.rate_unit_system = _.get(init, "rate_unit_system", "");
      }
      if (_.get(init, "dose_unit_code", null) != null) {
        this.dose_unit_code = _.get(init, "dose_unit_code", "");
      }
      if (_.get(init, "dose_unit_name", null) != null) {
        this.dose_unit_name = _.get(init, "dose_unit_name", "");
      }
      if (_.get(init, "dose_unit_system", null) != null) {
        this.dose_unit_system = _.get(init, "dose_unit_system", "");
      }
      if (_.get(init, "volume_unit_code", null) != null) {
        this.volume_unit_code = _.get(init, "volume_unit_code", "");
      }
      if (_.get(init, "volume_unit_name", null) != null) {
        this.volume_unit_name = _.get(init, "volume_unit_name", "");
      }
      if (_.get(init, "volume_unit_system", null) != null) {
        this.volume_unit_system = _.get(init, "volume_unit_system", "");
      }
      if (_.get(init, "strength_unit_code", null) != null) {
        this.strength_unit_code = _.get(init, "strength_unit_code", "");
      }
      if (_.get(init, "strength_unit_name", null) != null) {
        this.strength_unit_name = _.get(init, "strength_unit_name", "");
      }
      if (_.get(init, "strength_unit_system", null) != null) {
        this.strength_unit_system = _.get(init, "strength_unit_system", "");
      }

      if (_.get(init, "dose", null) != null) {
        this.dose = parseInt(_.get(init, "dose", 0).toString());
      }
      if (_.get(init, "dose_limit", null) != null) {
        this.dose_limit = parseInt(_.get(init, "dose_limit", 0).toString());
      }
      if (_.get(init, "rate", null) != null) {
        this.rate = parseInt(_.get(init, "rate", 0).toString());
      }
      if (_.get(init, "strength", null) != null) {
        this.strength = parseInt(_.get(init, "strength", 0).toString());
      }
      if (_.get(init, "volume_delivered", null) != null) {
        this.volume_delivered = parseInt(
          _.get(init, "volume_delivered", 0).toString()
        );
      }
      if (_.get(init, "volume_tbi", null) != null) {
        this.volume_tbi = parseInt(_.get(init, "volume_tbi", 0).toString());
      }
      if (_.get(init, "volume_remain", null) != null) {
        this.volume_remain = parseInt(
          _.get(init, "volume_remain", 0).toString()
        );
      }
      if (_.get(init, "lockout", null) != null) {
        this.lockout = parseInt(_.get(init, "lockout", 0).toString());
      }
      if (_.get(init, "time_plan", null) != null) {
        this.time_plan = parseInt(_.get(init, "time_plan", 0).toString());
      }
      if (_.get(init, "time_remain", null) != null) {
        this.time_remain = parseInt(_.get(init, "time_remain", 0).toString());
      }
      if (_.get(init, "time_expected", null) != null) {
        this.time_expected = parseInt(
          _.get(init, "time_expected", 0).toString()
        );
      }

      if (_.get(init, "time_unit_code", null) != null) {
        this.time_unit_code = _.get(init, "time_unit_code", "");
      }
      if (_.get(init, "time_unit_name", null) != null) {
        this.time_unit_name = _.get(init, "time_unit_name", "");
      }
      if (_.get(init, "time_unit_system", null) != null) {
        this.time_unit_system = _.get(init, "time_unit_system", "");
      }
      if (_.get(init, "delivery_status", null) != null) {
        this.delivery_status = _.get(init, "delivery_status", "");
      }

      if (_.get(init, "alarm_id", null) != null) {
        this.alarm_id = parseInt(_.get(init, "alarm_id", 0).toString());
      }
      if (_.get(init, "patient_visit_id", null) != null) {
        this.patient_visit_id = parseInt(
          _.get(init, "patient_visit_id", 0).toString()
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
