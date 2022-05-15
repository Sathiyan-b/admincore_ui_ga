import { using, Environment } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import { Settings } from "../models/settings.model";
export class SettingsService extends BaseService {
  get() {
    var result = new Settings();
    try {
      result.auth = this.environment.AUTH;
    } catch (error) {
      throw error;
    }
    return result;
  }
}
