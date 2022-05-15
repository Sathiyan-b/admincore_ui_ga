import * as _ from "lodash";
import { Base } from "../../global/models/base.model";
export class UserTeam extends Base {
  id: number = 0;
  identifier: string = "";
  display_text: string = "";
  team_purpose: string = "";
  start_time: string = "";
  end_time: string = "";
  app_id: number = 0;
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  lang_code: string = "en-GB";
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean | null = true;
  is_suspended: boolean | null= false;
  parent_id: number = 0;
  is_factory: boolean | null = false;
  notes: string = "";

  members_attribute: Array<UserTeamMemberModel> = [];
}

export class UserTeamMemberModel {
  id: number = 0;
  user_first_name: string = "";
  user_middle_name: string = "";
  user_last_name: string = "";
  role: string = UserTeamMemberModel.ROLE.read_only;
  member_action_id:number = 0
  can_accept_reject: boolean = false;
}
export namespace UserTeamMemberModel {
  export enum ROLE {
    read_only = "READONLY",
    Accept_and_reject = "ACCEPTREJECT",
  }
}
