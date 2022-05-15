import { Base } from "../../global/models/base.model";
import { PrivilegeAssociationModel } from "./privileges.model";
  export class RoleProfiles extends Base{
    id:number = 0;
identifier:string = "";
display_text:string = "";
purpose: string = "";
app_id:number = 0
enterprise_id:number = 0
ent_location_id:number = 0
created_by:number = 0
modified_by:number = 0
created_on:Date = new Date();
modified_on:Date = new Date();
is_active:boolean | null = false;
lang_code:string = "";
is_suspended:boolean | null = false;
parent_id:number = 0
is_factory:boolean | null = false;
notes:string = "";
ldap_config: any = [];
privileges: Array<PrivilegeAssociationModel> = [];
  }
  export class RoleProfilesWrapper extends RoleProfiles{
    id: number = 0;
    name: string = "";
    dn: string = "";
  
  }
  