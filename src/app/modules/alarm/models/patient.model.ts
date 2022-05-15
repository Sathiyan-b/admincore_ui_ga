import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";

export class PatientModel extends BaseV2 {
	id: number = 0;
	ihe_msg_id: number = 0;
	family_name: string = "";
	given_name: string = "";
	full_name: string = "";
	name_type: string = "";
	patient_id: string = "";
	patient_id_type: string = "";
	patient_id_authority: string = "";
	date_of_birth: Date = new Date();
	gender: string = "";
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

	constructor(init?: Partial<PatientModel>) {
		super(init);
		if (init) {
			if (_.get(init, "id", null) != null) { this.id = parseInt(_.get(init, "id", 0).toString()); }			
			if (_.get(init, "ihe_msg_id", null) != null) { this.ihe_msg_id = parseInt(_.get(init, "ihe_msg_id", 0).toString()); }			
			if (_.get(init, "family_name", null) != null) { this.family_name = _.get(init, "family_name", ""); }
			if (_.get(init, "given_name", null) != null) { this.given_name = _.get(init, "given_name", ""); }
			if (_.get(init, "full_name", null) != null) { this.full_name = _.get(init, "full_name", ""); }
			if (_.get(init, "name_type", null) != null) { this.name_type = _.get(init, "name_type", ""); }
			if (_.get(init, "patient_id", null) != null) { this.patient_id = _.get(init, "patient_id", ""); }
			if (_.get(init, "patient_id_type", null) != null) { this.patient_id_type = _.get(init, "patient_id_type", ""); }
			if (_.get(init, "patient_id_authority", null) != null) { this.patient_id_authority = _.get(init, "patient_id_authority", ""); }
			if (_.get(init, "date_of_birth", null) != null) {
				if (typeof init?.date_of_birth == "string") {
					this.date_of_birth = new Date(init.date_of_birth);
				} else {
					this.date_of_birth = init?.date_of_birth!;
				}
			} else {
				this.date_of_birth = new Date();
			}
			if (_.get(init, "gender", null) != null) { this.gender = _.get(init, "gender", ""); }
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
			if (_.get(init, "key", null) != null) { this.key = _.get(init, "key", ""); }
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
			if (_.get(init, "is_active", null) != null) {this.is_active = _.get(init, "is_active", false)};
			/* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */
		}
	}
}
