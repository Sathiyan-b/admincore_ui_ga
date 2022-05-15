import { using, DB } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import axios, { AxiosRequestConfig } from "axios";
import { ActionRes } from "../../global/models/actionres.model";
import {
  IVGatewayLogin,
  IVGatewayRegister,
  IVGatewayResp,
  IVGatewayAssociation,
  IVGatewayAssociationWrapper,
  IVGatewayAssociationPOST,
} from "../models/ivgateway.model";
import { ErrorResponse } from "../../global/models/errorres.model";
import {
  DevicePeopleWrapper,
  DevicePeople,
} from "../models/devicepeople.model";
import { DevicePeopleService } from "./devicepeople.service";

import * as Buffer from "buffer";
import { mllp_logger } from "../../global/utils/mllplogger";
import { DevicesService } from "./devices.service";
import { Devices } from "../models/devices.model";
import { PatientVisits } from "../models/patientvisits.model";
import { PatientVisitsService } from "./patientvisits.service";
import { PatientOrdersService } from "./patientorders.service";
import { PatientOrders } from "../models/patientorders.model";

export class IVGatewayService extends BaseService {
  Register = async (auth: IVGatewayRegister): Promise<boolean> => {
    var result: boolean = false;
    try {
      let url =
        this.environment.IV_GATEWAY_BASEURL +
        this.environment.IV_GATEWAY_REGISTER;
      var resp = await axios.post<IVGatewayResp<{ accessToken: string }>>(
        url,
        auth
      );
      if (resp.data) {
        if (_.get(resp.data, "code", 0) != 20000) {
          var e = new ErrorResponse();
          e.code = _.get(resp.data, "code", 0);
          e.message = _.get(resp.data, "response", "");
          if (_.get(resp.data, "code", 0) == 50007)
            e.message = "User Name Not Available";
          throw e;
        }
        result = true;
      }
    } catch (error) {
      throw error;
    }
    return result;
  };

  login = async (auth: IVGatewayLogin): Promise<{ accessToken: string }> => {
    var result: { accessToken: string } = { accessToken: "" };
    try {
      let url =
        this.environment.IV_GATEWAY_BASEURL + this.environment.IV_GATEWAY_LOGIN;
      var resp = await axios.post<any>(url, auth);
      if (_.get(resp.data, "code", 0) == 20000) {
        result.accessToken = _.get(resp.data, "data.accessToken", "");
      } else {
        var e = new ErrorResponse();
        e.code = _.get(resp.data, "code", 0);
        e.message = _.get(resp.data, "response", "authentication failed");
        throw e;
      }
    } catch (error) {
      throw error;
    }
    return result;
  };

  cofigInfo = async (auth: IVGatewayLogin): Promise<boolean> => {
    var result: boolean = false;
    try {
      let url =
        this.environment.IV_GATEWAY_BASEURL +
        this.environment.IV_GATEWAY_CONFIG;
      var post_data = { item: auth };
      var resp = await axios.post<ActionRes<IVGatewayLogin>>(url, post_data);
      if (resp.data) {
        result = true;
      }
    } catch (error) {
      throw error;
    }
    return result;
  };

  public async AssociatePatientAndDevice(
    _req: IVGatewayAssociationWrapper,
    access_token: string
  ): Promise<boolean> {
    var result: boolean = false;
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await db.beginTransaction();
        try {
          result = await this.AssociatePatientAndDeviceTransaction(
            db,
            _req,
            access_token
          );
          await db.commitTransaction();
        } catch (error) {
          await db.rollbackTransaction();
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
    return result;
  }

  public async AssociatePatientAndDeviceTransaction(
    db: DB,
    _req: IVGatewayAssociationWrapper,
    access_token: string
  ): Promise<boolean> {
    try {
      var devicepeople_service = new DevicePeopleService();
      var _req_people: DevicePeopleWrapper = new DevicePeopleWrapper();
      _req_people.device_id = _req.device_id;
      _req_people.patient_id = _req.patient_id;
      _req_people.patient_order_id = _req.patient_order_id;
      _req_people.patient_visit_id = _req.patient_visit_id;

      /* Getting patient visit number using patient visit id */

      var patientvisit_service = new PatientVisitsService();
      var _req_patient_visit: PatientVisits = new PatientVisits();
      _req_patient_visit.id = _req.patient_visit_id;
      var _patient_visit_resp = await patientvisit_service.select(
        _req_patient_visit
      );
      if (_patient_visit_resp.length > 0) {
        _req.Value.association_info.patient_info.visit_number =
          _patient_visit_resp[0].visit_number;
      }

      /* End */

      _req_people.user_id = 0;
      _req_people.valid_from = new Date();
      _req_people.created_on = new Date();
      _req_people.created_by = 0;
      //  _req_people.request_status_id = _;
      _req_people.is_active = true;
      var resp: Array<DevicePeopleWrapper> =
        await devicepeople_service.getNonDisassociatedDevices(_req_people);
      if (resp.length > 0) {
        _req_people = _.defaultTo(resp[0], new DevicePeopleWrapper());
        _req_people.patient_order_id = _req.patient_order_id;
        _req_people.patient_visit_id = _req.patient_visit_id;
        if (
          // _req_people.patient_id != _req.patient_id &&
          _req_people.request_status_identifier ==
            DevicePeople.ACTION_RESPONSE.ASSOCIATED &&
          !_req.allow_association
        ) {
          if (
            _req.patient_order_id &&
            _req_people.patient_id == _req.patient_id
          ) {
          } else {
            var e = new ErrorResponse();
            e.code = -1;
            e.message = `Device ${_req_people.device_id} already associated with Patient ${_req_people.patient_id}`;
            throw e;
          }
        } else if (_req.allow_association) {
          await this.DisassociatePatientAndDeviceTransaction(
            db,
            _req,
            access_token
          );
          _req_people.id = 0;
        }
      }

      if (_req.patient_order_id > 0) {
        /* Check Order already exists or not */
        var patient_order_service = new PatientOrdersService();
        let _patient_order_req = new PatientOrders();
        _patient_order_req.id = _req.patient_order_id;
        var patient_orders = await patient_order_service.select(
          _patient_order_req
        );
        if (patient_orders.length > 0) {
          if (
            patient_orders[0].order_status ==
            PatientOrders.ORDER_STATUS.INPROGRESS_SCHEDULED
          ) {
            let e = new ErrorResponse();
            e.message = `Device is on infusing state`;
            throw e;
          } else {
            patient_orders[0].order_status =
              PatientOrders.ORDER_STATUS.INPROGRESS_SCHEDULED;
            patient_orders[0].device_id = _req_people.device_id;
            await patient_order_service.updateTransaction(
              db,
              patient_orders[0]
            );
          }
        }
      }
      /* Initiate Association */
      _req_people.request_status_identifier =
        DevicePeople.ACTION_RESPONSE.ASSOC_REQ;
      if (_req_people.id > 0) {
        await devicepeople_service.updateForAssociationDisassociationTransaction(
          db,
          _req_people
        );
      } else {
        await devicepeople_service.insertTransaction(db, _req_people);
      }

      /* Request for associate with IV Gateway start*/
      await this.AssociateWithIVGateway(_req, access_token);
      /* Request for associate with IV Gateway end*/

      _req_people.request_status_identifier =
        DevicePeople.ACTION_RESPONSE.ASSOCIATED;
      await devicepeople_service.updateForAssociationDisassociationTransaction(
        db,
        _req_people
      );
    } catch (error) {
      throw error;
    }
    return true;
  }
  public async AssociateWithIVGateway(
    _req: IVGatewayAssociationWrapper,
    access_token: string
  ) {
    try {
      let config: AxiosRequestConfig = {
        headers: {
          Authorization: access_token,
        },
      };
      var url =
        this.environment.IV_GATEWAY_BASEURL +
        this.environment.IV_GATEWAY_ASSOCIATE;
      var post_data: IVGatewayAssociationPOST = new IVGatewayAssociationPOST();
      var associate_valuev1: IVGatewayAssociation.AssociationInfo =
        typeof _req.Value != "string"
          ? _req.Value
          : new IVGatewayAssociation.AssociationInfo();
      // associate_value.association_info.device_info.serial_number = "21766848";
      // associate_value.association_info.device_info.device_name = "HSPR01014C22C00003B146102A01";
      // associate_value.association_info.device_info.type = "PlumA+";
      var device_service = new DevicesService();
      var _device_req = new Devices();
      _device_req.identifier =
        associate_valuev1.association_info.device_info.serial_number;
      _device_req.barcode = _req.Barcode;
      var _device_res = await device_service.select(_device_req);
      if (_device_res.length > 0) {
        post_data.Id = _device_res[0].device_uid;
      }

      var associate_value = _req.Value;
      associate_value.association_info.patient_info.bed =
        associate_value.association_info.patient_info.bed.toString();
      associate_value.association_info.patient_info.room =
        associate_value.association_info.patient_info.room.toString();
      associate_value.association_info.order_info.drug_id =
        associate_value.association_info.order_info.drug_id.toString();
      associate_value.association_info.patient_info.visit_number =
        associate_value.association_info.patient_info.visit_number.toString();

      post_data.TypeId = _req.TypeId;
      // post_data.Id = "HSPR01014C22C00003B146102A01";
      post_data.Barcode = _device_req.identifier;
      post_data.ValueTypeId = _req.ValueTypeId;
      mllp_logger.info("[REQ JSON BEFOR BASE64] ", JSON.stringify(_req));
      post_data.Value = Buffer.Buffer.from(
        JSON.stringify(associate_value)
      ).toString("base64");
      mllp_logger.info("[REQ JSON AFTER BASE64] ", post_data);
      try {
        var ivgateway_resp = await axios.post<ActionRes<any>>(
          url,
          post_data,
          config
        );
        if (_.get(ivgateway_resp.data, "code", 0) != 20000) {
          var e = new ErrorResponse();
          e.code = _.get(ivgateway_resp.data, "code", 0);
          e.message = _.get(ivgateway_resp.data, "response", "");
          throw e;
        }
      } catch (error) {
        let e = error;
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  public async DisassociatePatientAndDevice(
    _req: IVGatewayAssociationWrapper,
    access_token: string
  ): Promise<boolean> {
    try {
      await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.DisassociatePatientAndDeviceTransaction(
          db,
          _req,
          access_token
        );
      });
    } catch (error) {
      throw error;
    }
    return true;
  }
  public async DisassociatePatientAndDeviceTransaction(
    db: DB,
    _req: IVGatewayAssociationWrapper,
    access_token: string
  ): Promise<boolean> {
    try {
      var devicepeople_service = new DevicePeopleService();
      var _req_people: DevicePeopleWrapper = new DevicePeopleWrapper();
      _req_people.device_id = _req.device_id;
      // _req_people.patient_id = _req.patient_id;
      _req_people.user_id = 0;
      _req_people.valid_to = new Date();
      _req_people.modified_on = new Date();
      _req_people.modified_by = 0;
      _req_people.request_status_identifier =
        DevicePeople.ACTION_RESPONSE.DISSOC_REQ;
      //_req_people.request_status_id = _;
      _req_people.is_active = false;
      var resp: Array<DevicePeopleWrapper> =
        await devicepeople_service.getNonDisassociatedDevices(_req_people);
      if (resp.length == 0) {
        var e = new ErrorResponse();
        e.message = `Device ${_req_people.device_id} not associated with any Patient`;
        throw e;
      } else {
        _req_people.patient_order_id = _.defaultTo(resp[0].patient_order_id, 0);
        _req_people.patient_visit_id = _.defaultTo(resp[0].patient_visit_id, 0);
      }

      /* Checking Order status for the device start*/
      var patientorder_service = new PatientOrdersService();
      var _patientorder_req = new PatientOrders();
      _patientorder_req.order_status =
        PatientOrders.ORDER_STATUS.INPROGRESS_SCHEDULED;
      _patientorder_req.device_id = _req.device_id;
      var _patinet_order_result = await patientorder_service.select(
        _patientorder_req
      );
      if (_patinet_order_result.length > 0) {
        var e = new ErrorResponse();
        e.message = `Device is on infusing state`;
        throw e;
      }
      /* Checking Order status for the device end*/

      await devicepeople_service.updateForAssociationDisassociationTransaction(
        db,
        _req_people
      );

      /* Request for disassociate with IV Gateway start*/
      try {
        let config: AxiosRequestConfig = {
          headers: {
            Authorization: access_token,
          },
        };
        var url =
          this.environment.IV_GATEWAY_BASEURL +
          this.environment.IV_GATEWAY_DISASSOCIATE;
        var post_data: IVGatewayAssociationPOST =
          new IVGatewayAssociationPOST();
        post_data.TypeId = _req.TypeId;
        post_data.Barcode = _req.Barcode;
        post_data.Value = "";
        var ivgateway_resp = await axios.post<ActionRes<any>>(
          url,
          post_data,
          config
        );
        if (_.get(ivgateway_resp.data, "code", 0) != 20000) {
          var e = new ErrorResponse();
          e.code = _.get(ivgateway_resp.data, "code", 0);
          e.message = _.get(ivgateway_resp.data, "response", "");
          throw e;
        }
      } catch (error) {
        throw error;
      }
      /* Request for disassociate with IV Gateway end*/

      _req_people.request_status_identifier =
        DevicePeople.ACTION_RESPONSE.DISSOCIATED;
      await devicepeople_service.updateForAssociationDisassociationTransaction(
        db,
        _req_people
      );
    } catch (error) {
      throw error;
    }
    return true;
  }
}
