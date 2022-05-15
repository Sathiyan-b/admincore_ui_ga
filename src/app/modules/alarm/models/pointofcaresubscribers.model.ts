import { Base } from "../../global/models/base.model";
  export class PointofCareSubscribers extends Base{
    id:number = 0;
    poc_id:number = 0
subscriber_id:number = 0
created_on:Date = new Date(9999, 11, 31, 23, 59, 59);
created_by:number = 0
modified_on:Date = new Date(9999, 11, 31, 23, 59, 59);
modified_by:number = 0
is_active:boolean = false;
is_factory:boolean = false;
app_id:number = 0
  is_user_subscribed: boolean = false;
  }
  export class PointofCareSubscribersWrapper extends PointofCareSubscribers{
  
  }
  