import _ from "lodash";
import { DB, using } from "../../global/utils";
import { BaseService } from "./base.service";
import {
  Scheduler,
  ScheduleWrapper,
  AlarmEscalationScheduler,
  SchedulerRule,
  ReminderScheduler,
} from "../models/scheduler.model";

import moment from "moment";
import { AlarmService } from "./alarm.service";
import { AlarmObservations } from "../models/alarmobservations.model";
import { scheduler } from "../../global/utils/scheduler";

export class SchedulerService extends BaseService {
  sql_select: string = `
  SELECT scheduler.id,
		  scheduler.scheduler_id,
      scheduler.from_id,
      scheduler.to_id,
      scheduler.type_id,
      scheduler.data,
      scheduler.rules,
	    ReferenceValues.identifier as scheduler_type,
      scheduler.trigger_time,
      scheduler.created_by,
      scheduler.modified_by,
      scheduler.created_on,
      scheduler.modified_on,
      scheduler.is_active,
      scheduler.is_suspended,
      scheduler.parent_id,
      scheduler.is_factory,
      scheduler.notes FROM Scheduler 
	    inner join ReferenceValues on ReferenceValues.id = Scheduler.type_id and Scheduler.is_active = 1
      @condition;
      `;

  sql_insert: string = `
  Declare @scheduler_type_id bigint
  Select @scheduler_type_id = id from ReferenceValues where identifier = @scheduler_type
INSERT INTO scheduler 
(
scheduler_id,
from_id,
to_id,
data,
rules,
type_id,
trigger_time,
created_by,
modified_by,
created_on,
modified_on,
is_active,
is_suspended,
parent_id,
is_factory,
notes
)
VALUES 
(
@scheduler_id,
@from_id,
@to_id,
@data,
@rules,
@scheduler_type_id,
@trigger_time,
@created_by,
@modified_by,
@created_on,
@modified_on,
@is_active,
@is_suspended,
@parent_id,
@is_factory,
@notes
)
RETURNING *;  
`;

  sql_update: string = `
    UPDATE Scheduler
    SET  
scheduler_id = @scheduler_id,
from_id = @from_id,
to_id = @to_id,
type_id = @type_id,
data = @data,
rules = @rules,
trigger_time = @trigger_time,
created_by = @created_by,
modified_by = @modified_by,
created_on = @created_on,
modified_on = @modified_on,
is_active = @is_active,
is_suspended = @is_suspended,
parent_id = @parent_id,
is_factory = @is_factory,
notes = @notes
    WHERE id = @id
    RETURNING *;
  `;

  sql_delete: string = ` DELETE FROM Scheduler
   WHERE id = @id
   RETURNING *; `;
  sql_inactive_schedule: string = ` UPDATE Scheduler set is_active = 0
   WHERE id = @id
   RETURNING *; `;

  public async select(_req: Scheduler): Promise<Array<ScheduleWrapper>> {
    var result: Array<ScheduleWrapper> = [];
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.selectTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async selectTransaction(
    db: DB,
    _req: Scheduler
  ): Promise<Array<ScheduleWrapper>> {
    var result: Array<ScheduleWrapper> = [];
    try {
      var query: string = this.sql_select;
      var condition_list: Array<string> = [];
      if (_req.id > 0) {
        condition_list.push(`Scheduler.id = ${_req.id}`);
      }
      if (condition_list.length > 0) {
        query = query.replace(
          /@condition/g,
          `WHERE ${condition_list.join(" and ")}`
        );
      } else {
        query = query.replace(/@condition/g, "");
      }
      var rows = await db.executeQuery(query);
      if (rows.length > 0) {
        _.forEach(rows, (v) => {
          var temp: ScheduleWrapper = new ScheduleWrapper();
          temp.id = v.id != null && v.id != 0 ? parseInt(v.id) : 0;
          temp.scheduler_id =
            v.scheduler_id != null && v.scheduler_id != null
              ? v.scheduler_id
              : "";
          temp.from_id =
            v.from_id != null && v.from_id != 0 ? parseInt(v.from_id) : 0;
          temp.to_id = v.to_id != null && v.to_id != 0 ? parseInt(v.to_id) : 0;
          temp.type_id =
            v.type_id != null && v.type_id != 0 ? parseInt(v.type_id) : 0;
          temp.data = v.data != null ? JSON.stringify(v.data) : "";
          temp.rules = v.rules != null ? v.rules : "";
          temp.scheduler_type =
            v.scheduler_type != null && v.scheduler_type != null
              ? v.scheduler_type
              : "";
          temp.trigger_time = v.trigger_time != null && v.trigger_time;
          temp.created_by =
            v.created_by != null && v.created_by != 0
              ? parseInt(v.created_by)
              : 0;
          temp.modified_by =
            v.modified_by != null && v.modified_by != 0
              ? parseInt(v.modified_by)
              : 0;
          temp.created_on = v.created_on != null && v.created_on;
          temp.modified_on = v.modified_on != null && v.modified_on;
          temp.is_active = v.is_active != null && v.is_active;
          temp.is_suspended = v.is_suspended != null && v.is_suspended;
          temp.parent_id =
            v.parent_id != null && v.parent_id != 0 ? parseInt(v.parent_id) : 0;
          temp.is_factory = v.is_factory != null && v.is_factory;
          temp.notes =
            v.notes != null && v != null && v.notes.length != 0 ? v.notes : "";
          result.push(temp);
        });
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async insert(_req: ScheduleWrapper): Promise<Scheduler> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();

        await this.insertTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }

  public async insertTransaction(
    db: DB,
    _req: ScheduleWrapper
  ): Promise<ScheduleWrapper> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, {
        scheduler_id: _req.scheduler_id,
        from_id: _req.from_id,
        to_id: _req.to_id,
        trigger_time: _req.trigger_time,
        data: _req.data,
        rules: _req.rules,
        scheduler_type: _req.scheduler_type,

        created_by: _req.created_by,
        modified_by: _req.modified_by,
        created_on: _req.created_on,
        modified_on: _req.modified_on,
        is_active: _req.is_active,
        is_suspended: _req.is_suspended,
        parent_id: _req.parent_id,
        is_factory: _req.is_factory,
        notes: _req.notes,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async update(_req: Scheduler): Promise<Scheduler> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.updateTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async updateTransaction(db: DB, _req: Scheduler): Promise<boolean> {
    try {
      const {
        id,
        scheduler_id,
        from_id,
        to_id,
        type_id,
        data,
        rules,
        trigger_time,
        created_by,
        modified_by,
        created_on,
        modified_on,
        is_active,
        is_suspended,
        parent_id,
        is_factory,
        notes,
      } = _req;
      var rows = await db.executeQuery(this.sql_update, {
        id,
        scheduler_id,
        from_id,
        to_id,
        type_id,
        data,
        rules,
        trigger_time,
        created_by,
        modified_by,
        created_on,
        modified_on,
        is_active,
        is_suspended,
        parent_id,
        is_factory,
        notes,
      });
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
    return true;
  }
  public async delete(_req: Scheduler): Promise<Scheduler> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.deleteTransaction(db, _req);
      });
    } catch (error) {
      throw error;
    }
    return _req;
  }
  public async deleteTransaction(db: DB, _req: Scheduler): Promise<void> {
    try {
      _req.modified_on = new Date();

      var rows = await db.executeQuery(this.sql_delete, { id: _req.id });
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }

  public async inactiveScheduler(scheduler_id: number): Promise<boolean> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.inactiveSchedulerTransaction(db, scheduler_id);
      });
    } catch (error) {
      throw error;
    }
    return true;
  }
  public async inactiveSchedulerTransaction(
    db: DB,
    scheduler_id: number
  ): Promise<boolean> {
    try {
      var rows = await db.executeQuery(this.sql_inactive_schedule, {
        id: scheduler_id,
      });
      if (rows.length > 0) {
        var row = rows[0];
      }
    } catch (error) {
      throw error;
    }
    return true;
  }

  public async restartScheduler(): Promise<boolean> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await db.beginTransaction();
        try {
          /* get active scheduler list */
          var _scheduler_list = await this.selectTransaction(
            db,
            new ScheduleWrapper()
          );
          if (_scheduler_list.length > 0) {
            _scheduler_list.forEach(async (v1) => {
              /* start setting Schedule */
              if (moment(v1.trigger_time).isBefore(moment())) {
                this.processSchedule(v1.id);
              } else await scheduler.startScheduler(v1.rules, v1.id);
              /* End setting Schedule */
            });
          }

          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
    return true;
  }

  public async processSchedule(_scheduleid: number): Promise<boolean> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await db.beginTransaction();
        try {
          var _req = new Scheduler();
          _req.id = _scheduleid;
          var scheduler_list = await this.selectTransaction(db, _req);
          if (scheduler_list.length > 0) {
            var _schedule = scheduler_list[0];

            switch (_schedule.scheduler_type) {
              case Scheduler.SCHEDULER_TYPES.ESCALATION:
                let data: AlarmEscalationScheduler = JSON.parse(_schedule.data);
                var alarm_service = new AlarmService();
                var _alarm_req = new AlarmObservations();
                _alarm_req.id = data.alarm_id;
                try {
                  await alarm_service.sendNotification(_alarm_req, data.level);
                } catch (error) {}
                break;
              case Scheduler.SCHEDULER_TYPES.REMINDER:
                let _data: ReminderScheduler = JSON.parse(_schedule.data);
                var alarm_service = new AlarmService();
                var _alarm_req = new AlarmObservations();
                _alarm_req.id = 3897;
                try {
                  await alarm_service.sendReminderNotification(_data);
                } catch (error) {}
                break;
              default:
                break;
            }

            _schedule.is_active = false;
            await this.updateTransaction(db, _schedule);
            scheduler.destroyScheduler(_schedule.id);
          }
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
    return true;
  }

  public async createScheduler(
    _data: string,
    _schedule_rule: SchedulerRule
  ): Promise<number> {
    var result: number = 0;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await db.beginTransaction();
        try {
          var resp = await this.createSchedulerTransaction(
            db,
            _data,
            _schedule_rule
          );
          await db.commitTransaction();
        } catch (transaction_error) {
          await db.rollbackTransaction();
          throw transaction_error;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }
  public async createSchedulerTransaction(
    db: DB,
    _data: string,
    _schedule_rule: SchedulerRule
  ): Promise<number> {
    var result: number = 0;
    try {
      /* Generating Scheduler time */
      var rule = await scheduler.generateTimerForScheduler(_schedule_rule);

      /* start insert into Scheduler table */
      var _req = new ScheduleWrapper();
      _req.data = _data;
      _req.rules = rule;
      _req.created_on = new Date();
      _req.trigger_time = _schedule_rule.trigger_time;
      _req.scheduler_type = _schedule_rule.scheduler_type;

      var _insert_resp = await this.insertTransaction(db, _req);
      /* end insert into Scheduler table */

      /* start setting Schedule */
      await scheduler.startScheduler(rule, _insert_resp.id);
      /* End setting Schedule */
      result = _insert_resp.id;
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async setReminder(_req: ReminderScheduler): Promise<number> {
    var result: number = 0;
    try {
      var _scheduler_rule = new SchedulerRule();
      _req.user_id = this.user_context.user.id;
      _scheduler_rule.trigger_time = _req.trigger_time;
      _scheduler_rule.scheduler_type = Scheduler.SCHEDULER_TYPES.REMINDER;
      result = await this.createScheduler(
        JSON.stringify(_req),
        _scheduler_rule
      );
    } catch (error) {
      throw error;
    }
    return result;
  }
}
