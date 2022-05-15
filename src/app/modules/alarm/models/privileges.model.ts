import { Base } from "../../global/models/base.model";
export class Privileges extends Base {
  id: number = 0;
  identifier: string = "";
  display_text: string = "";
  privilege_group_id: number = 0;
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = false;
  version: number = 0;
  lang_code: string = "";
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
  app_id: number = 0;
}
export class PrivilegesWrapper extends Privileges {
  privilege_group_display_text: string = "";
}

export class PrivilegeAssociationModel extends Base {
  id: number = 0;
  privilege_group_id: number = 0;
  privilege_key: string = "";
  display_text: string = "";
  privilege_group_display_text: string = "";
}
