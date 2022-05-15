import { Base } from "../../global/models/base.model";
import * as _ from "lodash";
export class Enterprise extends Base {
	id: number = 0;
	ent_type_id: string = "";
	identifier: string = "";
	short_name: string = "";
	display_text: string = "";
	is_master_org: boolean = false;
	image_id: number = 0;
	timezone_id: number = 0;
	is_point_of_care: boolean = false;
	lang_code: string = "en-GB";
	created_by: number = 0;
	modified_by: number = 0;
	created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
	modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
	is_active: boolean = true;
	version: number = 1;
	is_suspended: boolean = false;
	parent_id: number = 0;
	is_factory: boolean = false;
	notes: string = "";

}

export class EnterpriseAssociation extends Base {
	id: number = 0;
	code: string = "";
	display_text: string = "";
	
}

export class EnterpriseHierarchyListModel extends Base {
	eid: number = 0;
	enterprisename: string = "";
	pointofcare_id: number = 0;
	room_id: number = 0;
	bedid: number = 0;
	bedname: string = "";
	pocname: string = "";
	roomname: string = "";
}