import {
  IVGatewayAssociationWrapper,
  IVGatewayAssociation
} from "../../alarm/models/ivgateway.model";
import * as _ from "lodash";
import moment = require("moment");
import { IVGatewayService } from "../../alarm/service/ivgateway.service";

export class HL7ParserV2 {
  Parsedata = async (source: string) => {
    try {
      var ivgateway_service = new IVGatewayService();
      var sourcelist = source.split(/\r\n|\r/);
      var association_req: IVGatewayAssociationWrapper = new IVGatewayAssociationWrapper();
      association_req.Value = new IVGatewayAssociation.AssociationInfo();
      var _patient_info: IVGatewayAssociation.Patientinfo = new IVGatewayAssociation.Patientinfo();
      var _device_info: IVGatewayAssociation.Deviceinfo = new IVGatewayAssociation.Deviceinfo();
      var _order_info: IVGatewayAssociation.Orderinfo = new IVGatewayAssociation.Orderinfo();
      sourcelist.forEach(row => {
        let parts = row.split("|");
        if (parts != null && parts.length > 0) {
          switch (parts[0]) {
            case "PID":
              if (parts[3] != null && parts[3].length > 0) {
                let secondpart;
                let thirdpart;
                secondpart = parts[3].split("~");
                if (secondpart != null && secondpart.length > 0) {
                  thirdpart = secondpart[1].split("^");
                  if (thirdpart != null && thirdpart.length > 0) {
                    _patient_info.id = thirdpart[0];
                  }
                }
                let fifthpart = parts[5].split("~");
                if (fifthpart != null && fifthpart.length > 0) {
                  let sixthpart = fifthpart[0].split("^");
                  if (sixthpart != null && sixthpart.length > 0) {
                    _patient_info.last_name = sixthpart[0];
                    _patient_info.first_name = sixthpart[1];
                  }
                }
                _patient_info.dob = moment(parts[7]).format("YYYYMMDDHHMMSS");
                _patient_info.gender = parts[8];
              }
              break;
            case "PV1":
              if (parts[3] != null && parts[3].length > 0) {
                let secondpart = parts[3].split("^");
                if (secondpart != null && secondpart.length > 0) {
                  _patient_info.point_of_care = secondpart[0];
                  _patient_info.room = secondpart[1];
                  _patient_info.bed = secondpart[2];
                }
                _patient_info.visit_number = parts[19];
              }
              break;
            case "OBX":
              if (parts[18] != null && parts[18].length > 0) {
                let secondpart = parts[18].split("^");
                if (secondpart != null && secondpart.length > 0) {
                  _device_info.serial_number = secondpart[0];
                  association_req.Barcode = secondpart[0];
                }
              }
              break;
            case "ORC":
              if (parts[2] != null && parts[2].length > 0) {
                let secondpart = parts[2].split("^");
                if (secondpart != null && secondpart.length > 0) {
                  _order_info.order_id = secondpart[0];
                }
              }
              break;
            case "RXG":
              if (parts[4] != null && parts[4].length > 0) {
                let secondpart = parts[4].split("^");
                if (secondpart != null && secondpart.length > 0) {
                  _order_info.drug_name = secondpart[1];
                  _order_info.drug_id = secondpart[0];
                }
              }
              break;
          }
        }
      });
      // association_req.Id = "HSPR01014C22C00003B146102A01";
      association_req.Value.association_info.patient_info = _patient_info;
      association_req.Value.association_info.device_info = _device_info;
      association_req.Value.association_info.order_info = _order_info;
      association_req.Value.association_info.patient_info.admission_dttm = moment().format("YYYYMMDDHHMMSS");

      /* Send to association  */
      await ivgateway_service.AssociateWithIVGateway(association_req, "");
    } catch (error) {}
  };
}
