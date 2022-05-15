import { Base } from "./base.model";
import * as _ from "lodash";
class ActionReq<T> extends Base {
	item?: T;
	constructor(init?: Partial<ActionReq<T>>) {
		super(init);
		if (init) {
			if (_.get(init, "item", null) != null) {
				this.item = init.item;
			}
		}
	}
}
export { ActionReq };
