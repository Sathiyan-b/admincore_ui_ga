import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";

export class AlarmActorsModel extends BaseV2 {
	id: number = 0;
	alarm_id: number = 0;
	user_id: number = 0;
	role_profile_id: number = 0;
	user_team_id: number = 0;
	poc_id: number = 0;
	action_start: Date = new Date();
	action_end: Date = new Date();
	action_response: string = "";
	action_on: Date = new Date();
	is_readonly: boolean = false;

	lang_code: string = "";
	is_suspended: boolean = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date();
	modified_on: Date = new Date();
	is_active: boolean = true;
	version: number = 1;

	constructor(init?: Partial<AlarmActorsModel>) {
		super(init);
		if (init) {
			if (typeof init.id == "number") {
				this.id = init.id;
			}
			if (typeof init.alarm_id == "number") {
				this.alarm_id = init.alarm_id;
			}
			if (typeof init.user_id == "number") {
				this.user_id = init.user_id;
			}
			if (typeof init.role_profile_id == "number") {
				this.role_profile_id = init.role_profile_id;
			}
			if (typeof init.user_team_id == "number") {
				this.user_team_id = init.user_team_id;
			}
			if (typeof init.poc_id == "number") {
				this.poc_id = init.poc_id;
			}
			if (typeof init.parent_id == "number") {
				this.parent_id = init.parent_id;
			}
			if (typeof init.created_by == "number") {
				this.created_by = init.created_by;
			}
			if (typeof init.modified_by == "number") {
				this.modified_by = init.modified_by;
			}
			if (typeof init.version == "number") {
				this.version = init.version;
			}

			if (typeof init.action_response == "string") {
				this.action_response = init.action_response;
			}
			if (typeof init.lang_code == "string") {
				this.lang_code = init.lang_code;
			}
			if (typeof init.notes == "string") {
				this.notes = init.notes;
			}
			if (typeof init.is_readonly == "boolean") {
				this.is_readonly = init.is_readonly;
			}
			if (typeof init.is_suspended == "boolean") {
				this.is_suspended = init.is_suspended;
			}
			if (typeof init.is_factory == "boolean") {
				this.is_factory = init.is_factory;
			}

			if (typeof init.is_active == "boolean") {
				this.is_active = init.is_active;
			}
			//
			if (_.get(init, "action_start", null) != null) {
				if (typeof init?.action_start == "string") {
					this.action_start = new Date(init.action_start);
				} else {
					this.action_start = init?.action_start!;
				}
			} else {
				this.action_start = new Date();
			}
			if (_.get(init, "action_end", null) != null) {
				if (typeof init?.action_end == "string") {
					this.action_end = new Date(init.action_end);
				} else {
					this.action_end = init?.action_end!;
				}
			} else {
				this.action_end = new Date();
			}
			if (_.get(init, "action_on", null) != null) {
				if (typeof init?.action_on == "string") {
					this.action_on = new Date(init.action_on);
				} else {
					this.action_on = init?.action_on!;
				}
			} else {
				this.action_on = new Date();
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

			if (_.get(init, "modified_on", null) != null) {
				if (typeof init?.modified_on == "string") {
					this.modified_on = new Date(init.modified_on);
				} else {
					this.modified_on = init?.modified_on!;
				}
			} else {
				this.modified_on = new Date();
			}
		}
	}
}
export namespace AlarmActorsModel {
	export enum ACTION_RESPONSE {
		Accept = "A",
		Reject = "R",
		Excalate = "E",
		New = "N",
	}
}
