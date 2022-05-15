import * as _ from "lodash";
import { BaseValidator } from "./base.validator";
import { Users, UsersWrapper } from "../models/users.model";
import { ErrorResponse } from "../../global/models/errorres.model";
import { Auth } from "../models/auth.model";

export class AuthValidator extends BaseValidator {
	constructor() {
		super();
	}
	getotp(_user: UsersWrapper) {
		var user = new UsersWrapper();
		user.email = _user.email;
		user.login = _user.login;
		try {
			if (user.email == "" && user.login == "") {
				throw "give email/user name address";
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
	token(_auth: Auth) {
		var auth = new Auth();
		auth.refresh_token = _auth.refresh_token
		try {
			if (auth.refresh_token == "") {
				throw "give refresh token";
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
	logout(_auth: Auth) {
		var auth = new Auth();
		auth.refresh_token = _auth.refresh_token
		try {
			if (auth.refresh_token == "") {
				throw "give refresh token";
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
	resetpasswordwithotp(_user: UsersWrapper) {
		var user = new UsersWrapper();
		user.otp = _user.otp;
		user.email = _user.email;
		user.password = _user.password;
				try {
			if (user.otp == "") {
				throw "give otp";
			}
			// if (user.email == "") {
			// 	throw "give user id";
			// }
			if (user.password == "") {
				throw "give password";
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
