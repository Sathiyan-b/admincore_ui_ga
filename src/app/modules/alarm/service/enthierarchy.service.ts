import { DB, using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import {
  EntHierarchyModel,
  EntHierarchyCriteria,
} from "../models/enthierarchy.model";

export class EntHierarchyService extends BaseService {
  sql_get_enterprise: string = `;WITH Ent_structure AS (
    SELECT a.id, rv.identifier as ent_type, a.identifier, a.short_name, a.display_text, a.is_master_org, a.is_point_of_care, a.parent_id
    FROM EnterpriseHierarchy a, ReferenceValues rv
    WHERE a.parent_id = 0 and a.ent_type_id = rv.id
    UNION ALL
    SELECT b.id, rv.identifier as ent_type, b.identifier, b.short_name, b.display_text, b.is_master_org, b.is_point_of_care, b.parent_id
    FROM EnterpriseHierarchy b INNER JOIN Ent_structure cte_table ON cte_table.id = b.parent_id
    INNER JOIN ReferenceValues rv ON b.ent_type_id = rv.id
    )
    SELECT * FROM Ent_structure order by id, parent_id option ( MaxRecursion 0 );`;
  
  sql_get_ward: string = `Declare @ward_id bigint, @ward_identifier varchar(50) = @identifier
  Select @ward_id = id from EnterpriseHierarchy where identifier = @ward_identifier
  select id,ent_hierarchy_parent_id parent_id, display_text,identifier  from PointofCare where ent_hierarchy_parent_id=@ward_id
  `;

  sql_get_children_hierarchy: string = `Declare @ward_id bigint, @ward_identifier varchar(50) = @identifier
  Select @ward_id = id from PointofCare where identifier = @ward_identifier
  drop table if exists #roomsandbeds
  create table #roomsandbeds
  (id smallint identity(1,1), identifier nvarchar(40), display_text nvarchar(200), entity_id smallint, entity_type nvarchar(50), entity_type_display_text nvarchar(50), parent_id smallint)
  declare @poc_rowid smallint, @room_rowid smallint, @bed_rowid smallint
  declare @room_count smallint, @start_room_id smallint, @end_room_id smallint, @bed_count smallint, @start_bed_id smallint, @end_bed_id smallint
  declare @room_counter smallint = 1, @bed_counter smallint = 1
  insert #roomsandbeds
  select a.identifier, a.display_text, a.id, 'W', 'WARD', 0
  FROM PointofCare a
  WHERE a.ent_hierarchy_parent_id = @ward_id
  select @poc_rowid = SCOPE_IDENTITY()
  select @room_count = count(r.id), @start_room_id = min(r.id), @end_room_id = max(r.id) from Rooms r, PointofCare poc where r.pointofcare_id = poc.id and poc.ent_hierarchy_parent_id = @ward_id
  set @room_counter = @start_room_id
  while (@room_counter <= @end_room_id)
  begin
    insert #roomsandbeds
    select r.identifier, r.display_text, r.id, 'R', 'ROOM', @poc_rowid
    FROM Rooms r, PointofCare poc
    WHERE r.id = @room_counter and poc.ent_hierarchy_parent_id = @ward_id and r.pointofcare_id = poc.id 
    select @room_rowid = SCOPE_IDENTITY()
    
    select @bed_count = count(b.id), @start_bed_id = min(b.id), @end_bed_id = max(b.id) 
    from Beds b, Rooms r, PointofCare poc where r.id = @room_counter and b.room_id = r.id and r.pointofcare_id = poc.id and poc.ent_hierarchy_parent_id = @ward_id
    set @bed_counter = @start_bed_id
  
    while (@bed_counter <= @end_bed_id)
    begin
      insert #roomsandbeds
      select b.identifier, b.display_text, b.id, 'BD', 'BED', @room_rowid
      FROM Beds b, Rooms r, PointofCare poc
      WHERE b.id = @bed_counter and b.room_id = r.id and r.pointofcare_id = poc.id and poc.ent_hierarchy_parent_id = @ward_id
      set @bed_counter = @bed_counter + 1
    end
  
    set @room_counter = @room_counter + 1
  end
  select * from #roomsandbeds`;

  // old queries

  sql_get_enterprisev1: string = `SELECT a.id, a.identifier, rv.display_text as ent_type, a.short_name, a.display_text, a.is_master_org, a.is_point_of_care, a.parent_id
  FROM EnterpriseHierarchy a, ReferenceValues rv
  WHERE a.parent_id = 0 and a.ent_type_id = rv.id`;

  sql_get_pointofcare: string = `select id, ent_hierarchy_parent_id as parent_id, identifier, purpose, display_text from PointofCare
  `;


  sql_get_wardv1: string = `select id,ent_hierarchy_parent_id parent_id, display_text,identifier  from PointofCare`;

  sql_get_children_hierarchyv1: string = `Declare @ward_id bigint, @ward_identifier varchar(50) = $1
  Select @ward_id = id from EnterpriseHierarchy where identifier = @ward_identifier
  
  ;WITH Ent_structure AS (
  SELECT a.id, rv.identifier as ent_type, a.identifier, a.short_name, a.display_text, a.is_master_org, a.is_point_of_care, a.parent_id
  FROM EnterpriseHierarchy a, ReferenceValues rv
  WHERE a.parent_id = @ward_id and a.ent_type_id = rv.id
  UNION ALL
  SELECT b.id, rv.identifier as ent_type, b.identifier, b.short_name, b.display_text, b.is_master_org, b.is_point_of_care, b.parent_id
  FROM EnterpriseHierarchy b INNER JOIN Ent_structure cte_table ON cte_table.id = b.parent_id
  INNER JOIN ReferenceValues rv ON b.ent_type_id = rv.id
  )
  Select @ward_id as id, rv.identifier as ent_type, @ward_identifier as identifier, ent_outer.short_name, ent_outer.display_text, ent_outer.is_master_org, ent_outer.is_point_of_care, ent_outer.parent_id
  from EnterpriseHierarchy ent_outer, ReferenceValues rv WHERE ent_outer.ent_type_id = rv.id and ent_outer.identifier = @ward_identifier
  union
  SELECT * FROM Ent_structure order by id, parent_id option ( MaxRecursion 0 );`;

  async getEnterprise(): Promise<Array<EntHierarchyCriteria>> {
    let result: Array<EntHierarchyCriteria> = new Array<EntHierarchyCriteria>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        var qb = new this.utils.QueryBuilder(this.sql_get_enterprise);
        const rows = await db.executeQuery(qb.getQuery());
        _.forEach(rows, (row: any, k: any) => {
          var _ent_hierarchy = new EntHierarchyCriteria();
          _ent_hierarchy.id = row.id != 0 ? parseInt(row.id) : 0;
          _ent_hierarchy.identifier = (row != null && row.identifier != "" ? row.identifier : "");
          _ent_hierarchy.ent_type = (row != null && row.entity_type != "" ? row.entity_type : "");
          _ent_hierarchy.short_name = (row != null && row.short_name != "" ? row.short_name : "");
          _ent_hierarchy.display_text = (row != null && row.display_text != "" ? row.display_text : "");
          _ent_hierarchy.is_master_org = row.is_master_org;
          _ent_hierarchy.is_point_of_care = row.is_point_of_care;
          _ent_hierarchy.parent_id = row.parent_id != 0 ? parseInt(row.parent_id) : 0;
          _ent_hierarchy.multilevel = row.multilevel;
          
          result.push(_ent_hierarchy);
        });

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<EntHierarchyCriteria>({
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
  async getPointOfCare(): Promise<Array<EntHierarchyCriteria>> {
    let result: Array<EntHierarchyCriteria> = new Array<EntHierarchyCriteria>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        var qb = new this.utils.QueryBuilder(this.sql_get_pointofcare);
        const rows = await db.executeQuery(qb.getQuery());
        _.forEach(rows, (row: any, k: any) => {
          var _req = new EntHierarchyCriteria();
          _req.id = row.id != 0 ? parseInt(row.id) : 0;
          _req.identifier = (row != null && row.identifier != "" ? row.identifier : "");
          _req.ent_type = (row != null && row.ent_type != "" ? row.ent_type : "");
          _req.short_name = (row != null && row.short_name != "" ? row.short_name : "");
          _req.display_text = (row != null && row.display_text != "" ? row.display_text : "");
          _req.is_master_org = row.is_master_org;
          _req.is_point_of_care = row.is_point_of_care;
          _req.parent_id = row.parent_id != 0 ? parseInt(row.parent_id) : 0;
          _req.multilevel = row.multilevel;

          result.push(_req);
        });

        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<EntHierarchyCriteria>({
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
  async getChildren(
    _entherarchy: EntHierarchyCriteria
  ): Promise<Array<EntHierarchyCriteria>> {
    let result: Array<EntHierarchyCriteria> = new Array<EntHierarchyCriteria>();
    try {
      if (_.get(_entherarchy, "identifier", "") == "") {
        throw new ErrorResponse<EntHierarchyCriteria>({
          success: false,
          message: "identifier should not be empty",
          item: null,
        });
      } else if (_.get(_entherarchy, "ent_type", "") == "") {
        throw new ErrorResponse<EntHierarchyCriteria>({
          success: false,
          message: "ent_type should not be empty",
          item: null,
        });
      }
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(this.sql_get_ward, {
          identifier: _entherarchy.identifier,
        });
        _.forEach(rows, (row: any, k: any) => {
          var _req = new EntHierarchyCriteria();
          _req.id = row.id != 0 ? parseInt(row.id) : 0;
          _req.identifier = (row != null && row.identifier != "" ? row.identifier : "");
          _req.ent_type = (row != null && row.ent_type != "" ? row.ent_type : "");
          _req.short_name = (row != null && row.short_name != "" ? row.short_name : "");
          _req.display_text = (row != null && row.display_text != "" ? row.display_text : "");
          _req.is_master_org = row.is_master_org;
          _req.is_point_of_care = row.is_point_of_care;
          _req.parent_id = row.parent_id != 0 ? parseInt(row.parent_id) : 0;
          _req.multilevel = row.multilevel;
          result.push(_req);
        });
        if (result.length == 0) {
          throw new ErrorResponse<EntHierarchyCriteria>({
            success: false,
            message:
              "Record not found for identifier " + _entherarchy.identifier,
            item: null,
          });
        }
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<EntHierarchyCriteria>({
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
  async getChildrenHierarchy(
    _entherarchy: EntHierarchyCriteria
  ): Promise<Array<EntHierarchyCriteria>> {
    let result: Array<EntHierarchyCriteria> = new Array<EntHierarchyCriteria>();
    try {
      if (_.get(_entherarchy, "identifier", "") == "") {
        throw new ErrorResponse<EntHierarchyCriteria>({
          success: false,
          message: "identifier should not be empty",
          item: null,
        });
      } else if (_.get(_entherarchy, "ent_type", "") == "") {
        throw new ErrorResponse<EntHierarchyCriteria>({
          success: false,
          message: "ent_type should not be empty",
          item: null,
        });
      }
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(this.sql_get_children_hierarchy, {
          identifier: _entherarchy.identifier,
        });
        _.forEach(rows, (row: any, k: any) => {
          var _req = new EntHierarchyCriteria();
          _req.id = row.id != 0 ? parseInt(row.id) : 0;
          _req.identifier = (row != null && row.identifier != "" ? row.identifier : "");
          _req.ent_type = (row != null && row.entity_type != "" ? row.entity_type : "");
          _req.short_name = (row != null && row.short_name != "" ? row.short_name : "");
          _req.display_text = (row != null && row.display_text != "" ? row.display_text : "");
          _req.is_master_org = row.is_master_org;
          _req.is_point_of_care = row.is_point_of_care;
          _req.parent_id = row.parent_id != 0 ? parseInt(row.parent_id) : 0;
          _req.multilevel = row.multilevel;
          result.push(_req);
        });
        var root_result: Array<EntHierarchyCriteria> = [];
        var root: EntHierarchyCriteria | undefined = _.find(result, (v1) => {
          return v1.identifier == _entherarchy.identifier;
        });
        if (root == undefined) {
          throw new ErrorResponse<EntHierarchyCriteria>({
            success: false,
            message:
              "Record not found for identifier " + _entherarchy.identifier,
            item: null,
          });
        }
        assembleTree(root, result);
        if (root.children != null && root.children.length > 0)
          root_result = root.children;

        function assembleTree(
          data: EntHierarchyCriteria,
          data_array: Array<EntHierarchyCriteria>
        ) {
          var nodes = _.filter(data_array, (v1) => {
            return v1.parent_id == data.id;
          });
          data.children = nodes;
          _.forEach(data.children, (v2) => {
            assembleTree(v2, data_array);
          });
        }
        result = root_result;
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<EntHierarchyCriteria>({
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
}
export default EntHierarchyService;
