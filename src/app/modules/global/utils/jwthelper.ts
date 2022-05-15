import crypto from "crypto-js";

class JwtHelper {
	static getInstance() {
		return new JwtHelper();
	}
	constructor() {}
	decodeBase64(str: string) {
		var decoded_string = "";
		try {
			var words = crypto.enc.Base64.parse(str);
			decoded_string = crypto.enc.Utf8.stringify(words);
		} catch (error) {
			throw error;
		}
		return decoded_string;
	}
	isTokenExpired(token: string, offsetSeconds?: number) {
		var is_expired = true;
		try {
			if (token && token != "") {
				var date = this.getTokenExpirationDate(token);
				offsetSeconds = offsetSeconds || 0;
				if (date === null) {
					is_expired = false;
				} else {
					is_expired = !(
						date.valueOf() >
						new Date().valueOf() + offsetSeconds * 1000
					);
				}
			}
		} catch (error) {
			throw error;
		}
		return is_expired;
	}

	getTokenExpirationDate(token: string) {
		var date: Date = new Date();
		try {
			var decoded;
			decoded = this.decodeToken(token);
			if (decoded || decoded.hasOwnProperty("exp")) {
				date = new Date(0);
				date.setUTCSeconds(decoded.exp);
			}
		} catch (error) {
			throw error;
		}

		return date;
	}

	decodeToken(token: string) {
		var decoded_token_object = null;
		try {
			var parts = token.split(".");
			if (parts.length !== 3) {
				token = this.decodeBase64(token);
				parts = token.split(".");
				if (parts.length !== 3)
					throw new Error(
						"The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more."
					);
			}
			var decoded = this.decodeBase64(parts[1]);
			if (!decoded) {
				throw new Error("Cannot decode the token.");
			}
			decoded_token_object = JSON.parse(decoded);
		} catch (error) {
			throw error;
		}
		return decoded_token_object;
	}
}
export { JwtHelper };
