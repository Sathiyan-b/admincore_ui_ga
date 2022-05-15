import { Base } from "../../global/models/base.model";
export class UserRoleProfiles extends Base {
  id: number = 0;
  user_id: number = 0;
  roleprofile_id: number = 0;
  app_id: number = 0;
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  valid_from: Date = new Date();
  valid_to: Date | null = null;
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = false;
  lang_code: string = "";
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}
export class UserRoleProfilesWrapper extends UserRoleProfiles {}
