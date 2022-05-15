import { Base } from "../../global/models/base.model";
import * as _ from "lodash";

export class PasswordPolicy extends Base {
	id: number = 0;
	min_length: number = 6;
	max_length: number = 15;
	repeat_old_password_restriction: number = 5;
	password_change_frequency: number = 180;
	failed_login_attempts_allowed: number = 5;
	enforce_password_change: boolean = false;
	can_allow_uppercase: boolean = false;
	min_uppercase_reqd: boolean = false;
	can_allow_lowercase: boolean = false;
	min_lowercase_reqd: boolean = false;
	can_allow_numerals: boolean = false;
	min_numerals_reqd: boolean = false;
	can_allow_special_characters: boolean = false;
	min_special_characters_reqd: boolean = false;
	can_start_with_numeric: boolean = false;
	can_start_with_special_character: boolean = false;
	enterprise: any = [];
	location: any = [];
	app_id:number=0;
		
	//
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
	modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
	is_active: boolean | null = true;
	version: number = 1;
	lang_code: string = "en-GB";
	is_suspended: boolean | null = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";
	//
}
export default PasswordPolicy