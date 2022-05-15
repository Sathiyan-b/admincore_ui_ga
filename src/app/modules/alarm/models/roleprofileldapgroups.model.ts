import { Base } from "../../global/models/base.model";
  export class RoleProfileLDAPGroups extends Base{
    id:number = 0;
roleprofile_id:number = 0
app_id:number = 0
ldap_groups:string = "";
enterprise_id:number = 0
ent_location_id:number = 0
created_on:Date = new Date(9999, 11, 31, 23, 59, 59);
created_by:number = 0
modified_on:Date = new Date(9999, 11, 31, 23, 59, 59);
modified_by:number = 0
is_active:boolean = false;
version:number = 0
is_factory:boolean = false;
  }
  export class RoleProfileLDAPGroupsWrapper extends RoleProfileLDAPGroups{
  
  }
  