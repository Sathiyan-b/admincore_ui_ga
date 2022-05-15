import { DB, using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
// import { EnterpriseService } from "./enterprise.service";
// import { LocationService } from "./location.service";
// import { EnterpriseModel } from "../models/enterprise.model";
// import { LocationModel } from "../models/location.model";
import {
  Pointofcare,
  PointofcareUserModel,
  PointofcareModelCreteria,
  PointofcareEscalation
} from "../models/pointofcare.model";
import { PointofCareEscalationService } from "./pointofcareescalation.service";
import {
  PointofCareEscalation,
  PointofCareEscalationWrapper
} from "../models/pointofcareescalation.model";
import { PointofCareSubscribersService } from "./pointofcaresubscribers.service";
import { PointofCareSubscribers } from "../models/pointofcaresubscribers.model";
import { ActionRes } from "../../global/models/actionres.model";
import axios, { AxiosRequestConfig } from "axios";
import { ActionReq } from "../../global/models/actionreq.model";

export class PointofcareService extends BaseService {
  sql_get_pointofcare: string = `
  SELECT poc.id,
  poc.ent_hierarchy_parent_id,
  poc.identifier,
	poc.display_text,
    poc.purpose,
    poc.created_by,
    poc.modified_by,
    poc.created_on,
    poc.modified_on,
    poc.is_active,
    poc.lang_code,
    poc.is_suspended,
    poc.parent_id,
    poc.is_factory,
    poc.notes,
    poc.overlap_duration,
    poc.overlap_duration_uom_id,
    poc.allow_subscriber,
    poc.app_id,
    poce.escalated_to_type_id,
    poce.escalated_to_id,
    poce.escalation_duration,
    poce.escalation_duration_uom,
	  rv2.identifier as duration_unit_uom_value,
    poce.escalation_level escalation_level_id,
    eut.id escalated_userteamid,
    eut.display_text escalation_userteam_name,
    eu.id escalation_user_id,
    eu.first_name escalation_user_f_name,
    eu.middle_name escalation_user_m_name,
    eu.last_name escalation_user_l_name,
    su.id subscriber_id,
    su.first_name subscriber_f_name,
    su.middle_name subscriber_m_name,
    su.last_name subscriber_l_name,
	  rv.display_text as type_name
FROM pointofcare poc
left join pointofcareescalation poce on poce.poc_id = poc.id
left join Teams eut on eut.id = poce.escalated_to_id and poce.escalated_to_type_id = (SELECT id from ReferenceValues where identifier='TEAM')
left join users eu on eu.id = poce.escalated_to_id and poce.escalated_to_type_id = (SELECT id from ReferenceValues where identifier='USER')
left join pointofcaresubscribers pocs on pocs.poc_id = poc.id
left join users su on su.id = pocs.subscriber_id
left join ReferenceValues rv on rv.id = poce.escalated_to_type_id
left join ReferenceValues rv2 on rv2.id = poce.escalation_duration_uom @condition`;

  // sql_get_all_pointofcare: string = `SELECT pc.id, poc_name, poc_purpose,
  // case when pc.created_on is null then '' else TO_CHAR(pc.created_on::date, 'mm/dd/yyyy') end created_on,
  // case when pc.modified_on is null then '' else TO_CHAR(pc.modified_on::date, 'mm/dd/yyyy') end modified_on,
  // enterprise, location,pt.escalation_attribute,pu.users_attribute,pc.is_active from pointofcare pc
  // left join pointofcareteams pt ON pc.id=pt.poc_id AND pt.is_active = true
  // left join pointofcareusers pu ON pc.id=pu.poc_id AND pu.is_active = true
  //  `;

  sql_insert_pointofcare: string = `
	INSERT INTO pointofcare
	(
    ent_hierarchy_parent_id,
		display_text,
		purpose,
		created_by,
		modified_by,
		created_on,
		modified_on,
		is_active,
		lang_code,
		is_suspended,
		parent_id,
		is_factory,
		overlap_duration,
		overlap_duration_uom_id,
		allow_subscriber,
		app_id
	)
	VALUES (@ent_hierarchy_parent_id, @display_text, @purpose, @created_by, @modified_by, @created_on, @modified_on, @is_active, @lang_code, @is_suspended, @parent_id, @is_factory, @overlap_duration, @overlap_duration_uom_id, @allow_subscriber, @app_id)
	RETURNING *
	`;

  sql_update_pointofcare: string = `
	UPDATE pointofcare
	SET 
    display_text=@display_text,
		purpose=@purpose,
		allow_subscriber=@allow_subscriber,
		modified_by=@modified_by,
		modified_on=@modified_on,
		is_active=@is_active,
		lang_code=@lang_code,
		is_suspended=@is_suspended,
		parent_id=@parent_id,
		is_factory=@is_factory,
		notes=@notes,
		app_id=@app_id
	WHERE id = @id
	RETURNING *
	`;
  sql_get_map_data: string = `
	SELECT PointOfCare.display_text, PointOfCare.identifier, PointOfCare.purpose, PointOfCare.ent_hierarchy_parent_id, PointOfCare.map_data  from PointOfCare
	WHERE id = @id
	RETURNING *
	`;

  sql_update_map_data: string = `
	UPDATE pointofcare
	SET 
    map_data = @map_data
	WHERE id = @id
	RETURNING *
	`;

  sql_delete_pointofcare: string = `
		update pointofcare set
			is_active = @is_active
		where id = @id RETURNING *
	`;
  sql_getuserpointofcarelist: string = `
  with userteam_list as (
	select *, (member ->> 'id') :: int member_id from			  
		(
			select *,  
			json_array_elements(members_attribute) as member
			from userteam
		) ut
	),
	pointofcare_list_with_first_escalation as (
		select (escalation_attribute -> 0 ->> 'id') :: int as member_id, (escalation_attribute -> 0 ->> 'type') :: varchar as member_type, *
		from pointofcare
	),
	pointofcare_list_with_subscribers as (
		select *, (subscriber ->> 'id') :: int member_id, 'USER' as member_type 
		from			  
			(
				select *,  
				json_array_elements(users_attribute) as subscriber
				from pointofcare
			) pc
	),
	combined_pointofcare_list as (
		select id, poc_name, member_id, member_type from pointofcare_list_with_first_escalation
		union
		select id, poc_name, member_id, member_type from pointofcare_list_with_subscribers
	),
	user_pointofcare_list as (
		select * from 
		combined_pointofcare_list
		where 
			(member_id in (select id from userteam_list where member_id = @member_id ) and member_type = 'TEAM') or ( member_id = @member_id and member_type = 'USER')
	)
	select * from user_pointofcare_list;
  `;
  sql_getpointofcareforuser: string = `
  with user_pointofcare_list as (
    select poc_id, subscriber_id userid, isnull(is_user_subscribed, 0) as is_user_subscribed from PointofCareSubscribers
    where subscriber_id = @member_id
    union all
    select distinct PointofCareEscalation.poc_id ,PointofCareEscalation.escalated_to_id userid, 0 as is_user_subscribed 
    from ReferenceTypes
    inner join ReferenceValues on ReferenceValues.ref_type_id = ReferenceTypes.id
    inner join PointofCareEscalation on PointofCareEscalation.escalated_to_type_id = ReferenceValues.id
    inner join Users on Users.id = PointofCareEscalation.escalated_to_id
    where  ReferenceTypes.identifier = 'POC_ESC_TO_TYPE' and ReferenceValues.identifier = 'USER'
    and PointofCareEscalation.escalated_to_id = @member_id
    union all
    select distinct PointofCareEscalation.poc_id,TeamMembers.member_id, 0 as is_user_subscribed
    from ReferenceTypes
    inner join ReferenceValues on ReferenceValues.ref_type_id = ReferenceTypes.id
    inner join PointofCareEscalation on PointofCareEscalation.escalated_to_type_id = ReferenceValues.id
    inner join Teams on Teams.id = PointofCareEscalation.escalated_to_id
    inner join TeamMembers on TeamMembers.team_id = Teams.id
    where  ReferenceTypes.identifier = 'POC_ESC_TO_TYPE' and ReferenceValues.identifier = 'TEAM'
    and TeamMembers.member_id = @member_id
    )
    --select * from user_pointofcare_list
    select distinct upoc.poc_id, poc.identifier, poc.display_text, is_user_subscribed
    from user_pointofcare_list upoc inner join PointofCare poc
    on upoc.poc_id = poc.id
	`;
  sql_getpocforsubscription = `
	with userteam_list as (
		select *, (member ->> 'id') :: int member_id from			  
			(
				select *,  
				json_array_elements(members_attribute) as member
				from userteam
			) ut
	),
	pointofcare_list_with_first_escalation as (
		select (escalation_attribute -> 0 ->> 'id') :: int as member_id, (escalation_attribute -> 0 ->> 'type') :: varchar as member_type, *
		from pointofcare
	),
	pointofcare_list_with_subscribers as (
		select *, (subscriber ->> 'id') :: int member_id, 'USER' as member_type 
		from			  
			(
				select *,  
				json_array_elements(users_attribute) as subscriber
				from pointofcare
			) pc
	),
	combined_pointofcare_list as (
		select id, poc_name, member_id, member_type from pointofcare_list_with_first_escalation
		union
		select id, poc_name, member_id, member_type from pointofcare_list_with_subscribers
	),
	user_pointofcare_list as (
		select * from 
		combined_pointofcare_list
		where 
			(member_id in (select id from userteam_list where member_id = $1 ) and member_type = 'TEAM') or ( member_id = $1 and member_type = 'USER')
	)
	
	select poc.*
	from pointofcare poc
	where id not in ( select id from user_pointofcare_list)
	and allow_subscriber = true
	`;

  async deleteinbulk(_req: Array<Pointofcare>): Promise<Array<Pointofcare>> {
    let result: Array<Pointofcare> = new Array<Pointofcare>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          for (var i = 0, length = _req.length; i < length; i++) {
            const { id } = _req[i];

            var isactive: boolean = true;
            var temp = _req[i].is_active;
            isactive = temp == true ? false : true;
            console.log(temp);
            console.log(isactive);

            const rows = await db.executeQuery(this.sql_delete_pointofcare, {
              id,
              is_active: isactive,
            });
            if (rows.length > 0) {
              result.push(_req[i]);
            }
          }
          await db.commitTransaction();
        } catch (e) {
          await db.rollbackTransaction();
          throw e;
        }
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }

  public async save(_req: Pointofcare): Promise<Pointofcare> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          await this.updateTransaction(_req, db);
          let pointofcareescalation_service =
            new PointofCareEscalationService();
          if (
            _req.escalation_attribute &&
            _req.escalation_attribute.length > 0
          ) {
            for (let i = 0; i < _req.escalation_attribute.length; i++) {
              let item = _req.escalation_attribute[i];
              let pointofcareescalation_req =
                new PointofCareEscalationWrapper();
              pointofcareescalation_req.poc_id = _req.id;
              pointofcareescalation_req.escalation_level = item.level;
              pointofcareescalation_req.escalation_duration = item.duration;
              pointofcareescalation_req.escalation_duration_uom =
                item.duration_unit_uom;
              pointofcareescalation_req.escalated_to_type = item.type;
              // (pointofcareescalation_req.escalated_to_type = item.type),
              pointofcareescalation_req.escalated_to_type_id = item.id;
              pointofcareescalation_req.escalated_to_id = item.id;
              pointofcareescalation_req.app_id = _req.app_id;
              await pointofcareescalation_service.insertTransaction(
                db,
                pointofcareescalation_req
              );
            }
          }
          let pointofcaresubscriber_service =
            new PointofCareSubscribersService();
          if (_req.users_attribute && _req.users_attribute.length > 0) {
            for (let i = 0; i < _req.users_attribute.length; i++) {
              let item = _req.users_attribute[i];
              let poinofcaresubscriber_req = new PointofCareSubscribers();
              poinofcaresubscriber_req.poc_id = _req.id;
              poinofcaresubscriber_req.subscriber_id = item.id;
              poinofcaresubscriber_req.app_id = _req.app_id;
              await pointofcaresubscriber_service.insertTransaction(
                db,
                poinofcaresubscriber_req
              );
            }
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

  // async saveTransaction(
  //   _req: Pointofcare,
  //   db: DB
  // ): Promise<Pointofcare> {
  //   try {
  //     const {
  //       ent_hierarchy_parent_id,
  //       display_text,
  //       purpose,
  //       created_by,
  //       modified_by,
  //       created_on,
  //       modified_on,
  //       version,
  //       is_active,
  //       is_suspended,
  //       parent_id,
  //       is_factory,
  //       overlap_duration,
  //       overlap_duration_uom_id,
  //       allow_subscriber,
  //       app_id,
  //     } = _req;

  //     const rows = await db.executeQuery(this.sql_insert_pointofcare, [
  //       ent_hierarchy_parent_id,
  //       display_text,
  //       purpose,
  //       created_by,
  //       modified_by,
  //       new Date(),
  //       new Date(),
  //       1,
  //       true,
  //       is_suspended,
  //       parent_id,
  //       is_factory,
  //       overlap_duration,
  //       overlap_duration_uom_id,
  //       allow_subscriber,
  //       app_id,
  //     ]);
  //     if (rows.length > 0) {
  //       let row = rows[0];
  //       _req.id = row.id != null ? parseInt(row.id) : 0;
  //     }
  //   } catch (transaction_error) {
  //     var error = transaction_error
  //     throw transaction_error;
  //   }
  //   return _req;
  // }
  async getpointofcare(
    _req: Pointofcare = new Pointofcare()
  ): Promise<Array<PointofcareModelCreteria>> {
    let result: Array<PointofcareModelCreteria> = new Array<
      PointofcareModelCreteria
    >();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        var qb = new this.utils.QueryBuilder(this.sql_get_pointofcare);
        var condition_list: Array<string> = [];
        // qb.addParameter("poc.is_active", _req.is_active, "=");
        // if (_req.id != 0) {
        //   qb.addParameter("poc.id", _req.id, "=");
        // }
        if (
          _req.display_text != undefined &&
          _req.display_text != null &&
          _req.display_text.length != 0
        ) {
          qb.addParameter("poc.display_text", _req.display_text, "=");
        }
        if (
          _req.identifier != undefined &&
          _req.identifier != null &&
          _req.identifier.length != 0
        ) {
          qb.addParameter("poc.identifier", _req.identifier, "=");
        }

        var query_string = qb.getQuery();
        if (_req.id != 0) {
          condition_list.push(`poc.id = '${_req.id}'`);
        }
        if (_req.is_active != null && _req.is_active != undefined) {
          condition_list.push(`poc.is_active = '${_req.is_active}'`);
        }
        if (condition_list.length > 0) {
          query_string = query_string.replace(
            /@condition/g,
            `WHERE ${condition_list.join(" and ")}`
          );
        } else {
          query_string = query_string.replace(/@condition/g, "");
        }
        const rows = await db.executeQuery(query_string);
        _.forEach(rows, (row, k) => {
          let pointofcare_id = row.id != null ? parseInt(row.id) : 0;
          let index = _.findIndex(result, (v) => {
            return v.id == pointofcare_id;
          });
          let is_new = index == -1;
          let pointofcare_temp: PointofcareModelCreteria;
          if (is_new) {
            pointofcare_temp = new PointofcareModelCreteria();
            pointofcare_temp.id = row.id != 0 ? parseInt(row.id) : 0;
            pointofcare_temp.ent_hierarchy_parent_id =
              row.ent_hierarchy_parent_id != 0
                ? parseInt(row.ent_hierarchy_parent_id)
                : 0;
            pointofcare_temp.identifier =
              row != null && row.identifier != "" ? row.identifier : "";   
            pointofcare_temp.display_text =
              row != null && row.display_text != "" ? row.display_text : "";

            pointofcare_temp.purpose =
              row != null && row.purpose != "" ? row.purpose : "";
            pointofcare_temp.created_by = row.created_by;
            pointofcare_temp.modified_by = row.modified_by;
            pointofcare_temp.created_on =
              row != null && row.created_on != "" ? row.created_on : "";
            pointofcare_temp.modified_on =
              row != null && row.modified_on != "" ? row.modified_on : "";
            pointofcare_temp.is_active = row.is_active;
            pointofcare_temp.lang_code =
              row != null && row.lang_code != "" ? row.lang_code : "";
            pointofcare_temp.is_suspended = row.is_suspended;
            pointofcare_temp.parent_id =
              row.parent_id != 0 ? parseInt(row.parent_id) : 0;
            pointofcare_temp.is_factory = row.is_factory;
            pointofcare_temp.notes =
              row != null && row.notes != "" ? row.notes : "";
            pointofcare_temp.overlap_duration =
              row.overlap_duration != 0 ? parseInt(row.overlap_duration) : 0;
            pointofcare_temp.overlap_duration_uom_id =
              row.overlap_duration_uom_id != 0
                ? parseInt(row.overlap_duration_uom_id)
                : 0;
            pointofcare_temp.allow_subscriber = row.allow_subscriber;
            pointofcare_temp.app_id =
              row.app_id != 0 ? parseInt(row.app_id) : 0;

            pointofcare_temp.escalation_attribute = [];
            pointofcare_temp.users_attribute = [];
          } else {
            pointofcare_temp = result[index];
          }

          let escalated_to_type = row.escalated_to_type;
          let escalated_type_name = row.type_name;
          let escalated_name =
            row.escalation_user_f_name != null
              ? row.escalation_user_f_name
              : row.escalation_userteam_name;
          let escalated_m_name =
            row.escalation_user_m_name != null
              ? row.escalation_user_m_name
              : row.escalation_userteam_name;
          let escalated_l_name =
            row.escalation_user_l_name != null
              ? row.escalation_user_l_name
              : row.escalation_userteam_name;
          let escalated_to_id =
            row.escalated_to_id != null ? parseInt(row.escalated_to_id) : 0;
          let escalation_index = _.findIndex(
            pointofcare_temp.escalation_attribute,
            (v) => {
              return v.id == escalated_to_id && v.type == escalated_type_name;
            }
          );
          let is_new_escalation = escalation_index == -1;
          if (escalated_to_id > 0 && is_new_escalation == true) {
            let escalation_temp = new PointofcareEscalation();
            escalation_temp.id = escalated_to_id;
            escalation_temp.name = escalated_name;
            escalation_temp.mname = escalated_m_name;
            escalation_temp.lname = escalated_l_name;
            escalation_temp.type = escalated_type_name;
            // escalation_temp.level = row.escalation_level_id
            //   ? parseInt(row.escalation_level_id)
            //   : 0;
            escalation_temp.duration = row.escalation_duration
              ? parseInt(row.escalation_duration)
              : 0;
              escalation_temp.duration_unit_uom = row.escalation_duration_uom
              ? parseInt(row.escalation_duration_uom)
              : 0;
                escalation_temp.duration_unit_uom_value =
              row.duration_unit_uom_value != null
                ? row.duration_unit_uom_value
                : "";
            switch (escalation_temp.type) {
              case PointofcareEscalation.TYPE.user:
                escalation_temp.name = row.escalation_user_f_name;
                break;
              case PointofcareEscalation.TYPE.team:
                escalation_temp.name = row.escalation_userteam_name;
                break;
              default:
                break;
            }
            pointofcare_temp.escalation_attribute.push(escalation_temp);
          }

          let subscriber_id =
            row.subscriber_id != null ? parseInt(row.subscriber_id) : 0;
          let subscriber_index = _.findIndex(
            pointofcare_temp.users_attribute,
            (v) => {
              return v.id == subscriber_id;
            }
          );
          let is_new_subscriber = subscriber_index == -1;
          if (subscriber_id > 0 && is_new_subscriber == true) {
            let subscriber_temp = new PointofcareUserModel();
            subscriber_temp.id = subscriber_id;
            subscriber_temp.user_first_name = row.subscriber_f_name;
            subscriber_temp.user_middle_name = row.subscriber_m_name;
            subscriber_temp.user_last_name = row.subscriber_l_name;
            pointofcare_temp.users_attribute.push(subscriber_temp);
          }

          if (is_new) {
            result.push(pointofcare_temp);
          } else {
            result[index] = pointofcare_temp;
          }
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  public async update(
    _req: PointofcareModelCreteria
  ): Promise<PointofcareModelCreteria> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          await this.updateTransaction(_req, db);
          let pointofcareescalation_service =
            new PointofCareEscalationService();
          let pointofcareescalation_delete_req = new PointofCareEscalation();
          pointofcareescalation_delete_req.poc_id = _req.id;
          await pointofcareescalation_service.deleteTransaction(
            db,
            pointofcareescalation_delete_req
          );
          if (
            _req.escalation_attribute &&
            _req.escalation_attribute.length > 0
          ) {
            for (let i = 0; i < _req.escalation_attribute.length; i++) {
              let item = _req.escalation_attribute[i];
              let poinofcareescalation_req = new PointofCareEscalation();
              poinofcareescalation_req.poc_id = _req.id;
              // poinofcareescalation_req.level_id = item.level;
              poinofcareescalation_req.escalation_duration = item.duration;
              poinofcareescalation_req.escalation_duration_uom =
                item.duration_unit_uom;
              poinofcareescalation_req.escalated_to_type = item.type;
              poinofcareescalation_req.escalated_to_type_id = item.id;
              poinofcareescalation_req.escalated_to_id = item.id;
              poinofcareescalation_req.app_id = _req.app_id;
              await pointofcareescalation_service.insertTransaction(
                db,
                poinofcareescalation_req
              );
            }
          }
          let pointofcaresubscriber_service =
            new PointofCareSubscribersService();
          let pointofcaresubscriber_delete_req = new PointofCareSubscribers();
          pointofcaresubscriber_delete_req.poc_id = _req.id;
          await pointofcaresubscriber_service.deleteTransaction(
            db,
            pointofcaresubscriber_delete_req
          );
          if (_req.users_attribute && _req.users_attribute.length > 0) {
            for (let i = 0; i < _req.users_attribute.length; i++) {
              let item = _req.users_attribute[i];
              let poinofcaresubscriber_req = new PointofCareSubscribers();
              poinofcaresubscriber_req.poc_id = _req.id;
              poinofcaresubscriber_req.subscriber_id = item.id;
              poinofcaresubscriber_req.app_id = _req.app_id;
              poinofcaresubscriber_req.is_user_subscribed =
                _req.is_user_subscribed;
              await pointofcaresubscriber_service.insertTransaction(
                db,
                poinofcaresubscriber_req
              );
            }
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
  async updateTransaction(_req: Pointofcare, db: DB): Promise<Pointofcare> {
    try {
      const rows = await db.executeQuery(this.sql_update_pointofcare, {
        id: _req.id,
        display_text: _req.display_text,
        purpose: _req.purpose,
        allow_subscriber: _req.allow_subscriber,
        modified_by: _req.modified_by,
        modified_on: new Date(),
        version: _req.version,
        is_active: _req.is_active,
        lang_code: _req.lang_code,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
        app_id: _req.app_id,
      });
      // if (rows.length > 0) {
      //   let row = rows[0];
      //   _req.id = row.id != null ? parseInt(row.id) : 0;
      // }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return _req;
  }
  async unSubscribe(_req: PointofcareModelCreteria) {
    var result: PointofcareModelCreteria = new PointofcareModelCreteria();
    try {
      var pointofcare_list: Array<PointofcareModelCreteria> = await this.getpointofcare(
        _req
      );
      if (pointofcare_list.length == 0) {
        throw new ErrorResponse({
          message: "Point of Care not found"
        });
      }
      var pointofcare: PointofcareModelCreteria = pointofcare_list[0];
      pointofcare.users_attribute = _.filter(pointofcare.users_attribute, v => {
        return v.id != this.user_context.user!.id;
      });
      pointofcare.allow_subscriber = _req.allow_subscriber;
      result = await this.update(pointofcare);
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getUserPointofcareList() {
    let result: Array<Pointofcare> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        let user_id: number = this.user_context.user!.id;

        const rows = await db.executeQuery(this.sql_getuserpointofcarelist, {
          user_id: user_id,
        });
        if (rows.length > 0) {
          _.forEach(rows, (v) => {
            let poc = new Pointofcare();
            poc.id = v.id != null ? parseInt(v.id) : 0;
            poc.display_text = v.poc_name;
            result.push(poc);
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getPointofcareForUser() {
    let result: Array<PointofcareModelCreteria> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        let user_id: number = _.get(this.user_context, "user.id", 0);

        const rows = await db.executeQuery(this.sql_getpointofcareforuser, {
          member_id: user_id,
        });
        if (rows.length > 0) {
          _.forEach(rows, (row) => {
            let pointofcare_temp = new PointofcareModelCreteria();
            pointofcare_temp.id = row.id != 0 ? parseInt(row.id) : 0;
            pointofcare_temp.identifier =
              row != null && row.identifier != "" ? row.identifier : "";
            pointofcare_temp.ent_hierarchy_parent_id =
              row.ent_hierarchy_parent_id != 0
                ? parseInt(row.ent_hierarchy_parent_id)
                : 0;
            pointofcare_temp.display_text =
              row != null && row.display_text != "" ? row.display_text : "";

            pointofcare_temp.purpose =
              row != null && row.purpose != "" ? row.purpose : "";
            pointofcare_temp.created_by = row.created_by;
            pointofcare_temp.modified_by = row.modified_by;
            pointofcare_temp.created_on =
              row != null && row.created_on != "" ? row.created_on : "";
            pointofcare_temp.modified_on =
              row != null && row.modified_on != "" ? row.modified_on : "";
            pointofcare_temp.is_active = row.is_active;
            pointofcare_temp.lang_code =
              row != null && row.lang_code != "" ? row.lang_code : "";
            pointofcare_temp.is_suspended = row.is_suspended;
            pointofcare_temp.parent_id =
              row.parent_id != 0 ? parseInt(row.parent_id) : 0;
            pointofcare_temp.is_factory = row.is_factory;
            pointofcare_temp.notes =
              row != null && row.notes != "" ? row.notes : "";
            pointofcare_temp.overlap_duration =
              row.overlap_duration != 0 ? parseInt(row.overlap_duration) : 0;
            pointofcare_temp.overlap_duration_uom_id =
              row.overlap_duration_uom_id != 0
                ? parseInt(row.overlap_duration_uom_id)
                : 0;
            pointofcare_temp.allow_subscriber = row.allow_subscriber;
            pointofcare_temp.app_id =
              row.app_id != 0 ? parseInt(row.app_id) : 0;
            pointofcare_temp.is_subscribed = row.is_subscribed;
            pointofcare_temp.is_user_subscribed =
              row.is_user_subscribed != null && row.is_user_subscribed == 1
                ? true
                : false;
            result.push(pointofcare_temp);
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async getPocForSubscription() {
    let result: Array<Pointofcare> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        let user_id: number = this.user_context.user!.id;

        const rows = await db.executeQuery(this.sql_getpocforsubscription, {
          user_id: user_id,
        });
        if (rows.length > 0) {
          _.forEach(rows, (v) => {
            let poc = new Pointofcare(v);
            result.push(poc);
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async getMapData(_req: Pointofcare): Promise<Array<Pointofcare>> {
    var result: Array<Pointofcare> = [];
    try {
      if (_req.id == 0) {
      }
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var rows = await db.executeQuery(this.sql_get_map_data, {
          id: _req.id,
        });
        _.forEach(rows, (row, k) => {
          row.map_data = JSON.stringify(row.map_data);
          var _req = new Pointofcare();
          _req.display_text =
            row != null && row.display_text != "" ? row.display_text : "";
          _req.identifier =
            row != null && row.identifier != "" ? row.identifier : "";
          _req.purpose = row != null && row.purpose != "" ? row.purpose : "";
          _req.ent_hierarchy_parent_id =
            row != null && row.ent_hierarchy_parent_id != 0
              ? row.ent_hierarchy_parent_id
              : 0;
          _req.map_data = row != null && row.map_data != "" ? row.map_data : "";

          result.push(_req);
        });
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async updateMapData(_req: Pointofcare): Promise<Pointofcare> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          await db.beginTransaction();
          const rows = await db.executeQuery(this.sql_update_map_data, {
            id: _req.id,
            map_data: _req.map_data,
          });
          // if (rows.length > 0) {
          //   let row = rows[0];
          //   _req.id = row.id != null ? parseInt(row.id) : 0;
          // }
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
  async getPoinofCare(): Promise<Array<Pointofcare>> {
    let result: Array<Pointofcare> = new Array<Pointofcare>();
    try {
      let config: AxiosRequestConfig = {
        headers: {
          Authorization: this.user_context.token,
        },
      };
      let url =
        this.environment.AUTH_SERVER_URL + this.environment.POC_SERVER_ENDPOINT;

      try {
        var resp = await axios.get<ActionRes<Array<Pointofcare>>>(url, config);
        if (resp.data) {
          result = _.get(resp.data, "item", []);
        }
      } catch (error) {
        let e: any = _.get(error, "response.data");
        let err = new ErrorResponse<Pointofcare>();
        err.success = e.success;
        err.code = e.code;
        err.message = e.message;
        err.item = null;
        throw err;
      }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
  async getpoinofCare(_req: Pointofcare): Promise<Array<Pointofcare>> {
    let result: Array<Pointofcare> = new Array<Pointofcare>();
    try {
      let config: AxiosRequestConfig = {
        headers: {
          // Authorization: this.user_context.token
        },
      };
      let url =
        this.environment.AUTH_SERVER_URL +
        this.environment.POC_SERVER_GET_ENDPOINT;
      let post_data: ActionReq<Pointofcare> = new ActionReq<Pointofcare>();
      post_data.item = _req;

      try {
        var resp = await axios.post<ActionRes<Array<Pointofcare>>>(
          url,
          post_data,
          config
        );
        if (resp.data) {
          result = _.get(resp.data, "item", []);
        }
      } catch (error) {
        let e: any = _.get(error, "response.data");
        let err = new ErrorResponse<Pointofcare>();
        err.success = e.success;
        err.code = e.code;
        err.message = e.message;
        err.item = null;
        throw err;
      }
    } catch (transaction_error) {
      throw transaction_error;
    }
    return result;
  }
}

export default PointofcareService;
