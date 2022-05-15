import { Base } from "../../global/models/base.model";
export class AppSettings extends Base {
  name: string = "";
  dn: string = "";
  url: string = "";
  user_name: string = "";
  password: string = "";
}
export class AppSettingsWrapper extends AppSettings {}

export class AppSettingsModel extends Base {
  id: number = 0;
  auth_mode: string = ""; // LDAP or Native indicator
  ldap_config: any = [];
  active_directories: any = [];
  configuration: any = []; //all key-value set
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = true;
  version: number = 1;
  lang_code: string = "en-GB";
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
  enterprise_id: number = 0;
  location_id: number = 0;
}
