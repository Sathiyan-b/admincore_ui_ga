import { DB, using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { UserTeamMemberModel, UserTeam } from "../models/userteam.model";
import { TeamMembersService } from "./teammembers.service";
import { TeamMembers, TeamMembersWrapper } from "../models/teammembers.model";
import { walkUpBindingElementsAndPatterns } from "typescript";
import { username } from "../../global/utils/username";
import { Pointofcare, PointofcareEscalation } from "../models/pointofcare.model";

export class UserTeamService extends BaseService {
  sql_get_userteam: string = `SELECT teams.id, teams.display_text, teams.team_purpose, teams.start_time, teams.end_time, teams.created_on, 
	teams.modified_on, 
	teams.app_id from teams where is_active = true`;

  sql_userteam_validator: string = `SELECT teams.id, teams.display_text, teams.team_purpose, teams.start_time, teams.end_time, teams.created_on, 
	teams.modified_on, teams.is_active,
	teams.app_id from teams @condition`;

  sql_get_all_userteam: string = `SELECT teams.id,
  teams.identifier,
  teams.display_text,
  teams.team_purpose,
  teams.start_time,
  teams.end_time,
  teams.app_id,
  teams.enterprise_id,
  teams.ent_location_id,
  teams.created_on,
  teams.modified_on,
  teams.created_by,
  teams.modified_by,
  teams.is_active,
  users.id member_id,
  users.first_name user_f_name,
  users.middle_name user_m_name,
  users.last_name user_l_name,
  teammembers.member_action_id,
  ReferenceValues.identifier member_action_displaytext
  from teams 
  left join teammembers on teammembers.team_id = teams.id and TeamMembers.is_active =1
  left join users on users.id = teammembers.member_id and users.is_active =1
  left join ReferenceValues on ReferenceValues.id =  teammembers.member_action_id @condition`;

  sql_insert_userteam: string = `insert into Teams (
  teams.identifier,
  teams.display_text,
  teams.team_purpose,
  teams.start_time,
  teams.end_time,
  teams.app_id,
  teams.enterprise_id,
  teams.ent_location_id,
  teams.lang_code,
  teams.created_by,
  teams.modified_by,
  teams.created_on,
  teams.modified_on,
  teams.is_active,
  teams.is_suspended,
  teams.parent_id,
  teams.is_factory,
  teams.notes
  ) 
		values (@identifier, @display_text, @team_purpose, @start_time, @end_time, @app_id, @enterprise_id, @ent_location_id, @lang_code, @created_by, @modified_by, @created_on, @modified_on, @is_active, @is_suspended, @parent_id, @is_factory, @notes) RETURNING *`;

  sql_update_userteam: string = `update teams set identifier = @identifier,
  display_text = @display_text,
  team_purpose = @team_purpose,
  start_time = @start_time,
  end_time = @end_time,
  app_id = @app_id,
  enterprise_id = @enterprise_id,
  ent_location_id = @ent_location_id,
  lang_code = @lang_code,
  created_by = @created_by,
  modified_by = @modified_by,
  created_on = @created_on,
  modified_on = @modified_on,
  is_active = @is_active,
  is_suspended = @is_suspended,
  parent_id = @parent_id,
  is_factory = @is_factory,
  notes = @notes
	where id = @id RETURNING *`;

  // sql_delete_userteam: string = `
	// 	update Teams set
	// 		is_active = @is_active
	// 	where id = @id RETURNING *
	// `;
  sql_delete_userteam: string = `
	update PointofCareEscalation set is_active = @is_active where escalated_to_id = @id and escalated_to_type_id = (select id from ReferenceValues where identifier = 'TEAM')
  update teams set is_active = @is_active output inserted .* where id = @id 
  RETURNING *`;

  /* unknown table */
  sql_getuserteamforuser: string = `
	select Teams.id,Teams.identifier,Teams.display_text,Teams.team_purpose, Teams.start_time, Teams.end_time,
	Teams.app_id, Teams.enterprise_id , Teams.ent_location_id, Teams.is_active, Teams.is_suspended,
	Teams.parent_id, Teams.is_factory, Teams.notes
  from Teams left join TeamMembers on Teams.id=TeamMembers.team_id where TeamMembers.member_id = @member_id
  and TeamMembers.is_active = 1 and Teams.is_active = 1
	`;

  sql_getActivePOC: string = `select PointofCareEscalation.poc_id, PointofCare.identifier from PointofCareEscalation left join PointofCare on PointofCare.id = PointofCareEscalation.poc_id where escalated_to_type_id = (select id from ReferenceValues where identifier = 'TEAM') and poc_id in (select poc_id from PointofCareEscalation where escalated_to_type_id = (select id from ReferenceValues where identifier = 'TEAM') and escalated_to_id = @user_team_id ) `;

  async getAllUserTeam(
    _userteam: UserTeam = new UserTeam()
  ): Promise<Array<UserTeam>> {
    let result: Array<UserTeam> = new Array<UserTeam>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        var query: string = this.sql_get_all_userteam;
        var condition_list: Array<string> = [];
        if (_userteam.is_active != null) {
          condition_list.push(`teams.is_active = ${_userteam.is_active}`);
        }
        if (_userteam.id != 0) {
          condition_list.push(`teams.id = ${_userteam.id}`);
        }
        if (condition_list.length > 0) {
          query = query.replace(
            /@condition/g,
            `WHERE ${condition_list.join(" and ")}`
          );
        } else {
          query = query.replace(/@condition/g, "");
        }

        const rows = await db.executeQuery(query);
        _.forEach(rows, (row: any, k: any) => {
          let userteam_id = row.id != null ? parseInt(row.id) : 0;
          let index = _.findIndex(result, (v) => {
            return v.id == userteam_id;
          });
          let is_new = index == -1;
          let userteam_temp: UserTeam;
          if (is_new) {
            userteam_temp = new UserTeam();
            userteam_temp.id = row.id != 0 ? parseInt(row.id) : 0;
            userteam_temp.identifier =
              row != null && row.identifier != "" ? row.identifier : "";
            userteam_temp.team_purpose =
              row != null && row.team_purpose != "" ? row.team_purpose : "";
            userteam_temp.display_text =
              row != null && row.display_text != "" ? row.display_text : "";
            userteam_temp.start_time = row.start_time;
            userteam_temp.end_time = row.end_time;
            userteam_temp.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
            userteam_temp.enterprise_id =
              row.enterprise_id != 0 ? parseInt(row.enterprise_id) : 0;
            userteam_temp.ent_location_id =
              row.ent_location_id != 0 ? parseInt(row.ent_location_id) : 0;
            userteam_temp.created_on =
              row != null && row.created_on != "" ? row.created_on : "";
            userteam_temp.modified_on =
              row != null && row.modified_on != "" ? row.modified_on : "";
            userteam_temp.created_by =
              row.created_by != 0 ? parseInt(row.created_by) : 0;
            userteam_temp.modified_by =
              row.modified_by != 0 ? parseInt(row.modified_by) : 0;
            userteam_temp.is_active = row.is_active;

            // userteam_temp.members_attribute = [];
          } else {
            userteam_temp = result[index];
          }

          let member = new UserTeamMemberModel();
          member.id = row.member_id != null ? parseInt(row.member_id) : 0;
          member.member_action_id =
            row.member_action_id != null ? parseInt(row.member_action_id) : 0;
          member.can_accept_reject = row.member_action_displaytext==UserTeamMemberModel.ROLE.Accept_and_reject;
          member.user_first_name = row.user_f_name;
          member.user_middle_name = row.user_m_name;
          member.user_last_name = row.user_l_name;
          member.role = row.member_action_displaytext !=null && row.member_action_displaytext.length!=0?row.member_action_displaytext:""

          if (member.id > 0) {
            userteam_temp.members_attribute.push(member);
          }

          if (is_new) {
            result.push(userteam_temp);
          } else {
            result[index] = userteam_temp;
          }
        });

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<UserTeam>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: null,
        exception: error.stack,
      });
    }
    return result;
  }

  async getUserTeam(
    _userteam: UserTeam = new UserTeam()
  ): Promise<Array<UserTeam>> {
    let result: Array<UserTeam> = new Array<UserTeam>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(this.sql_get_userteam);

        if (_userteam.display_text != "") {
          qb.addParameter("display_text", _userteam.display_text, "=");
        }
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(qb.getQuery());
        _.forEach(rows, (v, k) => {
          var roleprofile = new UserTeam();
          roleprofile.id = v.id != 0 ? parseInt(v.id) : 0;
          roleprofile.display_text =
            v != null && v.display_text != "" ? v.display_text : "";
          roleprofile.team_purpose =
            v != null && v.team_purpose != "" ? v.team_purpose : "";
          roleprofile.start_time = v.start_time;
          roleprofile.end_time = v.end_time;
          roleprofile.created_on =
            v != null && v.created_on != "" ? v.created_on : "";
          roleprofile.modified_on =
            v != null && v.modified_on != "" ? v.modified_on : "";
          roleprofile.app_id = v.id != 0 ? parseInt(v.id) : 0;
          result.push(roleprofile);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<UserTeam>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: null,
        exception: error.stack,
      });
    }
    return result;
  }
  public async insertUserTeam(_req: UserTeam): Promise<UserTeam> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          let get_userteam_req: UserTeam = new UserTeam();
          get_userteam_req.display_text = _req.display_text;
          get_userteam_req.is_active = null;
          get_userteam_req.is_factory = null;
          get_userteam_req.is_suspended = null;
          let user_list: Array<UserTeam> = await this.getUserTeam(
            get_userteam_req
          );
          if (user_list.length > 0) {
            let error = new ErrorResponse();
            error.message = `Team name '${_req.display_text}' already exists.`;
            throw error;
          }
          await this.insertUserTeamTransaction(_req, db);
          let userteammembers_service = new TeamMembersService();
          for (let i = 0; i < _req.members_attribute.length; i++) {
            let item = _req.members_attribute[i];
            let userteammembers_req = new TeamMembersWrapper();
            userteammembers_req.team_id = _req.id;
            userteammembers_req.member_action_id = item.member_action_id;
            userteammembers_req.member_id = item.id;
            (userteammembers_req.app_id = _req.app_id),
              (userteammembers_req.can_accept_reject = item.can_accept_reject);
            await userteammembers_service.insertTransaction(
              db,
              userteammembers_req
            );
          }
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (e) {
      let error = e;
      throw error;
    }
    return _req;
  }
  async insertUserTeamTransaction(_req: UserTeam, db: DB): Promise<UserTeam> {
    try {
      const rows = await db.executeQuery(this.sql_insert_userteam, {
        identifier: _req.display_text.toUpperCase().replace(' ', '_'),
        display_text: _req.display_text,
        team_purpose: _req.team_purpose,
        start_time: _req.start_time,
        end_time: _req.end_time,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        lang_code: _req.lang_code,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<UserTeam>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }
  public async updateUserTeam(_req: UserTeam): Promise<UserTeam> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          let get_userteam_req: UserTeam = new UserTeam();
          // get_userteam_req.display_text = _req.display_text;
          // get_userteam_req.id = _req.id;
          // get_userteam_req.is_active = null;
          // get_userteam_req.is_factory = null;
          // get_userteam_req.is_suspended = null;
          // let user_list: Array<UserTeam> = await this.getUserTeam(
          //   get_userteam_req
          // );
          // if (user_list[0].display_text != _req.display_text) {
          //   let error = new ErrorResponse();
          //   error.message = `Team name '${_req.display_text}' already exists.`;
          //   throw error;
          // }
          await this.updateUserTeamTransaction(_req, db);
          let userteammembers_service = new TeamMembersService();
          let userteammember_delete_req = new TeamMembersWrapper();
          userteammember_delete_req.team_id = _req.id;
          await userteammembers_service.deleteTransaction(
            db,
            userteammember_delete_req
          );
          for (let i = 0; i < _req.members_attribute.length; i++) {
            let item = _req.members_attribute[i];
            let userteammembers_req = new TeamMembersWrapper();
            userteammembers_req.team_id = _req.id;
            userteammembers_req.member_action_id = item.member_action_id;
            userteammembers_req.member_id = item.id;
            (userteammembers_req.app_id = _req.app_id),
              (userteammembers_req.can_accept_reject = item.can_accept_reject);
            await userteammembers_service.insertTransaction(
              db,
              userteammembers_req
            );
          }
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (e) {
      let error = e;
      throw error;
    }
    return _req;
  }
  async updateUserTeamTransaction(_req: UserTeam, db: DB): Promise<UserTeam> {
    try {
      const rows = await db.executeQuery(this.sql_update_userteam, {
        id: _req.id,
        identifier: _req.identifier.toUpperCase().replace(' ', '_'),
        display_text: _req.display_text,
        team_purpose: _req.team_purpose,
        start_time: _req.start_time,
        end_time: _req.end_time,
        app_id: _req.app_id,
        enterprise_id: _req.enterprise_id,
        ent_location_id: _req.ent_location_id,
        lang_code: _req.lang_code,
        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: new Date(),
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
      });
      // if (rows.length > 0) {
      //   let row = rows[0];
      //   _req.id = row.id != null ? parseInt(row.id) : 0;
      // }
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<UserTeam>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _req,
        exception: error.stack,
      });
    }
    return _req;
  }

  async deleteinbulk(_user_list: Array<UserTeam>): Promise<Array<UserTeam>> {
    let result: Array<UserTeam> = new Array<UserTeam>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _user_list.length; i < length; i++) {
            const { id, is_active } = _user_list[i];
            if(is_active){
              let isExistOnPOC = await this.getActivePointofcare(_user_list[i]);
              if(isExistOnPOC.length > 0) {
                let errorString:Array<string> = [];
                isExistOnPOC.forEach(v=>{
                  errorString.push(v.identifier);
                })
                
                throw new ErrorResponse({
                  message: `This is the only Team associated with the Point of Care(s) '${errorString.toString().replace(",",", ")}'. The operation cannot be performed.`
                })
              } 
            }
            let tmp = is_active ? false : true;
            const rows = await db.executeQuery(this.sql_delete_userteam, {
              id: id,
              is_active: tmp,
            });
            if (rows.length > 0) {
              let temp = new UserTeam();
              temp.id = rows[0].id;
              temp.is_active = rows[0].is_active;
              result.push(temp);
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<UserTeam>({
        success: false,
        code: error.code,
        error: error.detail,
        message: error.message,
        item: _user_list,
        exception: error.stack,
      });
    }
    return result;
  }
  async getUserTeamForUser() {
    let result: Array<UserTeam> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        let user_id: number = this.user_context.user!.id;

        const rows = await db.executeQuery(this.sql_getuserteamforuser, {
          member_id: user_id,
        });
        if (rows.length > 0) {
          _.forEach(rows, (row) => {
            let userteam_temp = new UserTeam();
            userteam_temp = new UserTeam();
            userteam_temp.id = row.id != 0 ? parseInt(row.id) : 0;
            userteam_temp.identifier =
              row != null && row.identifier != "" ? row.identifier : "";
            userteam_temp.team_purpose =
              row != null && row.team_purpose != "" ? row.team_purpose : "";
            userteam_temp.display_text =
              row != null && row.display_text != "" ? row.display_text : "";
            userteam_temp.start_time = row.start_time;
            userteam_temp.end_time = row.end_time;
            userteam_temp.app_id = row.app_id != 0 ? parseInt(row.app_id) : 0;
            userteam_temp.enterprise_id =
              row.enterprise_id != 0 ? parseInt(row.enterprise_id) : 0;
            userteam_temp.ent_location_id =
              row.ent_location_id != 0 ? parseInt(row.ent_location_id) : 0;
            userteam_temp.created_on =
              row != null && row.created_on != "" ? row.created_on : "";
            userteam_temp.modified_on =
              row != null && row.modified_on != "" ? row.modified_on : "";
            userteam_temp.created_by =
              row.created_by != 0 ? parseInt(row.created_by) : 0;
            userteam_temp.modified_by =
              row.modified_by != 0 ? parseInt(row.modified_by) : 0;
            userteam_temp.is_active = row.is_active;
            result.push(userteam_temp);
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async UserTeamValidator(_req: UserTeam): Promise<Array<UserTeam>> {
    var result: Array<UserTeam> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.UserTeamValidatorTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async UserTeamValidatorTransaction(
    db: DB,
    _req: UserTeam,
    is_dto: boolean = true
  ): Promise<Array<UserTeam>> {
    var result: Array<UserTeam> = [];
    try {
      var query: string = this.sql_userteam_validator;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`teams.id != ${_req.id}`);
      }
      if (_req.display_text && _req.display_text.length > 0) {
        condition_list.push(`teams.display_text = '${_req.display_text}'`);
      }
      if (condition_list.length > 0) {
        query = query.replace(
          /@condition/g,
          `WHERE ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace(/@condition/g, "");
      }
      var rows = await db.executeQuery(query);
      _.forEach(rows, (v, k) => {
        var roleprofile = new UserTeam();
        roleprofile.id = v.id != 0 ? parseInt(v.id) : 0;
        roleprofile.display_text =
          v != null && v.display_text != "" ? v.display_text : "";
        roleprofile.team_purpose =
          v != null && v.team_purpose != "" ? v.team_purpose : "";
        roleprofile.start_time = v.start_time;
        roleprofile.end_time = v.end_time;
        roleprofile.created_on =
          v != null && v.created_on != "" ? v.created_on : "";
        roleprofile.is_active =
          v != null && v.is_active != "" ? v.is_active : "";
        roleprofile.modified_on =
          v != null && v.modified_on != "" ? v.modified_on : "";
        roleprofile.app_id = v.id != 0 ? parseInt(v.id) : 0;
        result.push(roleprofile);
      });
    } catch (error) {
      var e = error;
      throw error;
    }
    return result;
  }
  public async getActivePointofcare(_req: UserTeam) {
    // var result: boolean = false;
    var result: Array<Pointofcare> = new Array<Pointofcare>();
    let arr = new Array<Pointofcare>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_getActivePOC,{
          user_team_id: _req.id
        });
        if(rows.length > 0)  {
          let temp = 0;
          rows.forEach(v=>{
            if(v.poc_id != temp){
              arr.push(v);
              temp = v.poc_id;
            }
            else {
              result.push(v)
            }
          })
          // _.forEach(rows, (v,k)=>{
          //   let temp = new Pointofcare();
          //   temp.id = v.poc_id;
          //   temp.identifier = v.identifier;
          //   if(!arr.includes(temp)) {
          //     arr.push(temp);
          //   } 
          //   else{
          //     result.push(temp)
          //   }
          // })
          // arr = _.filter(arr,(v,k)=>{
          //   return !result.includes(v);
          // })
        }
      });
    } catch (error) {
      throw error;
    }
    return arr;
  }
}

export default UserTeamService;
