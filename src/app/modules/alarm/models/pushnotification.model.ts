import { Base } from "../../global/models/base.model";
import * as _ from "lodash";
export class PushNotificationModel<T> extends Base {
	token_list: Array<string> = [];
	title: string = "";
	sub_title: string = "";
	body: string = "";
	data?: T;
}
