import { Base } from "../../global/models/base.model";
export class UserSessions extends Base {
  id: number = 0;
  access_token: string = "";
  access_token_valid_till: Date = new Date(9999, 11, 31, 23, 59, 59);
  refresh_token: string = "";
  user_id: number = 0;
  start_time: Date = new Date(9999, 11, 31, 23, 59, 59);
  end_time: Date = new Date(9999, 11, 31, 23, 59, 59);
  last_active: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_expired: boolean = false;
  killed_by: number = 0;
  push_notification_token: string = "";
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean = false;
  app_id: number = 0;
}
export class UserSessionsWrapper extends UserSessions {}
