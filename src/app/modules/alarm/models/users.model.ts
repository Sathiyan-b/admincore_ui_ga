import { Base } from "../../global/models/base.model";
import { RoleProfiles, RoleProfilesWrapper } from "./roleprofiles.model";
import { Privileges, PrivilegesWrapper } from "./privileges.model";
export class Users extends Base {
  id: number = 0;
  dob: Date = new Date();
  user_name: string = "";
  first_name: string = "";
  middle_name: string = "";
  last_name: string = "";
  title_id: number = 0;
  gender_id: number = 0;
  user_type_id: number = 0;
  identifier_type_id: number = 0;
  identifier: string = "";
  phone_number: string = "";
  mobile_number: string = "";
  email: string = "";
  email_as_login_id: boolean = false;
  login: string = "";
  password: string = "";
  active_directory_dn: string = "";
  last_password_change: Date = new Date(9999, 11, 31, 23, 59, 59);
  force_password_change: boolean = false;
  login_attemps: number = 0;
  user_image_id: number = 0;
  app_id: number = 0;
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  lang_code: string = "";
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean | null = false;
  is_suspended: boolean | null= false;
  parent_id: number = 0;
  is_factory: boolean | null = false;
  notes: string = "";

  // Additional
  roleprofile: Array<RoleProfilesWrapper> = []; // to store all the roles assigned in comma separated format

  initials: string = "";
  location_id: number = 0;
  enterprise: any = [];
  location: any = [];
  otp: string = "";
  privileges?: Array<PrivilegesWrapper>;
  old_password: string = "";
  pre_password: string = "";
}
export class UsersWrapper extends Users {}

export namespace UsersWrapper {
  export enum UserType {
    LDAP = 1,
    NATIVE = 2,
  }
}
