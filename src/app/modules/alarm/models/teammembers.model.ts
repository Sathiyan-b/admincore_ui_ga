import { Base } from "../../global/models/base.model";
  export class TeamMembers extends Base{
    id:number = 0;
team_id:number = 0
member_id:number = 0
valid_from:string = "";
valid_to:number = 0
can_accept_reject:boolean = false;
created_on:Date = new Date(9999, 11, 31, 23, 59, 59);
created_by:number = 0
modified_on:Date = new Date(9999, 11, 31, 23, 59, 59);
modified_by:number = 0
is_active:boolean = false;
version:number = 0
is_factory:boolean = false;
app_id:number = 0
member_action_id:number=0
  }
  export class TeamMembersWrapper extends TeamMembers{
  }
  