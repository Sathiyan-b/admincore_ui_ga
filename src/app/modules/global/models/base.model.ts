import * as _ from "lodash";
import { GlobalBase } from "./globalbase.model";
export class Base extends GlobalBase {
	constructor(init?: Base) {
		super(init)
		if (init) {
		}
	}
}
export namespace Base {
	export enum DURATION_TYPES {
		seconds = "SECONDS",
		minutes = "MINUTES",
	}
// export { Base };
}
export class BaseV2 {
	constructor(init?: BaseV2) {
		if (init) {
		}
	}
}
export namespace BaseV2 {
	export enum DURATION_TYPES {
		seconds = "SECONDS",
		minutes = "MINUTES",
	}
}