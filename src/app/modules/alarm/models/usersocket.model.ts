import { Base } from "../../global/models/base.model";
import { AlarmActorObservationsRES } from "./alarmobservations.model";
import { DevicesWrapper } from "./devices.model";

export class SocketMessage extends Base {
  alarm_type: number = SocketMessage.MESSAGE_TYPES.ALARM;
  patient_order_id: number = 0;
  alarm_obs: DevicesWrapper | null = null;
}

export namespace SocketMessage {
  export enum MESSAGE_TYPES {
    ALARM,
    GRAPH_DATA
  }
}
