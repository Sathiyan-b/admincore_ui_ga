import { using } from "../../global/utils";
import { BaseService } from "./base.service";
import { IHEMessagesModel } from "../models/ihemessages.model";
import * as _ from "lodash";
import { ErrorResponse } from "../../global/models/errorres.model";
import { Hl7Result } from "../../global/utils/hl7parser";
import { GPUtils } from "../../global/utils/gputils";

export class IHEMessagesService extends BaseService {
  sql_insert_messages: string = `insert into ihemessages (
          sending_app, sending_facility, receiving_app, receiving_facility, msg_received_on, 
          msg_type, msg_trg_event, msg_control_id, msg_version, msg_content, 
          created_by, created_on, is_active, is_factory) 
          values (@sending_app, @sending_facility, @receiving_app, @receiving_facility, @msg_received_on, 
            @msg_type, @msg_trg_event, @msg_control_id, @msg_version, @msg_content, 
            @created_by, @created_on, @is_active, @is_factory) RETURNING id`;

  async insertIHEMessages(
    _hl7message: string,
    _parsedhl7: Hl7Result
  ): Promise<number> {
    let result: number = 0;
    var _gputils: GPUtils = new GPUtils();
    var _ihemsgmodel = new IHEMessagesModel();
    try {
      _ihemsgmodel.sending_app = _parsedhl7.msh.sendingapplication.namespaceid;
      _ihemsgmodel.sending_facility = _parsedhl7.msh.sendingfacility;
      _ihemsgmodel.receiving_app =
        _parsedhl7.msh.recevingapplication.namespaceid;
      _ihemsgmodel.receiving_facility = _parsedhl7.msh.receivingfacility;
      _ihemsgmodel.msg_received_on =
        _parsedhl7.msh.datetimeofmessage != null &&
        _parsedhl7.msh.datetimeofmessage.length > 0
          ? _gputils.FromHL7Date(_parsedhl7.msh.datetimeofmessage)
          : new Date();
      _ihemsgmodel.msg_type = _parsedhl7.msh.messagetype.messagecode;
      _ihemsgmodel.msg_trg_event = _parsedhl7.msh.messagetype.triggerevent;
      _ihemsgmodel.msg_control_id = _parsedhl7.msh.messagecontrolid;
      _ihemsgmodel.msg_version = _parsedhl7.msh.versionid;
      _ihemsgmodel.msg_content = _hl7message;
      _ihemsgmodel.created_by = -1;
      _ihemsgmodel.created_on = new Date();
      _ihemsgmodel.is_active = true;
      _ihemsgmodel.is_factory = true;

      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        const {
          sending_app,
          sending_facility,
          receiving_app,
          receiving_facility,
          msg_received_on,
          msg_type,
          msg_trg_event,
          msg_control_id,
          msg_version,
          msg_content,
          created_by,
          created_on,
          is_active,
          is_factory,
        } = _ihemsgmodel;

        // await db.executeQuery("db.beginTransaction()");

        const rows = await db.executeQuery(this.sql_insert_messages, {
          sending_app,
          sending_facility,
          receiving_app,
          receiving_facility,
          msg_received_on,
          msg_type,
          msg_trg_event,
          msg_control_id,
          msg_version,
          msg_content,
          created_by,
          created_on,
          is_active,
          is_factory,
        });
        if (rows.length > 0) {
          result = rows[0].id;
        }
      });
    } catch (transaction_error: any) {
      // throw transaction_error;
      throw new ErrorResponse<IHEMessagesModel>({
        success: false,
        code: transaction_error.code,
        error: transaction_error.detail,
        message: transaction_error.message,
        item: _ihemsgmodel,
        exception: transaction_error.stack,
      });
    }
    return result;
  }
}
