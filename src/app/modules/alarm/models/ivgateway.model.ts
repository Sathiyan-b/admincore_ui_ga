import { Base } from "../../global/models/base.model";
import * as _ from "lodash";

export class IVGatewayRegister extends Base {
  Name: string = "";
  Surname: string = "";
  DeviceId: string = "";
}

export class IVGatewayLogin extends Base {
  username: string = "";
  password: string = "";
}

export class IVGatewayAssociation extends Base {
  TypeId: number = 0;
  Id: string = "";
  ValueTypeId: number = 0;
  Value: IVGatewayAssociation.AssociationInfo =
    new IVGatewayAssociation.AssociationInfo();
  Barcode: string = "";
}

export class IVGatewayAssociationPOST extends Base {
  TypeId: number = 0;
  Id: string = "";
  ValueTypeId: number = 0;
  Value: string = "";
  Barcode: string = "";
}
export class IVGatewayAssociationWrapper extends IVGatewayAssociation {
  patient_id: number = 0;
  device_id: number = 0;
  patient_visit_id: number = 0;
  patient_order_id: number = 0;
  allow_association: boolean = false;
  hl7_message: string = "";
}

export namespace IVGatewayAssociation {
  export class AssociationInfo {
    association_info: AssociationInfoV2 = new AssociationInfoV2();
  }
  export class AssociationInfoV2 {
    patient_info: Patientinfo = new Patientinfo();
    device_info: Deviceinfo = new Deviceinfo();
    order_info: Orderinfo = new Orderinfo();
  }
  export class Patientinfo {
    "id": string = "";
    "first_name": string = "";
    "last_name": string = "";
    "dob": Date | string = new Date(9999, 11, 31, 23, 59, 59);
    "gender": string = "";
    "point_of_care": string = "";
    "room": string = "";
    "bed": string = "";
    "visit_number": string = "";
    "admission_dttm": Date | string = new Date(9999, 11, 31, 23, 59, 59);
  }
  export class Deviceinfo {
    "serial_number": string = "";
    "device_name": string = "";
    "manufacturer": string = "";
    "model": string = "";
    "type": string = "";
    "auto_prog": string = "";
    "auto_doc": string = "";
  }
  export class Orderinfo {
    "order_id": string = "";
    "drug_name": string = "";
    "drug_id": string = "";
    "total_volume_tbi": string = "";
    "volume_uom": string = "";
    "rate": string = "";
    "rate_uom": string = "";
    "strenth": string = "";
    "strength_uom": string = "";
  }
}

export class IVGatewayResp<T> extends Base {
  code: number = 0;
  data?: T;
  response: any;
}
