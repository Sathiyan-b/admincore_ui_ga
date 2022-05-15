import { Base, BaseV2 } from "./base.model";
import * as _ from "lodash";
class ErrorResponse<T> extends BaseV2 {
  success: boolean = false;
  code: number = ErrorResponse.CODES.BAD_REQUEST;
  error?: string;
  message: string = "";
  item?: any;
  exception?: any;
  constructor(init?: Partial<ErrorResponse<T>>) {
    super(init);
    if (init) {
      this.success = _.get(init, "success", false);
      if (typeof init.code == "number") this.code = init.code;
      if (_.get(init, "error", null) != null) this.error = init.error;
      this.message = _.get(init, "message", "");
      if (_.get(init, "item", null) != null) {
        this.item = init.item;
      }
      if (_.get(init, "exception", null) != null) {
        this.exception = init.exception;
      }
    }
  }
}
module ErrorResponse {
  export enum ErrorCodes {
    BAD_REQUEST = 1000,
    ETIMEDOUT = "ETIMEDOUT",
    UNIQUE_KEY_VIOLATION = 1012,
    UNAUTHORIZED = 1014,
    FORBIDDEN = 1015,
    INVALID_JSON_STRUCTURE = 1016,
    INVALID_SESSION,
  }
  export enum CODES {
    UNAUTHORIZED,
    BAD_REQUEST,
    INVALID_SESSION,
  }
}

export { ErrorResponse };
