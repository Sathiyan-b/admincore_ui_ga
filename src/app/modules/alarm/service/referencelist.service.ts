import { QueryBuilder, using } from "../../global/utils";
import { BaseService } from "./base.service";
import { ReferenceListModel } from "../models/referencelist.model";
import * as _ from "lodash";

export class ReferenceListService extends BaseService {
  sql_get_localities: string =
    "select ref_value_display_text From referencelist where ref_type_code = 'LOCALE_CODE' order by ref_value_display_text";
  sql_get_referencelist: string = `
SELECT ReferenceValues.id, referencevalues.ref_type_id, referencevalues.identifier, referencevalues.display_text, referencevalues.lang_code, referencevalues.app_id, referencevalues.enterprise_id,
referencevalues.ent_location_id,referencevalues.created_by, referencevalues.modified_by, referencevalues.created_on, referencevalues.modified_on,
referencevalues.is_active, referencevalues.lang_code, referencevalues.is_suspended, referencevalues.parent_id, referencevalues.is_factory, referencevalues.notes FROM referencevalues 
where ref_type_id in(select id from ReferenceTypes where identifier=@identifier)`;
  sql_insert_referencelist: string = `
INSERT INTO ReferenceValues(ref_type_id, identifier, display_text, lang_code, app_id, enterprise_id,
  ent_location_id,created_by, modified_by, created_on, modified_on,
  is_active, is_suspended, parent_id, is_factory, notes)
VALUES (@ref_type_id, @identifier, @display_text, @lang_code, @app_id,
   @enterprise_id, @ent_location_id, @created_by, @modified_by, @created_on, @modified_on,
    @is_active, @is_suspended, @parent_id, @is_factory, @notes)
returning *;`;

  sql_update_referencelist: string = ``;

  async getLocalities(): Promise<Array<string>> {
    let result: Array<string> = new Array<string>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          // await db.executeQuery("BEGIN");
          const rows = await db.executeQuery(this.sql_get_localities);
          _.forEach(rows, (v, k) => {
            // var localities = new Locality(v);
            result.push(v.ref_value_display_text);
          });
          // await db.executeQuery("COMMIT");
        } catch (e) {
          // await db.executeQuery("ROLLBACK");
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async getReferenceList(
    _req: ReferenceListModel
  ): Promise<Array<ReferenceListModel>> {
    let result: Array<ReferenceListModel> = new Array<ReferenceListModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          // await db.executeQuery("BEGIN");
          var qb = new QueryBuilder(this.sql_get_referencelist);
          var query_string: string = qb.getQuery();
          const rows = await db.executeQuery(query_string, {
            identifier: _req.identifier,
          });
          _.forEach(rows, (v, k) => {
            var record = v;
            var temp = new ReferenceListModel();
            // temp.id = record.id != 0 ? parseInt(record.id) : 0;
            temp.ref_type_id =
              record.ref_type_id != 0 ? parseInt(record.ref_type_id) : 0;
            temp.identifier =
              record != null && record.identifier != ""
                ? record.identifier
                : "";

            temp.display_text =
              record != null && record.display_text != ""
                ? record.display_text
                : "";
            temp.lang_code =
              record != null && record.lang_code != "" ? record.lang_code : "";
            temp.app_id = record.app_id != 0 ? parseInt(record.app_id) : 0;
            temp.enterprise_id =
              record.enterprise_id != 0 ? parseInt(record.enterprise_id) : 0;

            temp.ent_location_id =
              record.ent_location_id != 0
                ? parseInt(record.ent_location_id)
                : 0;
            temp.created_by = v.created_by != 0 ? parseInt(v.created_by) : 0;
            temp.modified_by = v.modified_by != 0 ? parseInt(v.modified_by) : 0;
            temp.created_on = v.created_on;
            temp.modified_on = v.modified_on;

            temp.is_active = v.is_active;
            // temp.lang_code = (record != null && record.lang_code != "" ? record.lang_code : "");
            temp.is_suspended = v.is_suspended;
            // temp.parent_id = v.parent_id  != 0 ? parseInt(v.parent_id) : 0;
            temp.is_factory = v.is_factory;
            temp.notes =
              record != null && record.notes != "" ? record.notes : "";

            temp.id = parseInt(record.id);
            temp.parent_id = parseInt(record.parent_id);
            result.push(temp);
          });
          // await db.executeQuery("COMMIT");
        } catch (e) {
          // await db.executeQuery("ROLLBACK");
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }

    return result;
  }

  async updateReferenceList(_referencelist: any): Promise<ReferenceListModel> {
    var referencelist: ReferenceListModel = new ReferenceListModel();
    // var referencelist_data = xpath.select("/UserData", _referencelist);
    // referencelist.id = TypeCheck._instance.getDefault(
    // 	TypeCheck.types.number,
    // 	xpath.select1("number(//item/id)", _referencelist)
    // );
    /* referencelist.name = TypeCheck._instance.getDefault(
			TypeCheck.types.string,
			xpath.select1("string(//item/referencelist_name)", _referencelist)
		);*/
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          const {
            ref_type_id,
            identifier,
            display_text,
            lang_code,
            app_id,
            enterprise_id,
            ent_location_id,
            created_by,
            modified_by,
            created_on,
            modified_on,
            is_active,
            is_suspended,
            parent_id,
            is_factory,
            notes,
            id,
          } = referencelist;

          // await db.executeQuery("BEGIN");

          const rows = await db.executeQuery(this.sql_update_referencelist, [
            ref_type_id,
            identifier,
            display_text,
            lang_code,
            app_id,
            enterprise_id,
            ent_location_id,
            created_by,
            modified_by,
            created_on,
            modified_on,
            is_active,
            is_suspended,
            parent_id,
            is_factory,
            notes,
            id,
          ]);
          // if (rows.length > 0) {
          //   result = new ReferenceListModel(rows[0]);
          // }

          // await db.executeQuery("COMMIT");
        } catch (e) {
          // await db.executeQuery("ROLLBACK");
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }
    return _referencelist;
  }

  async insertReferenceList(
    _req: ReferenceListModel
  ): Promise<ReferenceListModel> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          // const {
          //   ref_type_id,
          //   identifier,
          //   display_text,
          //   lang_code,
          //   app_id,
          //   enterprise_id,
          //   ent_location_id,
          //   created_by,
          //   modified_by,
          //   created_on,
          //   modified_on,
          //   is_active,
          //   is_suspended,
          //   parent_id,
          //   is_factory,
          //   notes
          // } = _req;

          // await db.executeQuery("BEGIN");

          const rows = await db.executeQuery(this.sql_insert_referencelist, {
            ref_type_id: _req.ref_type_id,
            identifier: _req.identifier,
            display_text: _req.display_text,
            lang_code: _req.lang_code,
            app_id: _req.app_id,
            enterprise_id: _req.enterprise_id,
            ent_location_id: _req.ent_location_id,
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

          // await db.executeQuery("COMMIT");
        } catch (e) {
          // await db.executeQuery("ROLLBACK");
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }
    // if (true) {
    // 	throw new ErrorResponse({
    // 		error_message: "insert referencelist error",
    // 		error_obj: {
    // 			name: "referencelist new record insert error"
    // 		}
    // 	});
    // }
    return _req;
  }
}
