import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";

export class PatientOrderModel extends BaseV2 {
  id: number = 0;
  ihe_msg_id: number = 0;
  patient_id: number = 0;
  patient_visit_id: number = 0;
  patient_medication_id: number = 0;
  medication_base_id: number = 0;
  medication_additive_id: number = 0;
  ordered_on: Date = new Date();
  set_id: number = 0;
  order_id: string = "";
  order_type: string = "";
  ordering_provider: string = "";
  ordering_provider_id: string = "";
  ordering_provider_family_name: string = "";
  ordering_provider_given_name: string = "";
  action_by_id: string = "";
  action_by_family_name: string = "";
  action_by_given_name: string = "";
  assigning_authority: string = "";
  order_universal_id: string = "";
  order_universal_name: string = "";
  latest_device_observation_id: number = 0;
  latest_alarm_observation_id: number = 0;
  order_status: string = "";
  //
  rate: number = 0;
  dose: number = 0;
  dose_limit: number = 0;
  strength: number = 0;
  volume_tbi: number = 0;
  lockout: number = 0;
  time_expected: number = 0;
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
  time_unit_code: string = "";
  time_unit_name: string = "";
  //
  diluent: number = 0;
  diluent_unit: string = "";
  concentration: number = 0;
  concentration_unit: string = "";
  concentration_final: number = 0;
  concentration_final_unit: string = "";
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

  constructor(init?: Partial<PatientOrderModel>) {
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
      if (_.get(init, "patient_visit_id", null) != null) {
        this.patient_visit_id = parseInt(
          _.get(init, "patient_visit_id", 0).toString()
        );
      }
      if (_.get(init, "patient_medication_id", null) != null) {
        this.patient_medication_id = parseInt(
          _.get(init, "patient_medication_id", 0).toString()
        );
      }
      if (_.get(init, "medication_base_id", null) != null) {
        this.medication_base_id = parseInt(
          _.get(init, "medication_base_id", 0).toString()
        );
      }
      if (_.get(init, "medication_additive_id", null) != null) {
        this.medication_additive_id = parseInt(
          _.get(init, "medication_additive_id", 0).toString()
        );
      }
      if (_.get(init, "ordered_on", null) != null) {
        if (typeof init?.ordered_on == "string") {
          this.ordered_on = new Date(init.ordered_on);
        } else {
          this.ordered_on = init?.ordered_on!;
        }
      } else {
        this.ordered_on = new Date();
      }
      if (_.get(init, "set_id", null) != null) {
        this.set_id = parseInt(_.get(init, "set_id", 0).toString());
      }
      if (_.get(init, "order_id", null) != null) {
        this.order_id = _.get(init, "order_id", "");
      }
      if (_.get(init, "order_type", null) != null) {
        this.order_type = _.get(init, "order_type", "");
      }
      if (_.get(init, "order_status", null) != null) {
        this.order_status = _.get(init, "order_status", "");
      }
      if (_.get(init, "ordering_provider", null) != null) {
        this.ordering_provider = _.get(init, "ordering_provider", "");
      }
      if (_.get(init, "ordering_provider_id", null) != null) {
        this.ordering_provider_id = _.get(init, "ordering_provider_id", "");
      }
      if (_.get(init, "ordering_provider_family_name", null) != null) {
        this.ordering_provider_family_name = _.get(
          init,
          "ordering_provider_family_name",
          ""
        );
      }
      if (_.get(init, "ordering_provider_given_name", null) != null) {
        this.ordering_provider_given_name = _.get(
          init,
          "ordering_provider_given_name",
          ""
        );
      }
      if (_.get(init, "action_by_id", null) != null) {
        this.action_by_id = _.get(init, "action_by_id", "");
      }
      if (_.get(init, "action_by_family_name", null) != null) {
        this.action_by_family_name = _.get(init, "action_by_family_name", "");
      }
      if (_.get(init, "action_by_given_name", null) != null) {
        this.action_by_given_name = _.get(init, "action_by_given_name", "");
      }
      if (_.get(init, "assigning_authority", null) != null) {
        this.assigning_authority = _.get(init, "assigning_authority", "");
      }
      if (_.get(init, "order_universal_id", null) != null) {
        this.order_universal_id = _.get(init, "order_universal_id", "");
      }
      if (_.get(init, "order_universal_name", null) != null) {
        this.order_universal_name = _.get(init, "order_universal_name", "");
      }
      //
      if (_.get(init, "latest_device_observation_id", null) != null) {
        this.latest_device_observation_id = parseInt(
          _.get(init, "latest_device_observation_id", 0).toString()
        );
      }
      if (_.get(init, "latest_alarm_observation_id", null) != null) {
        this.latest_alarm_observation_id = parseInt(
          _.get(init, "latest_alarm_observation_id", 0).toString()
        );
      }
      if (_.get(init, "order_status", null) != null) {
        this.order_status = _.get(init, "order_status", "");
      }
      //
      if (_.get(init, "rate", null) != null) {
        this.rate = parseFloat(_.get(init, "rate", 0).toString());
      }
      if (_.get(init, "dose", null) != null) {
        this.dose = parseFloat(_.get(init, "dose", 0).toString());
      }
      if (_.get(init, "dose_limit", null) != null) {
        this.dose_limit = parseFloat(_.get(init, "dose_limit", 0).toString());
      }
      if (_.get(init, "strength", null) != null) {
        this.strength = parseFloat(_.get(init, "strength", 0).toString());
      }
      if (_.get(init, "volume_tbi", null) != null) {
        this.volume_tbi = parseFloat(_.get(init, "volume_tbi", 0).toString());
      }
      if (_.get(init, "lockout", null) != null) {
        this.lockout = parseFloat(_.get(init, "lockout", 0).toString());
      }
      if (_.get(init, "time_expected", null) != null) {
        this.time_expected = parseFloat(
          _.get(init, "time_expected", 0).toString()
        );
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
      if (_.get(init, "time_unit_code", null) != null) {
        this.time_unit_code = _.get(init, "time_unit_code", "");
      }
      if (_.get(init, "time_unit_name", null) != null) {
        this.time_unit_name = _.get(init, "time_unit_name", "");
      }
      if (_.get(init, "diluent", null) != null) {
        this.diluent = parseFloat(_.get(init, "diluent", 0).toString());
      }
      if (_.get(init, "diluent_unit", null) != null) {
        this.diluent_unit = _.get(init, "diluent_unit", "");
      }
      if (_.get(init, "concentration", null) != null) {
        this.concentration = parseFloat(
          _.get(init, "concentration", 0).toString()
        );
      }
      if (_.get(init, "concentration_unit", null) != null) {
        this.concentration_unit = _.get(init, "concentration_unit", "");
      }
      if (_.get(init, "concentration_final", null) != null) {
        this.concentration_final = parseFloat(
          _.get(init, "concentration_final", 0).toString()
        );
      }
      if (_.get(init, "concentration_final_unit", null) != null) {
        this.concentration_final_unit = _.get(
          init,
          "concentration_final_unit",
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
      /* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */
    }
  }
}

export class PatientorderForAlarmsWithoutOrder extends BaseV2 {
  patient_order_id: number = 0;
  patient_medication_id: number = 0;
  constructor(init?: Partial<PatientorderForAlarmsWithoutOrder>) {
    super(init);
    if (init) {
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
    }
  }
}

export class PatientorderCriteriaForAlarmsWithoutOrder extends PatientOrderModel {
  device_serial_id: string = "";
  constructor(init?: Partial<PatientorderCriteriaForAlarmsWithoutOrder>) {
    super(init);
    if (init) {
      if (_.get(init, "device_serial_id", null) != null) {
        this.device_serial_id = _.get(init, "device_serial_id", "");
      }
    }
  }
}
