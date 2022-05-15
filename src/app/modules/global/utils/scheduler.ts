import cron from "node-cron";
import * as uuid from "uuid";
import { SchedulerService } from "../../alarm/service/scheduler.service";
import moment, { Moment } from "moment";
import { SchedulerRule } from "../../alarm/models/scheduler.model";
import { ErrorResponse } from "../models/errorres.model";
import { logger } from "../../alarm/utils";

class Scheduler {
  scheduler_list: { [key: string]: cron.ScheduledTask } = {};
  TAG = " SCHEDULER ";
  destroyScheduler = async (scheduleid: number) => {
    try {
      this.scheduler_list[scheduleid].stop();
      delete this.scheduler_list[scheduleid];
      // var scheduler_service = new SchedulerService();
      // await scheduler_service.inactiveScheduler(scheduleid);
      console.log("Schedule list ", JSON.stringify(this.scheduler_list));
    } catch (error) {}
  };

  startScheduler = (timer: string, scheduler_id: number) => {
    try {
      var scheduled_job = cron.schedule(timer, async d => {
        logger.info(this.TAG + "STARTED " + scheduler_id);
        try {
          var scheduler_service = new SchedulerService();
          scheduler_service.processSchedule(scheduler_id);
        } catch (error) {}
      });

      this.scheduler_list[scheduler_id] = scheduled_job;
      logger.info(
        this.TAG + "ACTIVE LIST " + JSON.stringify(this.scheduler_list)
      );
    } catch (error) {
      logger.error(this.TAG + "STARTING ERROR " + scheduler_id);
      throw error;
    }
  };
  generateTimerForScheduler = (_req: SchedulerRule): string => {
    var result: string = "";
    try {
      var seconds = moment(_req.trigger_time).get("seconds") || "*";
      var minutes = moment(_req.trigger_time).get("minutes") || "*";
      var hours = moment(_req.trigger_time).get("hours");
      var day_of_month = "*";
      if (_req.repeat) {
        day_of_month = moment(_req.trigger_time)
          .get("date")
          .toString();
      } else {
        day_of_month =
          _req.day_of_month == 0 ? "*" : _req.day_of_month.toString();
      }

      day_of_month =
        _req.times_per_month == 0
          ? day_of_month
          : day_of_month + "/" + _req.times_per_month;

      var month = _req.month.trim().length == 0 ? "*" : _req.month;
      var day_of_week =
        _req.day_of_week.trim().length == 0 ? "*" : _req.day_of_week;

      result = `${seconds} ${minutes} ${hours} ${day_of_month} ${month} ${day_of_week}`;
      if (!cron.validate(result)) {
        var e = new ErrorResponse();
        e.message = "Scheduler rule invalid";
        throw e;
      }
    } catch (error) {
      throw error;
    }
    return result;
  };
}

export const scheduler = new Scheduler();
