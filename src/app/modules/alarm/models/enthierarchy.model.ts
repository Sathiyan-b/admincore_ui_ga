import { Base } from "../../global/models/base.model";
import * as _ from "lodash";

export class EntHierarchyModel extends Base {
  id: number = 0;
  ent_type_id: string = "";
  ent_short_name: string = "";
  ent_name: string = "";
  is_master_org: boolean = false;
  image_id: number | null = null;
  timezone_id: number | null = null;
  is_point_of_care: number = 0;
  lang_code: string = "en-GB";

  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  modified_on: Date = new Date(9999, 11, 31, 23, 59, 59);
  is_active: boolean | null = true;
  version: number = 1;
  is_suspended: boolean | null = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}
export namespace EntHierarchyModel {
  export enum TYPE {
    Enterprise = "Enterprise",
    Location = "Location",
    Building = "Building",
    Floor = "Floor",
    Facility = "Facility",
    Ward = "Ward",
    Room = "Room",
    Bed = "Bed",
  }
}

export class EntHierarchyTreeModel extends EntHierarchyModel {
  children: EntHierarchyTreeModel | null = null;
}
  
export class EntHierarchyCriteria extends Base {
  id: number = 0;
  identifier: string = "";
  ent_type: string = "";
  short_name: string = "";
  display_text: string = "";
  is_master_org: boolean = false;
  is_point_of_care: boolean = false;
  parent_id: number = 0;
  multilevel: boolean = false;
  children: Array<EntHierarchyCriteria> | null = null;

}
// export default EntHierarchyModel;
