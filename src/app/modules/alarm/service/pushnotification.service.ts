import { BaseService } from "./base.service";
import * as _ from "lodash";
import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushReceipt,
} from "expo-server-sdk";
import { PushNotificationModel } from "../models/pushnotification.model";
import { GlobalBaseService } from "../../global/service/globalbase.service";

export class PushNotificationService extends BaseService {
  expo: Expo;
  constructor() {
    super();
    this.expo = new Expo();
  }
  async sendNotification<T>(_notification: PushNotificationModel<T>) {
    var result: Array<ExpoPushTicket> = [];
    try {
      var message_list: Array<ExpoPushMessage> = [];
      _.forEach(_notification.token_list, (token: string) => {
        if (Expo.isExpoPushToken(token)) {
          message_list.push({
            to: token,
            sound: "default",
            title: _notification.title,
            subtitle: _notification.sub_title,
            body: _notification.body,
            data: _notification.data || {},
            channelId: "default",
            priority: "high",
          });
        }
      });
      var message_chunk_list = this.expo.chunkPushNotifications(message_list);
      for (let message_chunk of message_chunk_list) {
        try {
          var ticket_chunk = await this.expo.sendPushNotificationsAsync(
            message_chunk
          );
          result.push(...ticket_chunk);
        } catch (error) {
          this.log(GlobalBaseService.LogLevels.error, error);
        }
      }
    } catch (error) {
      throw error;
    }

    // if (result.length == 0) {
    // 	throw new Error("Couldn't send notification");
    // }
    // var success_count = _.reduce(
    // 	result,
    // 	(count, curr) => {
    // 		if (curr.status == "ok") count += 1;
    // 		return count;
    // 	},
    // 	0
    // );
    // if (success_count == 0) {
    // 	throw new Error("Couldn't send notification");
    // }
    return result;
  }

  async getNotificationReceipt(_ticket_list: Array<ExpoPushTicket>) {
    var result: {
      [id: string]: ExpoPushReceipt;
    } = {};
    try {
      var receipt_id_list: Array<string> = [];
      _.forEach(_ticket_list, (ticket) => {
        if (_.has(ticket, "id")) receipt_id_list.push(_.get(ticket, "id"));
      });
      var receipt_id_chunk_list: Array<Array<string>> =
        this.expo.chunkPushNotificationReceiptIds(receipt_id_list);
      for (let receipt_id_chunk of receipt_id_chunk_list) {
        try {
          var receipt_chunk = await this.expo.getPushNotificationReceiptsAsync(
            receipt_id_chunk
          );
          result = Object.assign({}, result, receipt_chunk);
        } catch (error) {
          this.log(GlobalBaseService.LogLevels.error, error);
        }
      }
    } catch (error) {
      throw error;
    }
    return result;
  }
}
