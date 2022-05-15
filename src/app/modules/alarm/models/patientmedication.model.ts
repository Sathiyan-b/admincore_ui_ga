import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
import { PatientModel } from "./patient.model";
import { PatientVisitModel } from "./patientvisit.model";
import { DeviceModel } from "./device.model";


export class PatientMedicationCustomModel extends BaseV2 {
	id: number = 0;
	patient_order_id: number = 0;
	device_id: number = 0;
	device_name: string = "";
	device_type: string = "";
	device_serial_id: string = "";
	message_time: Date = new Date();
	drug_code: string = "";
	drug_name: string = "";
	constructor(init?: Partial<PatientMedicationCustomModel>) {
		super(init);
		if (init) {
			if (_.get(init, "id", null) != null) {
				this.id = parseInt(_.get(init, "id", 0).toString());
			}
			if (_.get(init, "patient_order_id", null) != null) {
				this.patient_order_id = parseInt(
					_.get(init, "patient_order_id", 0).toString()
				);
			}
			if (_.get(init, "device_id", null) != null) {
				this.device_id = parseInt(
					_.get(init, "device_id", 0).toString()
				);
			}
			if (_.get(init, "device_name", null) != null) {
				this.device_name = _.get(init, "device_name", "");
			}
			if (_.get(init, "device_type", null) != null) {
				this.device_type = _.get(init, "device_type", "");
			}
			if (_.get(init, "device_serial_id", null) != null) {
				this.device_serial_id = _.get(init, "device_serial_id", "");
			}
			if (_.get(init, "sent_on", null) != null) {
				if (typeof init?.message_time == "string") {
					this.message_time = new Date(init.message_time);
				} else {
					this.message_time = init?.message_time!;
				}
			} else {
				this.message_time = new Date();
			}
			if (_.get(init, "drug_code", null) != null) {
				this.drug_code = _.get(init, "drug_code", "");
			}
			if (_.get(init, "drug_name", null) != null) {
				this.drug_name = _.get(init, "drug_name", "");
			}
		}
	}
}

export class PatientMedicationModel extends BaseV2 {
	id: number = 0;
	ihe_msg_id: number = 0;
	patient_id: number = 0;
	prescribed_on: Date = new Date();
	dispense_code: string = "";
	prescription_number: string = "";
	set_id: number = 0;
	drug_type: string = "";
	drug_code: string = "";
	drug_name: string = "";
	giveamount_max: number = 0;
	giveamount_unit_code: string = "";
	giveamount_unit_name: string = "";
	giveamount_unit_system: string = "";
	giveamount_unit_alternative_code: string = "";
	giveamount_unit_alternative_name: string = "";
	giveamount_unit_alternative_system: string = "";
	dosage_form: string = "";
	notes: string = "";
	giverate: number = 0;
	giverate_unit_code: string = "";
	giverate_unit_name: string = "";
	giverate_unit_system: string = "";
	giverate_unit_alternative_code: string = "";
	giverate_unit_alternative_name: string = "";
	giverate_unit_alternative_system: string = "";
	givedrug_strength: number = 0;
	givedrug_strength_unit_code: string = "";
	givedrug_strength_unit_name: string = "";
	givedrug_strength_unit_system: string = "";
	givedrug_strength_unit_alternative_code: string = "";
	givedrug_strength_unit_alternative_name: string = "";
	givedrug_strength_unit_alternative_system: string = "";
	route_id: string = "";
	route_text: string = "";
	route_system: string = "";
	body_site: string = "";
	device_name: string = "";
	device_text: string = "";
	device_system: string = "";
	method_id: string = "";
	method_text: string = "";
	method_system: string = "";
	giveamount_min: number = 0;
	patient_visit_id: number = 0;
	patient_order_id: number = 0;
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
	action_by_id: string = "";
	action_by_family_name: string = "";
	action_by_given_name: string = "";
	//
	enterprise: any = [];
	location: any = [];
	enterprise_id: number = 0;
	location_id: number = 0;
	device_id: number = 0;
	key: string = "";
	device_info: string = "";
	message_time: Date = new Date();
	//
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date();
	modified_on: Date = new Date();
	is_active: boolean = true;
	version: number = 1;

	constructor(init?: Partial<PatientMedicationModel>) {
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
				this.patient_id = parseInt(
					_.get(init, "patient_id", 0).toString()
				);
			}
			if (_.get(init, "prescribed_on", null) != null) {
				if (typeof init?.prescribed_on == "string") {
					this.prescribed_on = new Date(init.prescribed_on);
				} else {
					this.prescribed_on = init?.prescribed_on!;
				}
			} else {
				this.prescribed_on = new Date();
			}
			if (_.get(init, "dispense_code", null) != null) {
				this.dispense_code = _.get(init, "dispense_code", "");
			}
			if (_.get(init, "prescription_number", null) != null) {
				this.prescription_number = _.get(init, "prescription_number", "");
			}
			if (_.get(init, "set_id", null) != null) {
				this.set_id = parseInt(_.get(init, "set_id", 0).toString());
			}
			if (_.get(init, "drug_type", null) != null) {
				this.drug_type = _.get(init, "drug_type", "");
			}
			if (_.get(init, "drug_code", null) != null) {
				this.drug_code = _.get(init, "drug_code", "");
			}
			if (_.get(init, "drug_name", null) != null) {
				this.drug_name = _.get(init, "drug_name", "");
			}

			if (_.get(init, "giveamount_max", null) != null) {
				this.giveamount_max = parseInt(
					_.get(init, "giveamount_max", 0).toString()
				);
			}
			if (_.get(init, "giveamount_unit_code", null) != null) {
				this.giveamount_unit_code = _.get(
					init,
					"giveamount_unit_code",
					""
				);
			}
			if (_.get(init, "giverate_unit_name", null) != null) {
				this.giverate_unit_name = _.get(init, "giverate_unit_name", "");
			}
			if (_.get(init, "giveamount_unit_system", null) != null) {
				this.giveamount_unit_system = _.get(
					init,
					"giveamount_unit_system",
					""
				);
			}
			if (_.get(init, "giveamount_unit_alternative_code", null) != null) {
				this.giveamount_unit_alternative_code = _.get(
					init,
					"giveamount_unit_alternative_code",
					""
				);
			}
			if (_.get(init, "giveamount_unit_alternative_name", null) != null) {
				this.giveamount_unit_alternative_name = _.get(
					init,
					"giveamount_unit_alternative_name",
					""
				);
			}
			if (
				_.get(init, "giveamount_unit_alternative_system", null) != null
			) {
				this.giveamount_unit_alternative_system = _.get(
					init,
					"giveamount_unit_alternative_system",
					""
				);
			}
			if (_.get(init, "dosage_form", null) != null) {
				this.dosage_form = _.get(init, "dosage_form", "");
			}
			if (_.get(init, "notes", null) != null) {
				this.notes = _.get(init, "notes", "");
			}

			if (_.get(init, "giverate", null) != null) {
				this.giverate = parseInt(_.get(init, "giverate", 0).toString());
			}
			if (_.get(init, "giverate_unit_code", null) != null) {
				this.giverate_unit_code = _.get(init, "giverate_unit_code", "");
			}
			if (_.get(init, "giverate_unit_name", null) != null) {
				this.giverate_unit_name = _.get(init, "giverate_unit_name", "");
			}
			if (_.get(init, "giverate_unit_system", null) != null) {
				this.giverate_unit_system = _.get(
					init,
					"giverate_unit_system",
					""
				);
			}
			if (_.get(init, "giverate_unit_alternative_code", null) != null) {
				this.giverate_unit_alternative_code = _.get(
					init,
					"giverate_unit_alternative_code",
					""
				);
			}
			if (_.get(init, "giverate_unit_alternative_name", null) != null) {
				this.giverate_unit_alternative_name = _.get(
					init,
					"giverate_unit_alternative_name",
					""
				);
			}
			if (_.get(init, "giverate_unit_alternative_system", null) != null) {
				this.giverate_unit_alternative_system = _.get(
					init,
					"giverate_unit_alternative_system",
					""
				);
			}

			if (_.get(init, "givedrug_strength", null) != null) {
				this.givedrug_strength = parseInt(
					_.get(init, "givedrug_strength", 0).toString()
				);
			}
			if (_.get(init, "givedrug_strength_unit_code", null) != null) {
				this.givedrug_strength_unit_code = _.get(
					init,
					"givedrug_strength_unit_code",
					""
				);
			}
			if (_.get(init, "givedrug_strength_unit_name", null) != null) {
				this.givedrug_strength_unit_name = _.get(
					init,
					"givedrug_strength_unit_name",
					""
				);
			}
			if (_.get(init, "givedrug_strength_unit_system", null) != null) {
				this.givedrug_strength_unit_system = _.get(
					init,
					"givedrug_strength_unit_system",
					""
				);
			}
			if (
				_.get(init, "givedrug_strength_unit_alternative_code", null) !=
				null
			) {
				this.givedrug_strength_unit_alternative_code = _.get(
					init,
					"givedrug_strength_unit_alternative_code",
					""
				);
			}
			if (
				_.get(init, "givedrug_strength_unit_alternative_name", null) !=
				null
			) {
				this.givedrug_strength_unit_alternative_name = _.get(
					init,
					"givedrug_strength_unit_alternative_name",
					""
				);
			}
			if (
				_.get(
					init,
					"givedrug_strength_unit_alternative_system",
					null
				) != null
			) {
				this.givedrug_strength_unit_alternative_system = _.get(
					init,
					"givedrug_strength_unit_alternative_system",
					""
				);
			}

			if (_.get(init, "route_id", null) != null) {
				this.route_id = _.get(init, "route_id", "");
			}
			if (_.get(init, "route_text", null) != null) {
				this.route_text = _.get(init, "route_text", "");
			}
			if (_.get(init, "route_system", null) != null) {
				this.route_system = _.get(init, "route_system", "");
			}
			if (_.get(init, "body_site", null) != null) {
				this.body_site = _.get(init, "body_site", "");
			}
			if (_.get(init, "device_name", null) != null) {
				this.device_name = _.get(init, "device_name", "");
			}
			if (_.get(init, "device_text", null) != null) {
				this.device_text = _.get(init, "device_text", "");
			}
			if (_.get(init, "device_system", null) != null) {
				this.device_system = _.get(init, "device_system", "");
			}
			if (_.get(init, "method_id", null) != null) {
				this.method_id = _.get(init, "method_id", "");
			}
			if (_.get(init, "method_text", null) != null) {
				this.method_text = _.get(init, "method_text", "");
			}
			if (_.get(init, "method_system", null) != null) {
				this.method_system = _.get(init, "method_system", "");
			}

			if (_.get(init, "giveamount_min", null) != null) {
				this.giveamount_min = parseInt(
					_.get(init, "giveamount_min", 0).toString()
				);
			}
			if (_.get(init, "patient_order_id", null) != null) {
				this.patient_order_id = parseInt(
					_.get(init, "patient_order_id", 0).toString()
				);
			}
			if (_.get(init, "rate", null) != null) {
				this.rate = parseInt(_.get(init, "rate", 0).toString());
			}
			if (_.get(init, "dose", null) != null) {
				this.dose = parseInt(_.get(init, "dose", 0).toString());
			}
			if (_.get(init, "dose_limit", null) != null) {
				this.dose_limit = parseInt(
					_.get(init, "dose_limit", 0).toString()
				);
			}
			if (_.get(init, "strength", null) != null) {
				this.strength = parseInt(_.get(init, "strength", 0).toString());
			}
			if (_.get(init, "volume_tbi", null) != null) {
				this.volume_tbi = parseInt(
					_.get(init, "volume_tbi", 0).toString()
				);
			}
			if (_.get(init, "lockout", null) != null) {
				this.lockout = parseInt(_.get(init, "lockout", 0).toString());
			}
			if (_.get(init, "time_expected", null) != null) {
				this.time_expected = parseInt(
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
				this.strength_unit_system = _.get(
					init,
					"strength_unit_system",
					""
				);
			}
			if (_.get(init, "time_unit_code", null) != null) {
				this.time_unit_code = _.get(init, "time_unit_code", "");
			}
			if (_.get(init, "time_unit_name", null) != null) {
				this.time_unit_name = _.get(init, "time_unit_name", "");
			}
			//
			if (_.get(init, "action_by_id", null) != null) { this.action_by_id = _.get(init, "action_by_id", ""); }
			if (_.get(init, "action_by_family_name", null) != null) { this.action_by_family_name = _.get(init, "action_by_family_name", ""); }
			if (_.get(init, "action_by_given_name", null) != null) { this.action_by_given_name = _.get(init, "action_by_given_name", ""); }
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
			if (_.get(init, "device_info", null) != null) {
				this.device_info = _.get(init, "device_info", "");
			}
			if (_.get(init, "message_time", null) != null) {
				if (typeof init?.message_time == "string") {
					this.message_time = new Date(init.message_time);
				} else {
					this.message_time = init?.message_time!;
				}
			} else {
				this.message_time = new Date();
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

export class PatientMedicationModelCreteria extends PatientMedicationModel {
	patient: PatientModel = new PatientModel();
	patient_visit: PatientVisitModel = new PatientVisitModel();
	device: DeviceModel = new DeviceModel();
	has_alarm: boolean = false;
	constructor(init?: Partial<PatientMedicationModelCreteria>) {
		super(init);
		if (init) {
			if (init.patient != null) {
				this.patient = init.patient;
			}
			if (init.patient_visit != null) {
				this.patient_visit = init.patient_visit;
			}
			if (init.device != null) {
				this.device = init.device;
			}
			if (typeof init.has_alarm == "boolean") {
				this.has_alarm = init.has_alarm;
			}
		}
	}
}
