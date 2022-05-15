import * as _ from "lodash";
import {
  logger,
  Environment,
  json_custom_stringifier,
} from "./modules/global/utils";
import { ALARMPreset } from "./modules/alarm/preset";
import { AuthPreset } from "./modules/auth/preset";
import { GlobalPreset } from "./modules/global/preset";
export class Preset {
  environment: Environment;
  alarm_preset: ALARMPreset;
  auth_preset: AuthPreset;
  global_preset: GlobalPreset;
  constructor() {
    this.environment = new Environment();
    this.alarm_preset = new ALARMPreset();
    this.auth_preset = new AuthPreset();
    this.global_preset = new GlobalPreset();
  }
  public async asynchronous() {
    try {
      var logger_instance = logger.getLogger("[PRESET ASYNCHRONOUS]");
      logger_instance.info("STARTED");

      await this.global_preset.asynchronous();

      if (this.environment.AUTH) {
        await this.auth_preset.asynchronous();
      }
      if (this.environment.ALARM) {
        await this.alarm_preset.asynchronous();
      }

      logger_instance.info("DONE");
    } catch (error) {
      throw error;
    }
  }
  synchronous() {
    var logger_instance = logger.getLogger("[PRESET SYNCHRONOUS]");
    try {
      logger_instance.info("STARTED");

      this.global_preset.synchronous();

      if (this.environment.AUTH) {
        this.auth_preset.synchronous();
      }
      if (this.environment.ALARM) {
        this.alarm_preset.synchronous();
      }

      logger_instance.info("DONE");
    } catch (error) {
      logger_instance.error("FAILED", json_custom_stringifier.stringify(error));
    }
  }
}
