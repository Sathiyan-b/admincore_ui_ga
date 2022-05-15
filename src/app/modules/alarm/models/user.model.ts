import { Base, BaseV2 } from "../../global/models/base.model";
import * as _ from "lodash";
import { PrivilegeModel } from "./privilege.model";

export class UserModel extends BaseV2 {
	id: number = 0;
	f_name: string = "";
	m_name: string = "";
	l_name: string = "";
	initials: string = "";
	mobile_number: string = "";
	email: string = "";
	email_as_login_id: boolean = false;
	login: string = "";
	password: string = "";
	roleprofile: any = []; // to store all the roles assigned in comma separated format
	enterprise_id: number = 0;
	location_id: number = 0;
	enterprise: any = [];
	location: any = [];
	user_type: number = 0;
	active_directory_dn: string ="";
	otp : string = "";
	//
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date();
	modified_on: Date = new Date();
	is_active: boolean | null = true;
	version: number = 1;
	lang_code: string = "en-GB";
	is_suspended: boolean | null = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";
	//
	privileges?: Array<PrivilegeModel>;

	user_image_id: number = 0;
	last_password_change: Date = new Date();
	force_password_change: boolean = false;
	login_attemps: number = 0;
	old_password: string = "";
	pre_password: string = "";

	constructor(init?: Partial<UserModel>) {
		super(init);
		if (init) {
			if(_.has(init,"privileges")){
				this.privileges = [];
				_.forEach(init.privileges,(v)=>{
					this.privileges?.push(new PrivilegeModel(v))
				})
			}
			if (_.get(init, "user_type", null) != null) {
				this.user_type = parseInt(
					_.get(init, "user_type", 0).toString()
				);
			}
			if (_.get(init, "id", null) != null) {
				this.id = parseInt(_.get(init, "id", 0).toString());
			}
			if (_.get(init, "otp", null) != null) {
				this.otp = _.get(init, "otp", "");
			}
			if (_.get(init, "f_name", null) != null) {
				this.f_name = _.get(init, "f_name", "");
			}
			if (_.get(init, "m_name", null) != null) {
				this.m_name = _.get(init, "m_name", "");
			}
			if (_.get(init, "l_name", null) != null) {
				this.l_name = _.get(init, "l_name", "");
			}
			if (_.get(init, "initials", null) != null) {
				this.initials = _.get(init, "initials", "");
			}
			if (_.get(init, "mobile_number", null) != null) {
				this.mobile_number = _.get(init, "mobile_number", "");
			}
			if (_.get(init, "email", null) != null) {
				this.email = _.get(init, "email", "");
			}
			if (_.get(init, "email_as_login_id", null) != null) {
				this.email_as_login_id = _.get(
					init,
					"email_as_login_id",
					false
				);
			}
			if (_.get(init, "login", null) != null) {
				this.login = _.get(init, "login", "");
			}
			if (_.get(init, "password", null) != null) {
				this.password = _.get(init, "password", "");
			}
			if (_.get(init, "roleprofile", null) != null) {
				try {
					if (typeof init!.roleprofile == "string") {
						this.roleprofile = JSON.parse(init!.roleprofile);
					} else {
						this.roleprofile = init!.roleprofile;
					}
				} catch (error) {
					this.roleprofile = {};
				}
			}
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
			if (_.get(init, "created_by", null) != null) {
				this.created_by = parseInt(init.created_by!.toString());
			}
			//
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
			if (_.get(init, "is_active", null) != null) {
				this.is_active = _.get(init, "is_active", false);
			}
			if (_.get(init, "is_suspended", null) != null) {
				this.is_suspended = _.get(init, "is_suspended", false);
			}
			if (_.get(init, "is_factory", null) != null) {
				this.is_factory = _.get(init, "is_factory", false);
			}
			if (_.get(init, "notes", null) != null) {
				this.notes = _.get(init, "notes", "");
			}
			if (_.get(init, "active_directory_dn", null) != null) {
				this.active_directory_dn = _.get(
					init,
					"active_directory_dn",
					""
				);
			}
			/* _.mapKeys(this, (v, k) => {
				if (_.get(init, k, null) != null) {
					_.set(this, k, _.get(init, k, null));
				}
			}); */

			if (_.get(init, "force_password_change", null) != null) {
				this.force_password_change = _.get(
					init,
					"force_password_change",
					false
				);
			}
			if (_.get(init, "login_attemps", null) != null) {
				this.login_attemps = parseInt(_.get(init, "login_attemps", 0).toString());
			}

			if (_.get(init, "user_image_id", null) != null) {
				this.user_image_id = parseInt(_.get(init, "user_image_id", 0).toString());
			}

			if (_.get(init, "last_password_change", null) != null) {
				if (typeof init?.last_password_change == "string") {
					this.last_password_change = new Date(init.last_password_change);
				} else {
					this.last_password_change = init?.last_password_change!;
				}
			} else {
				this.last_password_change = new Date();
			}

			if (_.get(init, "old_password", null) != null) {
				this.old_password = _.get(init, "old_password", "");
			}
			if (_.get(init, "pre_password", null) != null) {
				this.pre_password = _.get(init, "pre_password", "");
			}

			
		}
	}
}
