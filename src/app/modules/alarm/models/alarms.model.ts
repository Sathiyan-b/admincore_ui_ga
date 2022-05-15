import { Base } from "./base.model";

export class AlarmsModel extends Base {
    id: number = 0;
	identifier: string = "";
	alarm_desc: string = "";
	is_priority: boolean = false;
    created_by: number = 0;
    modified_by: number = 0;
    created_on: Date = new Date();
    modified_on: Date = new Date();
    is_active: boolean = true;
    is_suspended: boolean = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";
	rules: string = "";
}