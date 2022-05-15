import { Base } from "../../global/models/base.model";
import * as _ from "lodash";
import { Users, UsersWrapper } from "./users.model";
import { PrivilegesWrapper } from "./privileges.model";
import { GuardianUserSessionsWrapper } from "./guardianusersessions.model";
import { UserSessions } from "./usersessions.model";

export class Auth extends Base {
  login: string = "";
  password: string = "";
  token: string = "";
  user: Users = new Users();
  app_key: string = "";
  refresh_token: string = "";
  push_notification_token?: string;
  session_id: number | null = null;
  permission_map_list: Array<PrivilegesWrapper> = [];
  session: UserSessions | null = null;
}
