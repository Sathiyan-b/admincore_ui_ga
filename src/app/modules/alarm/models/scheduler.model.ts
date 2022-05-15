import { Base } from "../../global/models/base.model";
export class Scheduler extends Base {
  id: number = 0;
  scheduler_id: string = "";
  from_id: number = 0;
  to_id: number = 0;
  type_id: number = 0;
  data: string = "";
  rules: string = "";
  trigger_time: Date = new Date();

  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = false;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}
export class ScheduleWrapper extends Scheduler {
  scheduler_type: string = "";
}

export class AlarmEscalationScheduler extends Base {
  alarm_id: number = 0;
  level: number = 0;
  duration_unit_uom_value: string = "";
  duration: number = 0;
}

export namespace Scheduler {
  export enum SCHEDULER_TYPES {
    ESCALATION = "ESCALATION",
    REMINDER = "REMINDER",
  }
}

export class SchedulerRule {
  scheduler_id: string = "";
  repeat: boolean = false;
  // second: number = 0;
  // minute: number = 0;
  // hour: number = 0;
  trigger_time: Date = new Date();
  time_zone: string = "";
  scheduled: boolean = true;

  day_of_month: number = 0;
  times_per_month: number = 0;
  month: string = "";
  day_of_week: string = "";
  scheduler_type: Scheduler.SCHEDULER_TYPES =
    Scheduler.SCHEDULER_TYPES.ESCALATION;
}

export class ReminderScheduler extends Base {
  patient_order_id: number = 0;
  message: string = "";
  user_id: number = 0;
  trigger_time: Date = new Date();
}
