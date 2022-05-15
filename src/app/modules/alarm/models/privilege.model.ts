import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
export class PrivilegeModel extends BaseV2 {
	id: number = 0;
	privilege_key: string="";
	display_text : string = "";
	privilege_group_id : string = "";
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date();
	modified_on: Date = new Date();
	is_active: boolean = true;
	version: number = 1;
	lang_code: string = "en-GB";
	is_suspended: boolean = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";
	
	constructor(init?: Partial<PrivilegeModel>) {
		super(init);
		if (init) {
			this.id = parseInt(_.get(init, "id", 0).toString());
			this.privilege_key = _.get(init, "privilege_key", "");
			this.display_text = _.get(init, "display_text", "");
			this.privilege_group_id = _.get(init, "privilege_group_id", "");
			//
			this.created_by = parseInt(_.get(init, "created_by", "0").toString());
			if (_.get(init, "created_on", null) != null) {
				if (typeof init?.created_on == "string") {
					this.created_on = new Date(init.created_on);
				} else {
					this.created_on = init?.created_on!;
				}
			} else {
				this.created_on = new Date();
			}
			this.modified_by = parseInt(_.get(init, "modified_by", "0").toString());
			if (_.get(init, "modified_on", null) != null) {
				if (typeof init?.modified_on == "string") {
					this.modified_on = new Date(init.modified_on);
				} else {
					this.modified_on = init?.modified_on!;
				}
			} else {
				this.modified_on = new Date();
			}
			if(_.get(init,"version",null) != null)
			this.version = parseInt(_.get(init, "version", "").toString());
			this.is_active = _.get(init, "is_active", false);
			this.is_suspended =  _.get(init, "is_suspended", false);
			this.notes = _.get(init, "notes", "");
			/* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */
		}
	}
}

export class PrivilegeExtnModel extends PrivilegeModel{
	privilege_group_display_text: string = "";
	constructor(init?: Partial<PrivilegeExtnModel>) {
		super(init);
		if (init) {
			this.privilege_group_display_text = _.get(init, "privilege_group_display_text", "");
		}
	}
}

export class PrivilegeAssociationModel extends BaseV2 {
	id: number = 0;
	privilege_group_id: number = 0;
	privilege_key: string="";
	display_text : string = "";
	privilege_group_display_text: string = "";
	constructor(init?: Partial<PrivilegeAssociationModel>) {
		super(init);
		if (init) {
			if (_.get(init, "id", null) != null) {
				this.id = parseInt(_.get(init, "id", 0).toString());
			}
			if (_.get(init, "privilege_group_id", null) != null) {
				this.privilege_group_id = parseInt(_.get(init, "privilege_group_id", 0).toString());
			}
			if (_.get(init, "privilege_key", null) != null) {
				this.privilege_key = _.get(init, "privilege_key", "");
			}
			if (_.get(init, "display_text", null) != null) {
				this.display_text = _.get(init, "display_text", "");
			}
			if (_.get(init, "privilege_group_display_text", null) != null) {
				this.privilege_group_display_text = _.get(init, "privilege_group_display_text", "");
			}
		}
	}
}


