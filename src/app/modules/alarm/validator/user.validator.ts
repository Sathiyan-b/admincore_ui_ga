import * as _ from "lodash";
import { BaseValidator } from "./base.validator";
import { UsersWrapper} from "../models/users.model"
import { ErrorResponse } from "../../global/models/errorres.model";
import bcrypt from "bcrypt";

export class UserValidator extends BaseValidator {
	constructor() {
		super();
	}
	changePassword(_user: UsersWrapper) {
		var user :UsersWrapper= new UsersWrapper();
		user.password = _user.password;
		user.id = _user.id;
		try {
			if (user.password == "") {
				throw "invalid password";
			}
			if (user.id == 0) {
				throw "user not found";
			}

			if (user.old_password != null && user.pre_password != null &&
				user.old_password != "" && user.pre_password != ""
			  ) {
				var secret = _.get(process, "env.SECRET", "secret");
				var is_verified = bcrypt.compareSync(
					user.pre_password + secret,
					user.old_password
				);
				if (!is_verified) {
					throw "old password invalid";
				}
			}


		} catch (error) {
			if (typeof error == "string") {
				throw new ErrorResponse({
					message: error,
				});
			}
			throw error;
		}
	}
}
