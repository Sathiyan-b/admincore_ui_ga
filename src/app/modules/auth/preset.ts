import { logger } from "./utils";
class Preset {
	constructor() {}
	public async asynchronous() {
		try {
			var TAG = "[PRESET ASYNCHRONOUS]\t";
			logger.info(TAG + "STARTED");

			
			logger.info(TAG + "DONE");
		} catch (error) {
			throw error;
		}
	}
	synchronous() {
		try {
			var TAG = "[PRESET SYNCHRONOUS]\t";
			logger.info(TAG + "STARTED");

			logger.info(TAG + "DONE");
		} catch (error) {
			throw error;
		}
	}
}
export { Preset as AuthPreset };
