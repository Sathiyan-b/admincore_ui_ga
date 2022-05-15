import { Base } from "../../global/models/base.model";
import { Users } from "./users.model";
export class GuardianUserSessions extends Base {
  id: number = 0;
  user_id: number = 0;
  access_token?: string;
  access_token_valid_till: Date = new Date();
  refresh_token: string="";
  start_time: Date = new Date();
  end_time: Date = new Date();
  last_active: Date = new Date();
  is_expired: boolean = false;
  killed_by: number = 0;
  push_notification_token: string = "";
  app_id: number = 0;
  user_info: Users | string = new Users();
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = false;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}
export class GuardianUserSessionsWrapper extends GuardianUserSessions {}
