import { Base } from "../../global/models/base.model";
import * as _ from "lodash";

export class FavouritePatient extends Base {
  id: number = 0;
  user_id: number = 0;
  patient_id: number = 0;
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = true;
  version: number = 1;
  tag_name: string = "";
  tag_colour: string = "";
}
export namespace FavouritePatient {
  export enum ACTION_RESPONSE {
    Accept = "A",
    Reject = "R",
    Excalate = "E",
    New = "N"
  }
  export enum TAG_COLOR_TYPES {
    RED = "#ff0000",
    BLUE = "#0000ff",
    GREEN = "#00ff00",
    PINK = "#ff0066",
    VIOLET = "#cc33ff"
  }
}
