import { Base } from "../../global/models/base.model";
export class PointofCareEscalation extends Base {
  id: number = 0;
  poc_id: number = 0;
  escalated_to_type_id: number = 0;
  escalated_to_type: string = "";
  escalated_to_id: number = 0;
  escalation_duration: number = 0;
  escalation_duration_uom: number = 0;
  app_id: number = 0;
  enterprise_id: number = 0;
  ent_location_id: number = 0;
  escalation_level: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  created_by: number = 0;
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_by: number = 0;
  is_active: boolean = false;
  is_factory: boolean = false;
}
export class PointofCareEscalationWrapper extends PointofCareEscalation {}
