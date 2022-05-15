import { Environment } from "./environment";
import { global_logger } from "./globallogger";
import { mllp_logger } from "./mllplogger";
import { HL7ParserV2 } from "./hl7parserV2";
import fs from "fs";
// import { alarm_receiver_queue } from "../../alarm/queue/alarm_receiver_queue";
import { AlarmObservationModel } from "../../alarm/models/alarmobservation.model";
import { Hl7Persister } from "./hl7persister";
import { AlarmObservations } from "../../alarm/models/alarmobservations.model";
import { AlarmService } from "../../alarm/service/alarm.service";

var mllp = require("mllp-node");
export class MLLP {
  async startServer() {
    try {
      var TAG = "[PRESET ASYNCHRONOUS MLLP]\t";
      var environment = new Environment();
      var alarm_service = new AlarmService();

      /* MLLP Protocol server changes */
      var mllp_server = new mllp.MLLPServer("0.0.0.0", environment.MLLP_PORT);
      mllp_logger.info(
        TAG + `MLLP Server running at http://0.0.0.0:${environment.MLLP_PORT}`
      );
      /*   mllp_logger.info(
        TAG + `MLLP Server running at http://0.0.0.0:${environment.MLLP_PORT}`
      );
        fs.readFile("D:/Dubai/IV-Gaurd-App/guardian-server/logs/test.log", 'utf8', function(err, data) {
        if (err) throw err;
        // console.info("data ",data)
        hl7parserv2.Parsedata(data)

      }); */

      /*  Subscribe to inbound messages */

      try {
        mllp_server.on("hl7", async function(data: string) {
          mllp_logger.info(data);
          if (environment.QUEUE_ENABLED) {
            // alarm_receiver_queue.add({ value: data });
          } else {
            alarm_service.processMessages(data);
          }
        });
      } catch (error) {}
    } catch (error) {
      throw error;
    }
  }
}
