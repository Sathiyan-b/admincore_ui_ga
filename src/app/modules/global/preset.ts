import { global_logger } from "./utils";
import { Mailer } from "./utils/mailer";
class Preset {
  constructor() {}
  public async asynchronous() {
    try {
      var TAG = "[PRESET ASYNCHRONOUS]\t";
      global_logger.info(TAG + "STARTED");
      global_logger.info(TAG + "Mailer Initiation STARTED");
      await Mailer.getInstance().init();
      global_logger.info(TAG + "Mailer Initiation Done");
      global_logger.info(TAG + "DONE");
    } catch (error) {
      throw error;
    }
  }
  synchronous() {
    try {
      var TAG = "[PRESET SYNCHRONOUS]\t";
      global_logger.info(TAG + "STARTED");

      global_logger.info(TAG + "DONE");
    } catch (error) {
      throw error;
    }
  }
}
export { Preset as GlobalPreset };
