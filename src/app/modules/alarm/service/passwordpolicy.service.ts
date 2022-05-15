import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { PasswordPolicy } from "../models/passwordpolicy.model";
import { date } from "joi";

export class PasswordPolicyService extends BaseService {
  sql_get_password_policy: string = `select passwordpolicy.id, passwordpolicy.min_length, passwordpolicy.max_length, passwordpolicy.can_allow_uppercase,
   passwordpolicy.min_uppercase_reqd, passwordpolicy.can_allow_lowercase, passwordpolicy.min_lowercase_reqd, passwordpolicy.can_allow_numerals, passwordpolicy.min_numerals_reqd, passwordpolicy.can_allow_special_characters, 
	passwordpolicy.min_special_characters_reqd, passwordpolicy.repeat_old_password_restriction, passwordpolicy.password_change_frequency, 
	passwordpolicy.failed_login_attempts_allowed, passwordpolicy.enforce_password_change, passwordpolicy.app_id
	from passwordpolicy`;

  sql_insert_password_policy: string = `
  insert into passwordpolicy (min_length, max_length, can_allow_uppercase, min_uppercase_reqd, can_allow_lowercase, min_lowercase_reqd,
    can_allow_numerals, min_numerals_reqd, can_allow_special_characters, 
    min_special_characters_reqd, repeat_old_password_restriction, 
      password_change_frequency, failed_login_attempts_allowed, enforce_password_change, 
       created_by, created_on, is_active, app_id) 
      values (@min_length, @max_length, @can_allow_uppercase, @min_uppercase_reqd, @can_allow_lowercase, @min_lowercase_reqd, @can_allow_numerals, @min_numerals_reqd, @can_allow_special_characters,
         @min_special_characters_reqd, @repeat_old_password_restriction, @password_change_frequency,
          @failed_login_attempts_allowed, @enforce_password_change, @created_by, @created_on, @is_active, @app_id) 
		RETURNING *`;

  sql_update_passwordpolicy: string = `update passwordpolicy set 
	min_length = @min_length, max_length = @max_length, can_allow_uppercase = @can_allow_uppercase, min_uppercase_reqd = @min_uppercase_reqd, 
  can_allow_lowercase = @can_allow_lowercase, min_lowercase_reqd = @min_lowercase_reqd,
  can_allow_numerals = @can_allow_numerals, 
	min_numerals_reqd = @min_numerals_reqd, 
	can_allow_special_characters = @can_allow_special_characters, min_special_characters_reqd = @min_special_characters_reqd, 
    repeat_old_password_restriction = @repeat_old_password_restriction, 
	password_change_frequency = @password_change_frequency, failed_login_attempts_allowed = @failed_login_attempts_allowed, 
	enforce_password_change = @enforce_password_change,  
	modified_by = @modified_by, modified_on = @modified_on, app_id = @app_id
	where id = @id RETURNING *`;

  async getPasswordPolicy(): Promise<Array<PasswordPolicy>> {
    let result: Array<PasswordPolicy> = new Array<PasswordPolicy>();
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        // await db.executeQuery("BEGIN");
        const rows = await db.executeQuery(this.sql_get_password_policy);
        _.forEach(rows, (v, k) => {
          var _password_policy = new PasswordPolicy();
          _password_policy.id = v.id != 0 ? parseInt(v.id) : 0;
          _password_policy.min_length = v.min_length != 0 ? parseInt(v.min_length) : 0;
          _password_policy.max_length = v.max_length != 0 ? parseInt(v.max_length) : 0;
          _password_policy.can_allow_uppercase = v.can_allow_uppercase;
          _password_policy.min_uppercase_reqd = v.min_uppercase_reqd;
          _password_policy.can_allow_lowercase = v.can_allow_lowercase;
          _password_policy.min_lowercase_reqd = v.min_lowercase_reqd;
          _password_policy.can_allow_numerals = v.can_allow_numerals;
          _password_policy.min_numerals_reqd = v.min_numerals_reqd;
          _password_policy.can_allow_special_characters = v.can_allow_special_characters;
          _password_policy.min_special_characters_reqd = v.min_special_characters_reqd;
          _password_policy.repeat_old_password_restriction = v.repeat_old_password_restriction != 0 ? parseInt(v.repeat_old_password_restriction) : 0;
          _password_policy.password_change_frequency =  v.password_change_frequency != 0 ? parseInt(v.password_change_frequency) : 0;
          _password_policy.failed_login_attempts_allowed = v.failed_login_attempts_allowed != 0 ? parseInt(v.failed_login_attempts_allowed) : 0;
          _password_policy.enforce_password_change = v.enforce_password_change;
          _password_policy.app_id = v.app_id != 0 ? parseInt(v.app_id) : 0;
          result.push(_password_policy);
        });
        // await db.executeQuery("COMMIT");
      });
    } catch (transaction_error) {
      // throw transaction_error;
      let error: any = transaction_error;
      throw new ErrorResponse<PasswordPolicy>({
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
  async insertPasswordPolicy(
    _req: PasswordPolicy
  ): Promise<PasswordPolicy> {
    try {
      //
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
         const rows = await db.executeQuery(this.sql_insert_password_policy, {
          min_length: _req.min_length,
          max_length: _req.max_length,
          can_allow_uppercase : _req.can_allow_uppercase,
          min_uppercase_reqd : _req.min_uppercase_reqd,
          can_allow_lowercase : _req.can_allow_lowercase,
          min_lowercase_reqd : _req.min_lowercase_reqd,
          can_allow_numerals: _req.can_allow_numerals,
          min_numerals_reqd: _req.min_numerals_reqd,
          can_allow_special_characters: _req.can_allow_special_characters,
          min_special_characters_reqd: _req.min_special_characters_reqd,
          repeat_old_password_restriction: _req.repeat_old_password_restriction,
          password_change_frequency: _req.password_change_frequency,
          failed_login_attempts_allowed: _req.failed_login_attempts_allowed,
          enforce_password_change: _req.enforce_password_change,
          created_by: _req.created_by,
          created_on: new Date(),
          is_active: _req.is_active,
          app_id: _req.app_id,
        });
        if (rows.length > 0) {
          let row = rows[0];
          _req.id = row.id != null ? parseInt(row.id) : 0;
        }
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<PasswordPolicy>({
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
  async updatePasswordPolicy(
    _req: PasswordPolicy
  ): Promise<PasswordPolicy> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const rows = await db.executeQuery(this.sql_update_passwordpolicy, {
          id: _req.id,
          min_length: _req.min_length,
          max_length: _req.max_length,
          can_allow_uppercase : _req.can_allow_uppercase,
          min_uppercase_reqd : _req.min_uppercase_reqd,
          can_allow_lowercase : _req.can_allow_lowercase,
          min_lowercase_reqd : _req.min_lowercase_reqd,
          can_allow_numerals: _req.can_allow_numerals,
          min_numerals_reqd: _req.min_numerals_reqd,
          can_allow_special_characters: _req.can_allow_special_characters,
          min_special_characters_reqd: _req.min_special_characters_reqd,
          repeat_old_password_restriction: _req.repeat_old_password_restriction,
          password_change_frequency: _req.password_change_frequency,
          failed_login_attempts_allowed: _req.failed_login_attempts_allowed,
          enforce_password_change: _req.enforce_password_change,
          modified_by: _req.modified_by,
          modified_on: new Date(),
          app_id: _req.app_id
        });
        // if (rows.length > 0) {
        //   let row = rows[0];
        //   _req.id = row.id != null ? parseInt(row.id) : 0;
        // }
      });
    } catch (transaction_error) {
      let error: any = transaction_error;
      // throw transaction_error;
      throw new ErrorResponse<PasswordPolicy>({
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
}

export default PasswordPolicyService;
