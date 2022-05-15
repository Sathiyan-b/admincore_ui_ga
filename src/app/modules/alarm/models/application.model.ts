import * as _ from "lodash";
import { Base } from "../../global/models/base.model";

export class Application extends Base {
  id: number = 0;
  root_userid: number = 0;
  app_type_id: number = 0;
  auth_type_id: number = 0;
  identifier: string = "";
  display_text: string = "";
  email: string = "";
  mobile_number: string = "";
  purpose: string = "";
  is_licensed: boolean = false;
  license_key: string | null = "";
  license_info: string = "";
  app_logo_id: number = 0;
  lang_code: string = "en-GB";
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  created_by: number = 0;
  modified_by: number = 0;
  modified_on: Date | null = null;
  created_on: Date | null = null;
  is_active: boolean | null = true;
  is_suspended: boolean | null = false;
  parent_id: number = 0;
  is_factory: boolean | null = false;
  notes: string = "";
  app_key: string = "";
  success_callback: string = "";
  failure_callback: string = "";
  is_root_changed: boolean = false;

  root_username: string = "";
  root_password: string = "";
  root_user_role: string = "";

  // LDAP configuration
  ad_url: string = "";
  ad_baseDN: string = "";
  ad_username: string = "";
  ad_password: string = "";
}
export class ApplicationWrapper extends Application {
  security_mode_display_text: string = "";
}
