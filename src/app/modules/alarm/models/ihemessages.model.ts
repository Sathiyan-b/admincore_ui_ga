import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
export class IHEMessagesModel extends BaseV2 {
	id: number = 0;
	sending_app: string = "";
	sending_facility: string = "";
	receiving_app: string = "";
	receiving_facility: string = "";
	msg_received_on: Date = new Date();
	msg_type: string = "";
	msg_trg_event: string = "";
	msg_control_id: string = "";
	msg_version: string = "";
	msg_content: string = "";
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date();
	modified_on: Date = new Date();
	is_active: boolean = true;
	is_suspended: boolean = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";
	
	constructor(init?: Partial<IHEMessagesModel>) {
		super(init);
		if (init) {
		
			if (_.get(init, "id", null) != null) {
				this.id = parseInt(_.get(init, "id", 0).toString());
			}
			if (_.get(init, "sending_app", null) != null) {
				this.sending_app = _.get(init, "sending_app", "");
			}
			if (_.get(init, "sending_facility", null) != null) {
				this.sending_facility = _.get(init, "sending_facility", "");
			}
			if (_.get(init, "receiving_app", null) != null) {
				this.receiving_app = _.get(init, "receiving_app", "");
			}
			if (_.get(init, "receiving_facility", null) != null) {
				this.receiving_facility = _.get(init, "receiving_facility", "");
			}
			if (_.get(init, "msg_received_on", null) != null) {
				if (typeof init?.msg_received_on == "string") {
					this.msg_received_on = new Date(init.msg_received_on);
				} else {
					this.msg_received_on = init?.msg_received_on!;
				}
			} else {
				this.msg_received_on = new Date();
			}
			if (_.get(init, "msg_type", null) != null) {
				this.msg_type = _.get(init, "msg_type", "");
			}
			if (_.get(init, "msg_trg_event", null) != null) {
				this.msg_trg_event = _.get(init, "msg_trg_event", "");
			}
			if (_.get(init, "msg_control_id", null) != null) {
				this.msg_control_id = _.get(init, "msg_control_id", "");
			}
			if (_.get(init, "msg_version", null) != null) {
				this.msg_version = _.get(init, "msg_version", "");
			}
			if (_.get(init, "msg_content", null) != null) {
				this.msg_content = _.get(init, "msg_content", "");
			}
			//
			if (_.get(init, "created_by", null) != null) {
				this.created_by = parseInt(
					_.get(init, "created_by", "0").toString()
				);
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
				this.modified_by = parseInt(
					_.get(init, "modified_by", "0").toString()
				);
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
			if (_.get(init, "is_active", null) != null) {
				this.is_active = _.get(init, "is_active", false);
			}
			if (_.get(init, "is_suspended", null) != null) {
				this.is_suspended = _.get(init, "is_suspended", false);
			}
			if (_.get(init, "notes", null) != null) {
				this.notes = _.get(init, "notes", "");
			}
		}
	}
}


