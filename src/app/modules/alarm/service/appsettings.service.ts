import * as _ from "lodash";
import {
  Environment,
  json_custom_parser,
  json_custom_stringifier,
  using,
} from "../../global/utils";
import { BaseService } from "./base.service";
import {
  AppSettingsModel,
  AppSettingsWrapper,
} from "../models/appsettings.model";
import { SettingsModel, SettingsCriteria } from "../models/settings.model";
import { ActionRes } from "../../global/models/actionres.model";
import { identity } from "lodash";
import { FavouritePatient } from "../models/favouritepatient.model";
import axios, { AxiosRequestConfig } from "axios";
import { ErrorResponse } from "../../global/models/errorres.model";

export class AppSettingsService extends BaseService {
  sql_get_appsettings: string = `SELECT id, UPPER(auth_mode) as auth_mode, ldap_Config2 as ldap_config, 
	configuration, enterprise_id, 
	location_id, created_by, created_on, version, notes from appsettings order by id desc`;
  sql_get_appsettings_by_id: string = `SELECT * from appsettings WHERE id = @id`;
  sql_update_appsettings: string = `update appsettings set auth_mode = @auth_mode, ldap_Config2 = @ldap_Config2, 
	configuration = @configuration, enterprise_id = @enterprise_id, location_id = @location_id, modified_by = @modified_by, modified_on = @modified_on, 
	version = version + 1, notes = @notes where id = @id RETURNING *`;
  sql_update_appsettings_status: string = `update appsettings set isactive = @isactive, version = version + 1 
	where id = @id RETURNING *`;
  sql_insert_appsettings: string = `insert into appsettings (auth_mode, ldap_Config, configuration, enterprise_id, 
	location_id, created_by, created_on, version, notes) 
	values (@auth_mode, @ldap_Config, @configuration, @enterprise_id, @location_id, @created_by, @created_on, @version, @notes) 
	RETURNING *`;
  sqlGetAppSetting: string = `
  select id, type, value, app_id, user_id, lang_code, created_on, created_by, modified_on, modified_by, is_active, is_factory from AppSettings @condition
  `;
  sql_addsettings: string = `INSERT INTO AppSettings
  (type,value,lang_code,app_id,user_id,created_by , created_on, is_active, is_suspended, parent_id, notes)
  VALUES
  (@type, @value, @lang_code, @app_id, @user_id, @created_by,  @created_on, @is_active, @is_suspended, @parent_id, @notes)
  RETURNING *`;
  sql_updatesettings: string = `UPDATE Appsettings set type = @type, value= @value, lang_code= @lang_code, app_id= @app_id, user_id= @user_id,
  created_by= @created_by, modified_by= @modified_by, created_on= @created_on, modified_on= @modified_on, is_active= @is_active, is_suspended= @is_suspended, parent_id= @parent_id, notes= @notes
  WHERE id = @id
  RETURNING *`;
  sql_get_appsettings_tags: string = `
  select type, value, lang_code, app_id, user_id, created_by , created_on, is_active, is_suspended, 
  parent_id, is_factory, notes from AppSettings where app_id = -1 and is_factory = 1;`;

  sql_updateUserLanguage: string = `UPDATE users SET lang_code=@lang_code WHERE id=@id`;
  // `select id,type ,value ,lang_code ,app_id ,user_id ,created_by ,modified_by ,created_on
  // ,modified_on ,is_active ,is_suspended ,parent_id ,is_factory ,notes from AppSettings where app_id=@app_id and user_id=@user_id`;

  // sql_get_active_directory_credentials = `
  // select newlist ->> 'name' AS name,  newlist ->> 'dn' as dn, newlist ->> 'url' as url ,
  // newlist ->> 'user_name' as user_name, newlist ->> 'password' as password
  // from appsettings LEFT JOIN LATERAL
  // json_array_elements (appsettings.ldap_config2 :: json) newlist ON TRUE
  // WHERE newlist ->> 'dn' = $1
  // `;

  async getAppSettings(): Promise<AppSettingsModel> {
    let result: AppSettingsModel = new AppSettingsModel();
    try {
      result.auth_mode = _.get(process, "env.AUTH_MODE", "");
    } catch (error) {
      throw error;
    }
    return result;
  }

  // async getActiveDirectoryCredentials(
  //   _active_directory_root: string
  // ): Promise<AppSettingsWrapper> {
  //   let result: AppSettingsWrapper = new AppSettingsWrapper();
  //   try {
  //     await using(this.db_provider.getDisposableDB(), async (db) => {
  //       await db.connect();
  //       try {
  //         const rows = await db.executeQuery(
  //           this.sql_get_active_directory_credentials,
  //           [_active_directory_root]
  //         );
  //         _.forEach(rows, (v, k) => {
  //           result = new AppSettingsWrapper(v);
  //         });
  //         // await db.executeQuery("COMMIT");
  //       } catch (e) {
  //         // await db.executeQuery("ROLLBACK");
  //         throw e;
  //       }
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  //   return result;
  // }

  async getAppSettingsbyid(
    _appsettings: AppSettingsModel
  ): Promise<Array<AppSettingsModel>> {
    let result: Array<AppSettingsModel> = new Array<AppSettingsModel>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          const { id } = _appsettings;
          const rows = await db.executeQuery(this.sql_get_appsettings_by_id, {
            id,
          });
          _.forEach(rows, (v, k) => {
            var appsettings = new AppSettingsModel(v);
            result.push(appsettings);
          });
        } catch (e) {
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }

    return result;
  }

  async updateAppSettings(
    _appsettings: AppSettingsModel
  ): Promise<AppSettingsModel> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          const {
            id,
            auth_mode,
            ldap_config,
            configuration,
            enterprise_id,
            location_id,
            modified_by,
            modified_on,
            notes,
          } = _appsettings;

          // await db.executeQuery("BEGIN");

          const rows = await db.executeQuery(this.sql_update_appsettings, [
            id,
            auth_mode,
            JSON.stringify(ldap_config),
            JSON.stringify(configuration),
            enterprise_id,
            location_id,
            modified_by,
            modified_on,
            notes,
          ]);
        } catch (e) {
          throw e;
        }
      });
    } catch (error) {
      throw error;
    }

    return _appsettings;
  }

  async insertAppSettings(
    _appsettings: AppSettingsModel
  ): Promise<AppSettingsModel> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        try {
          const {
            auth_mode,
            ldap_config,
            configuration,
            enterprise_id,
            location_id,
            created_by,
            created_on,
            version,
            notes,
          } = _appsettings;

          // await db.executeQuery("BEGIN");

          const rows = await db.executeQuery(this.sql_insert_appsettings, [
            auth_mode,
            JSON.stringify(ldap_config),
            JSON.stringify(configuration),
            enterprise_id,
            location_id,
            created_by,
            created_on,
            1,
            notes,
          ]);
          if (rows.length > 0) {
            let row = rows[0];
            _appsettings.id = row.id != null ? parseInt(row.id) : 0;
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
    /* if (true) {
			throw new ErrorResponse({
				error_message: "test error",
				error_obj: {
					name: "test"
				}
			});
		} */
    return _appsettings;
  }

  async getSettings(req: SettingsModel): Promise<SettingsModel> {
    var result = new SettingsModel();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        var qb = new this.utils.QueryBuilder(this.sqlGetAppSetting);
        var query_string = qb.getQuery();
        var condition_list: Array<string> = [];
        if (req.user_id != 0) {
          condition_list.push(`user_id = '${req.user_id}'`);
        }
        if (req.app_id != 0) {
          condition_list.push(`app_id = '${req.app_id}'`);
        }
        if (condition_list.length > 0) {
          query_string = query_string.replace(
            /@condition/g,
            `WHERE ${condition_list.join(" and ")} or is_factory = 1`
          );
        } else {
          query_string = query_string.replace(
            /@condition/g,
            "where is_factory = 1"
          );
        }

        const rows = await db.executeQuery(query_string);
        // const rows = await db.executeQuery(this.sql_get_appsetting, {
        //   user_id: req.user_id,
        //   app_id: req.app_id,
        // });
        if (rows.length > 0) {
          let globalRow = rows[0];
          let userRow = rows[1];

          result.id =
            userRow != null && userRow.id != null
              ? userRow.id
              : globalRow != null && globalRow.id != null
              ? globalRow.id
              : 0;
          result.user_id =
            userRow != null && userRow.user_id != null
              ? userRow.user_id
              : globalRow != null && globalRow.user_id != null
              ? globalRow.user_id
              : 0;
          result.app_id =
            userRow != null && userRow.app_id != null
              ? userRow.app_id
              : globalRow != null && globalRow.app_id != null
              ? globalRow.app_id
              : 0;
          let globalValue =
            globalRow != null && globalRow.value != null
              ? json_custom_parser.parse(globalRow.value, globalRow.value)
              : "";
          let userValue =
            userRow != null && userRow.value != null
              ? json_custom_parser.parse(userRow.value, userRow.value)
              : "";

          globalValue.forEach((v: SettingsModel.SettingsValue) => {
            if (v.level == SettingsModel.SettingAccessKey.ROOT) {
              result.value.push(v);
            }
          });
          if (rows.length > 1) {
            userValue.forEach((v: SettingsModel.SettingsValue) => {
              if (v.level == SettingsModel.SettingAccessKey.USER) {
                result.value.push(v);
              }
            });
            result.lang_code =
              userRow != null && userRow.lang_code != null
                ? userRow.lang_code
                : "";
            result.created_on =
              userRow != null && userRow.created_on != null
                ? userRow.created_on
                : new Date();
            result.modified_on =
              userRow != null && userRow.modified_on != null
                ? userRow.modified_on
                : new Date();
            result.created_by =
              userRow != null && userRow.created_by != null
                ? userRow.created_by
                : 0;
            result.modified_by =
              userRow != null && userRow.modified_by != null
                ? userRow.modified_by
                : 0;
            result.is_active =
              userRow != null && userRow.is_active != null
                ? userRow.is_active
                : false;
            result.is_factory =
              userRow != null && userRow.is_factory != null
                ? userRow.is_factory
                : false;
          } else {
            globalValue.forEach((v: SettingsModel.SettingsValue) => {
              if (v.level == SettingsModel.SettingAccessKey.USER) {
                result.value.push(v);
              }
            });
            result.lang_code =
              globalRow != null && globalRow.lang_code != null
                ? globalRow.lang_code
                : "";
            result.created_on =
              globalRow != null && globalRow.created_on != null
                ? globalRow.created_on
                : new Date();
            result.modified_on =
              globalRow != null && globalRow.modified_on != null
                ? globalRow.modified_on
                : new Date();
            result.created_by =
              globalRow != null && globalRow.created_by != null
                ? globalRow.created_by
                : 0;
            result.modified_by =
              globalRow != null && globalRow.modified_by != null
                ? globalRow.modified_by
                : 0;
            result.is_active =
              globalRow != null && globalRow.is_active != null
                ? globalRow.is_active
                : false;
            result.is_factory =
              globalRow != null && globalRow.is_factory != null
                ? globalRow.is_factory
                : false;
          }
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  async addsettings(req: SettingsModel): Promise<SettingsModel> {
    var result = new SettingsModel();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        req.created_on = new Date();
        req.is_active = true;

        const rows = await db.executeQuery(this.sql_addsettings, {
          type: req.type,
          value: json_custom_stringifier.stringify(req.value),
          lang_code: req.lang_code,
          app_id: req.app_id,
          user_id: req.user_id,
          created_by: req.created_by,
          created_on: req.created_on,
          is_active: req.is_active,
          is_suspended: req.is_suspended,
          parent_id: req.parent_id,
          notes: req.notes,
        });
        if (rows.length) {
          let row = rows[0];
          req.id = row.id != null ? parseInt(row.id) : 0;
        }
      });
    } catch (error) {
      throw error;
    }
    return req;
  }
  async updatesettings(req: SettingsModel) {
    // var result = new SettingsModel();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        req.modified_on = new Date();
        req.is_active = true;

        const rows = await db.executeQuery(this.sql_updatesettings, {
          id: req.id,
          type: req.type,
          value: json_custom_stringifier.stringify(req.value),
          lang_code: req.lang_code,
          app_id: req.app_id,
          user_id: req.user_id,
          created_by: req.created_by,
          modified_by: req.modified_by,
          created_on: req.created_on,
          modified_on: req.modified_on,
          is_active: req.is_active,
          is_suspended: req.is_suspended,
          parent_id: req.parent_id,
          notes: req.notes,
        });
        if (rows.length) {
          let row = rows[0];
          req.id = row.id != null ? parseInt(row.id) : 0;
          // await this.updateOnUserLanguage(req);
        }
      });
    } catch (error) {
      throw error;
    }
    return req;
  }
  async environmentSettings() {
    let result = {
      lang_code: this.environment.language,
      auth_mode: this.environment.AUTH_MODE,
    };
    return result;
  }
  async getTagsAndColorList(): Promise<Array<SettingsCriteria>> {
    var result: Array<SettingsCriteria> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();

        const rows = await db.executeQuery(this.sql_get_appsettings_tags);
        if (rows.length > 0) {
          if (rows[0].value.length > 0) {
            var enterprise_patient_tags = _.defaultTo(
              rows[0].value[0].enterprise_patient_tags,
              {}
            );

            for (
              let index = 0;
              index < Object.keys(enterprise_patient_tags).length;
              index++
            ) {
              let _pushdata = new SettingsCriteria();
              _pushdata.tag_name = Object.keys(enterprise_patient_tags)[index];
              _pushdata.tag_colour =
                enterprise_patient_tags[_pushdata.tag_name];
              result.push(_pushdata);
            }
          }
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  async updateOnUserLanguage(req: SettingsModel) {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        req.modified_on = new Date();
        let language = "";
        req.value.forEach(v=>{
          if(v.key == SettingsModel.Settings.LANGUAGECODE) {
            language = v.value[0];
          }
        })
        const rows = await db.executeQuery(this.sql_updateUserLanguage, {
          id: req.user_id,
          lang_code: language,
        });
        // if (rows.length) {
        //   let row = rows[0];
        //   req.id = row.id != null ? parseInt(row.id) : 0;
        // }
      });
    } catch (error) {
      throw error;
    }
    return req;
  }
}
