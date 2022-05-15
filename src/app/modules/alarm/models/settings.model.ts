import { Base } from "./base.model";

export class SettingsModel extends Base {
  id: number = 0;
  type: string = "";
  value: Array<SettingsModel.SettingsValue> = [];
  lang_code: string = "en-GB";
  app_id: number = 0;
  user_id: number = 0;
  created_by: number = 0;
  modified_by: number = 0;
  created_on: Date = new Date();
  modified_on: Date = new Date();
  is_active: boolean = true;
  is_suspended: boolean = false;
  parent_id: number = 0;
  is_factory: boolean = false;
  notes: string = "";
}

export class SettingsCriteria extends SettingsModel {
  tag_name: string = "";
  tag_colour: string = "";
}

export namespace SettingsModel {
  export class SettingsValue {
    label: string = "";
    key: string = "";
    value: any = null;
    level: string = "";
    value_type: ValueTypes = ValueTypes.StringArray;
  }

  export enum SettingAccessKey {
    ROOT = "root",
    USER = "user",
  }
  export enum Settings {
    DATETIMEFORMAT = "DATETIMEFORMAT",
    USERNAMEFORMAT = "USERNAMEFORMAT",
    ROOTUSERFORMAT = "ROOTUSERFORMAT",
    LANGUAGECODE = "LANGUAGECODE",
    LANGUAGENAME = "LANGUAGENAME",
    ROOTROLEFORMAT = "ROOTROLEFORMAT",
    TAG = "TAG",
  }
  export enum ValueTypes {
    StringArray = "STRING_ARRAY",
    KeyValuePair = "KEY_VALUE_PAIR",
  }
}
