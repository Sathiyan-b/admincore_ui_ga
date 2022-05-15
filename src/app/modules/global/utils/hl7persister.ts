import * as _ from "lodash";
import { Hl7Result } from "./hl7parser";
import { HL7ObjectService } from "../../alarm/service/hl7object.service";
import { DeviceService } from "../../alarm/service/device.service";

import { DeviceModel } from "../../alarm/models/device.model";
import { PatientModel } from "../../alarm/models/patient.model";
import { PatientVisitModel } from "../../alarm/models/patientvisit.model";
import {
  PatientOrderModel,
  PatientorderForAlarmsWithoutOrder,
  PatientorderCriteriaForAlarmsWithoutOrder
} from "../../alarm/models/patientorder.model";
import { PatientMedicationModel } from "../../alarm/models/patientmedication.model";
import { DeviceObservationModel } from "../../alarm/models/deviceobservation.model";
import { AlarmObservationModel } from "../../alarm/models/alarmobservation.model";
import { GPUtils } from "./gputils";
import { IHEMessagesService } from "../../alarm/service/ihemessages.service";
import { IHEMessagesModel } from "../../alarm/models/ihemessages.model";
import { toNumber } from "lodash";
import { mllp_logger } from "./mllplogger";

export class Hl7Persister {
  async Persist(hl7result: string): Promise<AlarmObservationModel> {
    4;
    const TAG = "[HL7 PERSISTER]\t ";
    // let result: boolean = false;
    let result: AlarmObservationModel = new AlarmObservationModel();
    var _gputils: GPUtils = new GPUtils();
    var hl7object = new Hl7Result();
    var hl7_parsed_result = await hl7object.Parse(hl7result);
    //
    var _patient_Key: string = "",
      _visit_key: string = "",
      _order_key: string = "",
      _medication_key: string = "";
    //
    var _patient_id: number = 0,
      _patient_visit_id: number = 0;
    var _patient_order_id: number = 0,
      _patient_medication_id: number = 0;
    var _device_obs_id: number = 0,
      _alarm_obs_id: number = 0;
    // Initialization for Model objects
    var _device_data: DeviceModel = new DeviceModel();
    var _patient_data: PatientModel = new PatientModel();
    var _patient_visit_data: PatientVisitModel = new PatientVisitModel();
    var _patient_order_data: PatientOrderModel = new PatientOrderModel();
    var _patient_order_for_alarm: PatientorderForAlarmsWithoutOrder = new PatientorderForAlarmsWithoutOrder();
    var _patient_alarm_data_without_order = {} as PatientorderForAlarmsWithoutOrder;
    var _patient_medication_data = {} as PatientMedicationModel;
    var _device_obs_data: DeviceObservationModel = new DeviceObservationModel();
    var _alarm_obs_data: AlarmObservationModel = new AlarmObservationModel();
    // For all Service Objects except Device
    var hl7_service: HL7ObjectService = new HL7ObjectService();
    // _devicecriteria.name = result.DeviceID;
    var _device_name: string = "";
    var _device_serial_id: string = "";
    var _device_type: string = "",
      _device_sub_type: string = "";
    // storing the received IHE HL7 message - begins
    var _device_service: DeviceService = new DeviceService();
    var _device_id: number = -1;
    var _ihemessagepersist = new IHEMessagesService();
    var _ihemessages_id = await _ihemessagepersist.insertIHEMessages(
      hl7result,
      hl7_parsed_result
    );
    mllp_logger.info(TAG + "new IHE messages inserted result", hl7result);
    mllp_logger.info(
      TAG + "new IHE messages inserted parsed result ",
      hl7_parsed_result
    );

    var _message_type =
      hl7_parsed_result.msh != null &&
      hl7_parsed_result.msh.messagetype != null &&
      hl7_parsed_result.msh.messagetype.messagecode != null
        ? hl7_parsed_result.msh.messagetype.messagecode
        : "";
    var _message_profile_identifier =
      hl7_parsed_result.msh.messageprofileidentifier != null
        ? hl7_parsed_result.msh.messageprofileidentifier.entityidentifier
        : "";
    if (
      _message_profile_identifier == "" ||
      _message_profile_identifier.length == 0
    ) {
      _message_profile_identifier =
        hl7_parsed_result.msh.messagetype != null &&
        hl7_parsed_result.msh.messagetype.messagecode != null
          ? hl7_parsed_result.msh.messagetype.messagecode
          : "";
    }
    // storing the received IHE HL7 message - ends
    /* if (hl7_parsed_result.msh.messageprofileidentifier.entityidentifier == "IHE_PCD_RGV_O15") {
            _device_name = (hl7_parsed_result.obx != null && hl7_parsed_result.obx[0] != null &&
                hl7_parsed_result.obx[0].equipmentinstanceidentifer != null &&
                hl7_parsed_result.obx[0].equipmentinstanceidentifer.entityidentifier.length > 0 ? hl7_parsed_result.obx[0].equipmentinstanceidentifer.entityidentifier : "");
            //                
            _device_serial_id =
                (hl7_parsed_result.obx != null && hl7_parsed_result.obx[0] != null &&
                    hl7_parsed_result.obx[0].observationsubid != null &&
                    hl7_parsed_result.obx[0].observationsubid.length > 0 ? hl7_parsed_result.obx[0].observationsubid : "");
        }
        else {
            _device_name = (hl7_parsed_result.obx != null && hl7_parsed_result.obx[5] != null &&
                hl7_parsed_result.obx[5].equipmentinstanceidentifier != null &&
                hl7_parsed_result.obx[5].equipmentinstanceidentifier.length > 0 ? hl7_parsed_result.obx[5].equipmentinstanceidentifier : "");
            //
            _device_serial_id =
                (hl7_parsed_result.obx != null && hl7_parsed_result.obx[5] != null &&
                    hl7_parsed_result.obx[5].observationsubid != null &&
                    hl7_parsed_result.obx[5].observationsubid.length > 0 ? hl7_parsed_result.obx[5].observationsubid : "");
        } */

    if (_message_type != null && _message_type.length > 0) {
      if (
        hl7_parsed_result.msh.messagetype.triggerevent == "R42" ||
        hl7_parsed_result.msh.messagetype.triggerevent == "R40"
      ) {
        if (
          hl7_parsed_result != null &&
          hl7_parsed_result.obx != null &&
          hl7_parsed_result.obx[2] != null
        ) {
          /* _device_serial_id = hl7_parsed_result.obx[2].observationsubid != null &&
                        hl7_parsed_result.obx[2].observationsubid.length > 0 ? hl7_parsed_result.obx[2].observationsubid : ""; */
          _device_serial_id =
            hl7_parsed_result.obx[2].equipmentinstanceidentifier;
          _device_name = hl7_parsed_result.obx[2].equipmentinstanceidentifier;
          _device_type = "Infusion Pumps";
          _device_sub_type = hl7_parsed_result.obx[2].infusertype;
          // _device_sub_type = _device_sub_type.substring(_device_sub_type.indexOf("="), _device_sub_type.length);
          // Models.Devices devices = devicesDataService.Find(message.key,result.DeviceID);
          _device_id = await _device_service.getDeviceBySerialID(
            _device_serial_id
          );
          if (_device_id == 0) {
            var _device_data_array: Array<DeviceModel> = new Array<
              DeviceModel
            >();
            _device_data.device_name = _device_name;
            _device_data.device_serial_id = _device_serial_id;
            _device_data.device_type = _device_type;
            _device_data.device_sub_type = _device_sub_type;
            _device_data.created_on = new Date();
            _device_data.is_active = true;
            _device_data_array.push(_device_data);
            _device_data_array = await _device_service.createInBulk(
              _device_data_array
            );
            //
            _device_id = _device_data_array[0].id;
          }
        }
      }
    }
    try {
      if (hl7_parsed_result.pid != null) {
        // Generate Hash Key Patient data for Uniqueness
        var _pat_key_input: string =
          hl7_parsed_result.pid.patientidentifierlist.idnumber;
        // _patient_Key = await _gputils.HashCode(_pat_key_input);
        _patient_Key = await _gputils.HashCode(
          hl7_parsed_result.pid.patientidentifierlist.idnumber
        );
        //
        // _patient_id = await hl7_service.findPatientByKey(_patient_Key);
        console.log(
          "Searched Patient ID: " +
            hl7_parsed_result.pid.patientidentifierlist.idnumber
        );
        _patient_id = await hl7_service.findPatientByPatientID(
          hl7_parsed_result.pid.patientidentifierlist.idnumber
        );
        if (_patient_id <= 0) {
          _patient_data.ihe_msg_id = _ihemessages_id;
          _patient_data.key = _patient_Key;
          _patient_data.is_active = true;
          _patient_data.version = 1;
          _patient_data.created_on = new Date();
          _patient_data.patient_id_type =
            hl7_parsed_result.pid.patientidentifierlist.identifiertypecode;
          _patient_data.patient_id =
            hl7_parsed_result.pid.patientidentifierlist.idnumber;
          _patient_data.gender = hl7_parsed_result.pid.administractivesex;
          _patient_data.given_name =
            hl7_parsed_result.pid.patientname.givenname;
          _patient_data.family_name =
            hl7_parsed_result.pid.patientname.familyname;
          _patient_data.patient_id_authority =
            hl7_parsed_result.pid.patientidentifierlist.assigningauthority;
          _patient_data.name_type =
            hl7_parsed_result.pid.patientname.nametypecode;
          _patient_data.date_of_birth =
            hl7_parsed_result.pid.datetimeofbirth != null &&
            hl7_parsed_result.pid.datetimeofbirth.length > 0
              ? _gputils.FromHL7Date(hl7_parsed_result.pid.datetimeofbirth)
              : new Date();
          _patient_id = await hl7_service.savePatientData(_patient_data);
          if (_patient_id > 0) {
            var _patient_identifier_id = await hl7_service.savePatientIdentifierData(
              _patient_id,
              _patient_data.patient_id_type,
              _patient_data.patient_id
            );
          }
          // mllp_logger.info(TAG+ "new Patient inserted ",_patient_data)
        }
      }
      //
      if (hl7_parsed_result.pv1 != null) {
        var _pat_visit_key_input: string =
          _patient_Key +
          // hl7_parsed_result.pv1.visitnumber +
          hl7_parsed_result.pv1.assignedpatientlocation.nursingunit +
          hl7_parsed_result.pv1.assignedpatientlocation.room +
          hl7_parsed_result.pv1.assignedpatientlocation.bed +
          hl7_parsed_result.pv1.visitnumber +
          _patient_id.toString();
        _visit_key = await _gputils.HashCode(_pat_visit_key_input);
        //
        // _patient_visit_id = await hl7_service.findPatientVisitByKey(_patient_id, _visit_key);
        _patient_visit_id = await hl7_service.findPatientVisitByVisitAttributes(
          _patient_id,
          hl7_parsed_result.pv1.assignedpatientlocation.nursingunit,
          hl7_parsed_result.pv1.assignedpatientlocation.room,
          hl7_parsed_result.pv1.assignedpatientlocation.bed,
          hl7_parsed_result.pv1.visitnumber
        );
        if (_patient_visit_id <= 0) {
          _patient_visit_data.ihe_msg_id = _ihemessages_id;
          _patient_visit_data.key = _visit_key;
          _patient_visit_data.is_active = true;
          _patient_visit_data.version = 1;
          _patient_visit_data.created_on = new Date();
          _patient_visit_data.patient_class =
            hl7_parsed_result.pv1.patientclass;
          _patient_visit_data.nursing_unit =
            hl7_parsed_result.pv1.assignedpatientlocation.nursingunit;
          _patient_visit_data.room =
            hl7_parsed_result.pv1.assignedpatientlocation.room;
          _patient_visit_data.bed =
            hl7_parsed_result.pv1.assignedpatientlocation.bed;
          _patient_visit_data.facility =
            hl7_parsed_result.pv1.assignedpatientlocation.facility;
          _patient_visit_data.building =
            hl7_parsed_result.pv1.assignedpatientlocation.building;
          _patient_visit_data.floor =
            hl7_parsed_result.pv1.assignedpatientlocation.floor;
          _patient_visit_data.patient_id = _patient_id;
          _patient_visit_data.attending_doctor_id =
            hl7_parsed_result.pv1.attendingdoctor.idnumber;
          _patient_visit_data.attending_doctor_given_name =
            hl7_parsed_result.pv1.attendingdoctor.givenname;
          _patient_visit_data.attending_doctor_family_name =
            hl7_parsed_result.pv1.attendingdoctor.familyname;
          // _patient_visit_data.location_id = devices.locationid;
          _patient_visit_data.device_id = _device_id;
          //_patient_visit_data.organizationid = devices.organizationid;
          _patient_visit_data.visit_number = hl7_parsed_result.pv1.visitnumber;
          _patient_visit_data.admission_on =
            hl7_parsed_result.pv1.admissiondatetime != null &&
            hl7_parsed_result.pv1.admissiondatetime.length > 0
              ? _gputils.FromHL7Date(hl7_parsed_result.pv1.admissiondatetime)
              : new Date();
          _patient_visit_id = await hl7_service.savePatientVisitData(
            _patient_visit_data
          );
          // mllp_logger.info(TAG+ " new Patient visit inserted ",_patient_visit_data)
        }
      }
    } catch (hl7_PID_PV1_Error) {
      // result = false;
      var err = hl7_PID_PV1_Error;
      throw hl7_PID_PV1_Error;
    }
    try {
      //
      if (_message_type != null && _message_type == "RDS") {
        if (
          hl7_parsed_result.orc != null &&
          hl7_parsed_result.orc.ordercontrol != null &&
          hl7_parsed_result.orc.ordercontrol.length > 0
        ) {
          // block for Medication & Order entry begins
          if (
            hl7_parsed_result.rds != null &&
            hl7_parsed_result.rds.rxc != null
          ) {
            for (
              var _meds_count = 0;
              _meds_count < hl7_parsed_result.rds.rxc.length;
              _meds_count++
            ) {
              var _medication_key_input: string =
                _patient_Key +
                _visit_key +
                hl7_parsed_result.orc.placeordernumber.entityidentifier;
              /* + (hl7_parsed_result.orc.datetimeoforder != null? hl7_parsed_result.orc.datetimeoforder: "" )+ 
                                    hl7_parsed_result.rds.rxc[_meds_count].component_code_identifier + 
                                    hl7_parsed_result.rds.rxc[_meds_count].component_code_text; */
              _medication_key = await _gputils.HashCode(_medication_key_input);
              _patient_medication_id = await hl7_service.findPatientMedicationByKey(
                _patient_id,
                _patient_visit_id,
                _medication_key
              );
              if (_patient_medication_id <= 0) {
                _patient_medication_data = new PatientMedicationModel();
                _patient_medication_data.ihe_msg_id = _ihemessages_id;
                _patient_medication_data.key = _medication_key;
                _patient_medication_data.patient_id = _patient_id;
                _patient_medication_data.patient_visit_id = _patient_visit_id;
                _patient_medication_data.prescribed_on =
                  hl7_parsed_result.orc != null &&
                  hl7_parsed_result.orc.datetimeoforder != null
                    ? _gputils.FromHL7Date(
                        hl7_parsed_result.orc.datetimeoforder
                      )
                    : new Date();
                _patient_medication_data.is_active = true;
                _patient_medication_data.created_on = new Date();
                _patient_medication_data.drug_type =
                  hl7_parsed_result.rds.rxc[_meds_count].component_type;
                // _patient_medication_data.device_id = _device_id;
                // _patient_medication_data.patient_order_id = _patient_order_id;
                if (
                  hl7_parsed_result.rds.rxc[_meds_count] != null &&
                  hl7_parsed_result.rds.rxc[_meds_count]
                    .component_code_identifier != null
                ) {
                  _patient_medication_data.drug_code =
                    hl7_parsed_result.rds.rxc[
                      _meds_count
                    ].component_code_identifier;
                }
                if (
                  hl7_parsed_result.rds.rxc[_meds_count] != null &&
                  hl7_parsed_result.rds.rxc[_meds_count].component_code_text !=
                    null
                ) {
                  _patient_medication_data.drug_name =
                    hl7_parsed_result.rds.rxc[_meds_count].component_code_text;
                }
                _patient_medication_data.dispense_code =
                  hl7_parsed_result.rds.rxd.dispense_code;
                _patient_medication_data.prescription_number =
                  hl7_parsed_result.rds.rxd.prescription_number;
                if (_patient_medication_data.drug_type == "A") {
                  _patient_medication_data.strength = toNumber(
                    hl7_parsed_result.rds.rxc[_meds_count].component_qty
                  );
                  _patient_medication_data.strength_unit_name =
                    hl7_parsed_result.rds.rxc[_meds_count].component_units_text;
                } else {
                  _patient_medication_data.volume_tbi = toNumber(
                    hl7_parsed_result.rds.tq.quantity
                  );
                  _patient_medication_data.volume_unit_name =
                    hl7_parsed_result.rds.tq.quantity_unit;
                }
                _patient_medication_data.strength = toNumber(
                  hl7_parsed_result.rds.rxc[_meds_count].component_qty
                );
                _patient_medication_data.strength_unit_name =
                  hl7_parsed_result.rds.rxc[_meds_count].component_units_text;
                _patient_medication_data.time_expected = toNumber(
                  hl7_parsed_result.rds.tq.occurrence
                );
                _patient_medication_data.time_unit_name =
                  hl7_parsed_result.rds.tq.occurrence_unit;
                _patient_medication_data.route_id =
                  hl7_parsed_result.rds.rxr.route.identifier;
                _patient_medication_data.route_text =
                  hl7_parsed_result.rds.rxr.route.text;
                //
                _patient_medication_data.action_by_id =
                  hl7_parsed_result.orc.actionby.idnumber;
                _patient_medication_data.action_by_family_name =
                  hl7_parsed_result.orc.actionby.familyname;
                _patient_medication_data.action_by_given_name =
                  hl7_parsed_result.orc.actionby.givenname;
                //
                _patient_medication_id = await hl7_service.savePatientMedicationData(
                  _patient_medication_data
                );
                // mllp_logger.info(TAG+ "new Patient Medication inserted ",_patient_medication_data)
              } else {
                await hl7_service.updatePatientMedicationData(
                  _patient_medication_data
                );
              }
            }
          }
          // block for Medication & Order entry ends
        }
      } else if (_message_type != null && _message_type == "RAS") {
        // If Medication Insert is success, then insert Order entry with vase and update the same for Additives
        // block for Order entry begins
        var _medication_key_input: string =
          _patient_Key +
          _visit_key +
          hl7_parsed_result.orc.placeordernumber.entityidentifier;
        _medication_key = await _gputils.HashCode(_medication_key_input);
        _patient_medication_id = await hl7_service.findPatientMedicationByKey(
          _patient_id,
          _patient_visit_id,
          hl7_parsed_result.orc.placeordernumber.entityidentifier
        );
        if (_patient_medication_id != null && _patient_medication_id > 0) {
          var _order_key_input: string =
            _patient_Key +
            _visit_key +
            hl7_parsed_result.orc.placeordernumber.entityidentifier +
            hl7_parsed_result.ras.rxa.administration_start_time;
          _order_key = await _gputils.HashCode(_order_key_input);
          _patient_order_id = await hl7_service.findPatientOrderByKey(
            _patient_id,
            _patient_visit_id,
            _order_key
          );
          //
          if (_patient_order_id <= 0) {
            _patient_order_data.ihe_msg_id = _ihemessages_id;
            _patient_order_data.key = _order_key;
            _patient_order_data.patient_id = _patient_id;
            _patient_order_data.patient_visit_id =
              _patient_visit_id != null ? _patient_visit_id : -1;
            _patient_order_data.patient_medication_id =
              _patient_medication_id != null ? _patient_medication_id : -1;
            _patient_order_data.medication_base_id =
              _patient_medication_id != null ? _patient_medication_id : -1;
            _patient_order_data.medication_additive_id = 0;
            //
            _patient_order_data.volume_tbi = toNumber(
              hl7_parsed_result.rds.tq.quantity
            );
            if (hl7_parsed_result.rds.tq.quantity_unit.indexOf("&") > 0) {
              var quantity_unit = hl7_parsed_result.rds.tq.quantity_unit.split(
                "&"
              );
              _patient_order_data.volume_unit_code =
                quantity_unit != null ? quantity_unit[0] : "";
              _patient_order_data.volume_unit_name =
                quantity_unit != null ? quantity_unit[1] : "";
            }
            //_patient_order_data.volume_unit_system = _patient_medication_data.volume_unit_system;
            //
            _patient_order_data.concentration = toNumber(
              hl7_parsed_result.ras.rxa.administered_qty
            );
            _patient_order_data.concentration_unit =
              hl7_parsed_result.ras.rxa.administered_units_text;
            _patient_order_data.concentration_final = toNumber(
              hl7_parsed_result.ras.rxa.administered_qty
            );
            _patient_order_data.concentration_final_unit =
              hl7_parsed_result.ras.rxa.administered_units_text;
            _patient_order_data.strength = toNumber(
              hl7_parsed_result.ras.rxa.administered_qty
            );
            _patient_order_data.strength_unit_name =
              hl7_parsed_result.ras.rxa.administered_units_text;
            _patient_order_data.time_expected = toNumber(
              hl7_parsed_result.rds.tq.occurrence
            );
            _patient_order_data.time_unit_name =
              hl7_parsed_result.rds.tq.occurrence_unit;
            //
            _patient_order_data.is_active = true;
            _patient_order_data.order_status =
              hl7_parsed_result.orc != null
                ? hl7_parsed_result.orc.orderstatus
                : "";
            _patient_order_data.created_on = new Date();
            _patient_order_data.device_id =
              _device_id != null ? _device_id : -1;
            _patient_order_data.ordering_provider_id =
              hl7_parsed_result.orc != null
                ? hl7_parsed_result.orc.orderingprovider.idnumber
                : "";
            _patient_order_data.ordering_provider_family_name =
              hl7_parsed_result.orc != null
                ? hl7_parsed_result.orc.orderingprovider.familyname
                : "";
            _patient_order_data.ordering_provider_given_name =
              hl7_parsed_result.orc != null
                ? hl7_parsed_result.orc.orderingprovider.givenname
                : "";
            _patient_order_data.ordered_on =
              hl7_parsed_result.ras.rxa.administration_start_time != null &&
              hl7_parsed_result.ras.rxa.administration_start_time.length > 0
                ? _gputils.FromHL7Date(
                    hl7_parsed_result.ras.rxa.administration_start_time
                  )
                : new Date();
            _patient_order_data.order_id =
              hl7_parsed_result.orc.placeordernumber.entityidentifier;
            _patient_order_data.order_type =
              hl7_parsed_result.orc.placeordernumber.namespacesid;
            // _patient_order_data. = hl7_parsed_result.orc.placeordernumber.namespacesid;
            _patient_order_data.diluent =
              hl7_parsed_result.ras.rxa.administered_diluent_amount;
            _patient_order_data.diluent_unit =
              hl7_parsed_result.ras.rxa.administered_diluent_unit;
            _patient_order_data.rate =
              hl7_parsed_result.ras.rxa.administered_rate;
            _patient_order_data.rate_unit_name =
              hl7_parsed_result.ras.rxa.administered_rate_unit;
            _patient_order_data.dose =
              hl7_parsed_result.ras.rxa.administered_dose;
            _patient_order_data.dose_unit_name =
              hl7_parsed_result.ras.rxa.administered_dose_unit;
            _patient_order_id = await hl7_service.savePatientOrderData(
              _patient_order_data
            );
            // mllp_logger.info(TAG+ "new Patient Order inserted ",_patient_order_data)
          } else {
            _patient_order_data.id = _patient_order_id;
            // _patient_order_data.medication_additive_id = _patient_medication_id != null ? _patient_medication_id : -1;
            // _patient_order_data.medication_base_id = 0;
            if (_patient_medication_data.drug_type == "B") {
              _patient_order_data.medication_base_id =
                _patient_medication_id != null ? _patient_medication_id : -1;
              _patient_order_data.medication_additive_id = 0;
              _patient_order_data.volume_tbi =
                _patient_medication_data.volume_tbi;
              _patient_order_data.volume_unit_code =
                _patient_medication_data.volume_unit_code;
              _patient_order_data.volume_unit_name =
                _patient_medication_data.volume_unit_name;
              _patient_order_data.volume_unit_system =
                _patient_medication_data.volume_unit_system;
            } else if (_patient_medication_data.drug_type == "A") {
              _patient_order_data.medication_additive_id =
                _patient_medication_id != null ? _patient_medication_id : -1;
              _patient_order_data.medication_base_id = 0;
              _patient_order_data.strength = _patient_medication_data.strength;
              _patient_order_data.strength_unit_code =
                _patient_medication_data.strength_unit_code;
              _patient_order_data.strength_unit_name =
                _patient_medication_data.strength_unit_name;
              _patient_order_data.strength_unit_system =
                _patient_medication_data.strength_unit_system;
            }
            _patient_order_id = await hl7_service.updatePatientOrderWithAdditives(
              _patient_order_data
            );
          }
        }
      } else if (hl7_parsed_result.obr != null) {
        if (
          hl7_parsed_result.obr.universalserviceidentifier != null &&
          hl7_parsed_result.obr.universalserviceidentifier.text !=
            "MDC_EVT_ALARM"
        ) {
          var _order_identifier = "";
          if (
            hl7_parsed_result.obr.placeordernumber != null &&
            hl7_parsed_result.obr.placeordernumber.entityidentifier != null &&
            hl7_parsed_result.obr.placeordernumber.entityidentifier.length > 0
          ) {
            _order_identifier =
              hl7_parsed_result.obr.placeordernumber.entityidentifier;
          }
          var _order_key_input: string =
            _patient_Key +
            _visit_key +
            hl7_parsed_result.obr.placeordernumber.entityidentifier;
          // + hl7_parsed_result.obr.placeordernumber.entityidentifier;
          _order_key = await _gputils.HashCode(_order_key_input);
          //
          if (_order_identifier.length > 0 && _order_identifier != "NO_ORDER") {
            _patient_order_id = await hl7_service.findPatientOrderByOrderCode(
              _patient_id,
              _patient_visit_id,
              _order_identifier
            );
          } else {
            _patient_order_id = await hl7_service.findPatientOrderByKey(
              _patient_id,
              _patient_visit_id,
              _order_key
            );
          }
          if (_patient_order_id <= 0) {
            _patient_order_data.ihe_msg_id = _ihemessages_id;
            _patient_order_data.key = _order_key;
            _patient_order_data.is_active = true;
            _patient_order_data.version = 1;
            _patient_order_data.created_on = new Date();
            _patient_order_data.patient_id = _patient_id;
            // _patient_order_data.locationid = devices.locationid;
            // _patient_order_data.organizationid = devices.organizationid;
            _patient_order_data.device_id = _device_id;
            _patient_order_data.order_id =
              hl7_parsed_result.obr.universalserviceidentifier.text !=
              "MDC_EVT_ALARM"
                ? hl7_parsed_result.obr.placeordernumber.entityidentifier
                : "";
            //_patient_order_data.message_time = _gputils.FromHL7Date(hl7_parsed_result.obr.observationdatetime);
            _patient_order_data.order_universal_id =
              hl7_parsed_result.obr.placeordernumber.universalid;
            _patient_order_data.patient_visit_id = _patient_visit_id;
            //
            _patient_order_id = await hl7_service.savePatientOrderData(
              _patient_order_data
            );
            mllp_logger.info(
              TAG + "new Patient Order inserted ",
              _patient_order_data
            );

            if (_patient_order_id > 0) {
              var _medication_key_input: string = _order_key;
              _medication_key = await _gputils.HashCode(_medication_key_input);
              //
              _patient_medication_id = await hl7_service.findPatientMedicationByKey(
                _patient_id,
                _patient_visit_id,
                _medication_key
              );
              if (_patient_medication_id <= 0) {
                _patient_medication_data.ihe_msg_id = _ihemessages_id;
                _patient_medication_data.id = _patient_medication_id;
                _patient_medication_data.is_active = true;
                _patient_medication_data.version = 1;
                _patient_medication_data.created_on = new Date();
                // _patient_medication_data.message_time = _gputils.FromHL7Date(hl7_parsed_result.obr.observationdatetime);
                _patient_medication_data.key = _medication_key;
                _patient_medication_data.patient_id = _patient_id;
                // _patient_medication_data.locationid = devices.locationid;
                _patient_medication_data.device_id = _device_id;
                //_patient_medication_data.organizationid = devices.organizationid;
                _patient_medication_data.patient_order_id = _patient_order_id;
                _patient_medication_data.patient_visit_id = _patient_visit_id;
                if (
                  _patient_medication_data.drug_code != null &&
                  _patient_medication_data.drug_code.length == 0
                ) {
                  _patient_medication_data.drug_code =
                    hl7_parsed_result.obr.universalserviceidentifier.identifier;
                }
                if (
                  _patient_medication_data.drug_name != null &&
                  _patient_medication_data.drug_name.length == 0
                ) {
                  _patient_medication_data.drug_name =
                    hl7_parsed_result.obr.universalserviceidentifier.text;
                }
                _patient_medication_id = await hl7_service.savePatientMedicationData(
                  _patient_medication_data
                );
                mllp_logger.info(
                  TAG + "new Patient Medication inserted ",
                  _patient_medication_data
                );
              } else {
                await hl7_service.updatePatientMedicationData(
                  _patient_medication_data
                );
              }
            }
          }
          // medicationkey = HashCode(patientKey, hl7_parsed_result.obr.placeordernumber.entityidentifier);
        } else {
          /* PUMP IDLE & ALARMS handling. Need to find out PatientOrder & MedicationID so that the records get saved with 
                    these IDs, than with a -1 which cannot be tagged to which Order they were part of.
                    Code to find out what is the latest Patient Order Entry, is conjunction with Device Osbervation. 
                    That PatientOrder & PatientMedication IDs should be assigned here, which shall go into the 
                    DeviceObservation record.*/
          var _order_identifier = "";
          if (
            hl7_parsed_result.obr.placeordernumber != null &&
            hl7_parsed_result.obr.placeordernumber.entityidentifier != null &&
            hl7_parsed_result.obr.placeordernumber.entityidentifier.length > 0
          ) {
            _order_identifier =
              hl7_parsed_result.obr.placeordernumber.entityidentifier;
          }
          if (_order_identifier.length > 0 && _order_identifier != "NO_ORDER") {
            _patient_order_id = await hl7_service.findPatientOrderByOrderCode(
              _patient_id,
              _patient_visit_id,
              _order_identifier
            );
          } else {
            var oparam: PatientorderCriteriaForAlarmsWithoutOrder = new PatientorderCriteriaForAlarmsWithoutOrder();
            oparam.patient_id = _patient_id;
            oparam.patient_visit_id = _patient_visit_id;
            oparam.device_id = _device_id;
            oparam.device_serial_id = _device_serial_id;
            // oparam.organizationid = patient.organizationid;
            // oparam.locationid = patient.locationid;
            _patient_alarm_data_without_order = await hl7_service.findOrderIDForAlarmsWithoutOrder(
              oparam
            );
          }
        }
      }
      if (
        hl7_parsed_result.rxg != null &&
        Object.keys(hl7_parsed_result.rxg).length != 0
      ) {
        var _medication_key_input: string = _order_key;
        _medication_key = await _gputils.HashCode(_medication_key_input);
        _patient_medication_id = await hl7_service.findPatientMedicationByKey(
          _patient_id,
          _patient_visit_id,
          _medication_key
        );
        if (_patient_medication_id <= 0) {
          _patient_medication_data.ihe_msg_id = _ihemessages_id;
          _patient_medication_data.rate = parseFloat(
            hl7_parsed_result.rxg.giverateamount
          );
          _patient_medication_data.rate_unit_code =
            hl7_parsed_result.rxg.giverateunits.identifier;
          _patient_medication_data.rate_unit_name =
            hl7_parsed_result.rxg.giverateunits.alternatetext;
          _patient_medication_data.dose = parseInt(
            hl7_parsed_result.rxg.giverateamount
          );
          _patient_medication_data.dose_unit_code =
            hl7_parsed_result.rxg.giverateunits.identifier;
          _patient_medication_data.dose_unit_name =
            hl7_parsed_result.rxg.giverateunits.alternatetext;
          _patient_medication_data.volume_tbi = parseFloat(
            hl7_parsed_result.rxg.giveamountminimum
          );
          _patient_medication_data.volume_unit_code =
            hl7_parsed_result.rxg.giveunits.identifier;
          _patient_medication_data.volume_unit_name =
            hl7_parsed_result.rxg.giveunits.alternatetext;
          _patient_medication_data.strength = parseFloat(
            hl7_parsed_result.rxg.givedrugstrengthvolume
          );
          _patient_medication_data.strength_unit_code =
            hl7_parsed_result.rxg.givedrugstrengthvolumeunits.identifier;
          _patient_medication_data.strength_unit_name =
            hl7_parsed_result.rxg.givedrugstrengthvolumeunits.alternatetext;
          // _patient_medication_dataDataService.Update(_patient_medication_data);
          _patient_medication_data.is_active = true;
          _patient_medication_data.version = 1;
          _patient_medication_data.created_on = new Date();
          _patient_medication_data.message_time =
            hl7_parsed_result.orc.datetimeoftransaction != null &&
            hl7_parsed_result.orc.datetimeoftransaction.length > 0
              ? _gputils.FromHL7Date(
                  hl7_parsed_result.orc.datetimeoftransaction
                )
              : new Date();
          _patient_medication_data.key = _medication_key;
          _patient_medication_data.patient_id = _patient_id;
          // _patient_medication_data.locationid = devices.locationid;
          _patient_medication_data.device_id = _device_id;
          //_patient_medication_data.organizationid = devices.organizationid;
          _patient_medication_data.patient_order_id = _patient_order_id;
          _patient_medication_data.patient_visit_id = _patient_visit_id;
          _patient_medication_data.drug_code =
            hl7_parsed_result.rxg.givecode.identifier;
          _patient_medication_data.drug_name =
            hl7_parsed_result.rxg.givecode.text;
          _patient_medication_id = await hl7_service.savePatientMedicationData(
            _patient_medication_data
          );
          mllp_logger.info(
            TAG + "new Patient Medication inserted ",
            _patient_medication_data
          );

          // hl7_service.updatePatientMedicationData(_patient_medication_data);
        }
      }
      // if (hl7_parsed_result.msh.messageprofileidentifier.entityidentifier != "IHE_PCD_RGV_O15" &&
      var skip_result: boolean = false;

      if (_message_type != null && _message_type.length > 0) {
        if (
          (hl7_parsed_result.msh.messagetype.triggerevent == "R42" ||
            hl7_parsed_result.msh.messagetype.triggerevent == "R40") &&
          (hl7_parsed_result.obr != null || hl7_parsed_result.obx != null)
        ) {
          if (hl7_parsed_result.obr != null) {
            _device_obs_data.is_active = true;
            _device_obs_data.version = 1;
            _device_obs_data.patient_id = _patient_id;
            _device_obs_data.patient_visit_id = _patient_visit_id;
            // _device_obs_data.patient_medication_id = _patient_medication_id;
            if (
              hl7_parsed_result.obr.universalserviceidentifier != null &&
              hl7_parsed_result.obr.universalserviceidentifier.text.length >
                0 &&
              hl7_parsed_result.obr.universalserviceidentifier.text !=
                "MDC_EVT_ALARM"
            ) {
              _device_obs_data.patient_order_id = _patient_order_id;
              _device_obs_data.patient_medication_id = _patient_medication_id;
            } else {
              if (
                _patient_alarm_data_without_order != null &&
                _patient_alarm_data_without_order.patient_order_id > 0
              ) {
                _device_obs_data.patient_order_id =
                  _patient_alarm_data_without_order != null
                    ? _patient_alarm_data_without_order.patient_order_id
                    : -1;
                _device_obs_data.patient_medication_id =
                  _patient_alarm_data_without_order != null
                    ? _patient_alarm_data_without_order.patient_medication_id
                    : -1;
              } else {
                _device_obs_data.patient_order_id = _patient_order_id;
              }
            }
            // _device_obs_data.locationid = devices.locationid;
            // _device_obs_data.organizationid = devices.organizationid;
            _device_obs_data.device_id = _device_id;
            _device_obs_data.created_on = new Date();
            // _device_obs_data.messagetime = hl7_parsed_result.obr.observationdatetime.FromHL7Date();
            if (
              hl7_parsed_result.obr.observationdatetime != null &&
              hl7_parsed_result.obr.observationdatetime.length > 0
            )
              _device_obs_data.received_on = _gputils.FromHL7Date(
                hl7_parsed_result.obr.observationdatetime
              );

            if (hl7_parsed_result.obx != null) {
              for (
                var i = 0;
                i < hl7_parsed_result.obx.length && !skip_result;
                i++
              ) {
                switch (hl7_parsed_result.obx[i].observationidtifier.text) {
                  case "MDC_EVT_ALARM":
                    _alarm_obs_data.patient_id = _patient_id;
                    _alarm_obs_data.patient_visit_id = _patient_visit_id;
                    _alarm_obs_data.patient_order_id =
                      _device_obs_data.patient_order_id;
                    _alarm_obs_data.patient_medication_id =
                      _device_obs_data.patient_medication_id;
                    _alarm_obs_data.is_active = true;
                    _alarm_obs_data.version = 1;
                    // _alarm_obs_data.locationid = devices.locationid;
                    // _alarm_obs_data.organizationid = devices.organizationid;
                    _alarm_obs_data.device_id = _device_id;
                    _alarm_obs_data.device_name =
                      hl7_parsed_result.obx[i].equipmentinstanceidentifier;
                    // _alarm_obs_data.device_id = hl7_parsed_result.obx[i].equipmentinstanceidentifier;
                    _alarm_obs_data.alarm_type =
                      hl7_parsed_result.obx[i].observationvaluelist[1];
                    _alarm_obs_data.alarm_type_desc =
                      hl7_parsed_result.obx[i].observationvaluelist[8];
                    // _alarm_obs_data.observations = new ();
                    // _alarm_obs_data.observations.text = hl7_parsed_result.obx[i].observationvaluelist[8];
                    break;
                  case "MDC_ATTR_ALERT_SOURCE":
                    /* if (string.IsNullOrEmpty(_alarm_obs_data.device_id))
                                            _alarm_obs_data.device_id = hl7_parsed_result.obx[i].observationvalue; */
                    break;
                  case "MDC_ATTR_EVENT_PHASE":
                    _alarm_obs_data.event_phase =
                      hl7_parsed_result.obx[i].observationvalue;
                    break;
                  case "MDC_DEV_PUMP_SOURCE_CHANNEL_LABEL":
                    _device_obs_data.device_name =
                      hl7_parsed_result.obx[i].equipmentinstanceidentifier;
                    _device_obs_data.device_channel =
                      hl7_parsed_result.obx[i].observationvaluelist[0];
                    // patientmedication.device_id = hl7_parsed_result.obx[i].equipmentinstanceidentifier;
                    // patientmedication.device_system = hl7_parsed_result.obx[i].observationvaluelist[0];
                    break;
                  case "MDC_ATTR_ALARM_STATE":
                    _alarm_obs_data.alarm_status =
                      hl7_parsed_result.obx[i].observationvalue;
                    break;
                  case "MDC_DEV_PUMP_CURRENT_DELIVERY_STATUS":
                    _device_obs_data.delivery_status =
                      hl7_parsed_result.obx[i].observationvaluelist[1];
                    break;
                  case "MDC_VOL_FLUID_TBI":
                    _device_obs_data.volume_tbi = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    _device_obs_data.volume_unit_code =
                      hl7_parsed_result.obx[i].units.identifier;
                    _device_obs_data.volume_unit_name =
                      hl7_parsed_result.obx[i].units.alternatetext;
                    _device_obs_data.volume_unit_system =
                      hl7_parsed_result.obx[i].units.text;
                    break;
                  case "MDC_VOL_FLUID_DELIV":
                    _device_obs_data.volume_delivered = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    break;
                  case "MDC_DOSE_DRUG_DELIV_TOTAL":
                    break;
                  case "MDC_VOL_FLUID_TBI_REMAIN":
                    _device_obs_data.volume_remain = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    break;
                  case "MDC_TIME_PD_PROG":
                    _device_obs_data.time_plan = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    break;
                  case "MDC_TIME_PD_REMAIN":
                    _device_obs_data.time_remain = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    _device_obs_data.time_unit_name =
                      hl7_parsed_result.obx[i].units.alternatetext;
                    _device_obs_data.time_unit_code =
                      hl7_parsed_result.obx[i].units.identifier;
                    _device_obs_data.time_unit_system =
                      hl7_parsed_result.obx[i].units.text;
                    break;
                  case "MDC_RATE_DOSE":
                    _device_obs_data.dose = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    _device_obs_data.dose_unit_name =
                      hl7_parsed_result.obx[i].units.alternatetext;
                    _device_obs_data.dose_unit_code =
                      hl7_parsed_result.obx[i].units.identifier;
                    _device_obs_data.dose_unit_system =
                      hl7_parsed_result.obx[i].units.text;
                    break;
                  case "MDC_FLOW_FLUID_PUMP_CURRENT":
                    _device_obs_data.rate = parseFloat(
                      hl7_parsed_result.obx[i].observationvalue
                    );
                    _device_obs_data.rate_unit_name =
                      hl7_parsed_result.obx[i].units.alternatetext;
                    _device_obs_data.rate_unit_code =
                      hl7_parsed_result.obx[i].units.identifier;
                    _device_obs_data.rate_unit_system =
                      hl7_parsed_result.obx[i].units.text;
                    break;
                  case "MDC_ATTR_EVT_COND":
                    mllp_logger.info(
                      "[HL7 PARSER MDC_ATTR_EVT_COND ",
                      hl7_parsed_result
                    );
                    mllp_logger.info(
                      "[HL7 PARSER MDC_ATTR_EVT_COND hl7_parsed_result.obx[i] ",
                      hl7_parsed_result.obx[i]
                    );

                    if (
                      hl7_parsed_result.obx[i].observationvaluelist[1] ==
                        "MDC_EVT_PUMP_DELIV_START" ||
                      hl7_parsed_result.obx[i].observationvaluelist[1] ==
                        "MDC_EVT_PUMP_DELIV_STOP"
                    ) {
                      skip_result = true;
                    }
                    break;
                }
              }
              //
              if (
                _alarm_obs_data != null &&
                _alarm_obs_data.device_id > 0 &&
                _alarm_obs_data.patient_id > 0 &&
                !skip_result
              ) {
                // Added by KareInfinity begins ...
                // Assign the CreatedOn, and actual Message Incoming date time from the OBR segment which has the value
                _alarm_obs_data.created_on = new Date();
                if (hl7_parsed_result.obr != null) {
                  //_alarm_obs_data.message_time = _gputils.FromHL7Date(hl7_parsed_result.obr.observationdatetime);
                  if (
                    hl7_parsed_result.obr.observationdatetime != null &&
                    hl7_parsed_result.obr.observationdatetime.length > 0
                  )
                    _alarm_obs_data.received_on = _gputils.FromHL7Date(
                      hl7_parsed_result.obr.observationdatetime
                    );
                }
                // Added by KareInfinity ends ...
                _alarm_obs_data.ihe_msg_id = _ihemessages_id;
                _alarm_obs_data.point_of_care =
                  hl7_parsed_result.pv1.assignedpatientlocation.nursingunit;
                _alarm_obs_data.room =
                  hl7_parsed_result.pv1.assignedpatientlocation.room;
                _alarm_obs_data.bed =
                  hl7_parsed_result.pv1.assignedpatientlocation.bed;
                if (_alarm_obs_data.event_phase != "ongoing") {
                  _alarm_obs_id = await hl7_service.saveAlarmObservationData(
                    _alarm_obs_data
                  );
                }
                // usersocketservice.sendGraphData(
                //   _device_obs_data.patient_order_id
                // );
              }
              if (_alarm_obs_data != null && !skip_result) {
                _device_obs_data.alarm_id = _alarm_obs_id;
                _alarm_obs_data.id = _alarm_obs_id;
              }
              if (!skip_result) {
                _device_obs_data.created_on = _device_obs_data.created_on;
                _device_obs_data.ihe_msg_id = _ihemessages_id;
                _device_obs_data.point_of_care =
                  hl7_parsed_result.pv1.assignedpatientlocation.nursingunit;
                _device_obs_data.room =
                  hl7_parsed_result.pv1.assignedpatientlocation.room;
                _device_obs_data.bed =
                  hl7_parsed_result.pv1.assignedpatientlocation.bed;
                _device_obs_id = await hl7_service.saveDeviceObservationData(
                  _device_obs_data
                );
                // usersocketservice.sendGraphData(
                //   _device_obs_data.patient_order_id
                // );
                mllp_logger.info(
                  TAG + "new Device Observation inserted ",
                  _device_obs_data
                );
              }

              //
              /* if (_device_obs_id > 0 && (_patient_medication_id > 0)) {
                                if (_patient_medication_data.rate == 0) {
                                    _patient_medication_data.rate = _device_obs_data.rate;
                                    _patient_medication_data.rate_unit_code = _device_obs_data.rate_unit_code;
                                    _patient_medication_data.rate_unit_name = _device_obs_data.rate_unit_name;
                                    _patient_medication_data.dose = _device_obs_data.dose;
                                    _patient_medication_data.dose_unit_code = _device_obs_data.dose_unit_code;
                                    _patient_medication_data.dose_unit_name = _device_obs_data.dose_unit_name;
                                    _patient_medication_data.volume_tbi = _device_obs_data.volume_tbi;
                                    _patient_medication_data.volume_unit_code = _device_obs_data.volume_unit_code;
                                    _patient_medication_data.volume_unit_name = _device_obs_data.volume_unit_name;
                                    _patient_medication_data.strength = _device_obs_data.strength;
                                    _patient_medication_data.strength_unit_code = _device_obs_data.strength_unit_code;
                                    _patient_medication_data.strength_unit_name = _device_obs_data.strength_unit_name;
                                    // _patient_medication_dataDataService.Update(_patient_medication_data);
                                    hl7_service.updatePatientMedicationData(_patient_medication_data);
                                }
                            } */
            }
          }
        }
      }

      if (
        hl7_parsed_result.msh.messagetype.messagecode == "ADT" &&
        hl7_parsed_result.msh.messagetype.triggerevent == "A03"
      ) {
        if (_patient_visit_id > 0) {
          var _patient_discharge_date: Date =
            hl7_parsed_result.pv1.dischargedatetime != null &&
            hl7_parsed_result.pid.datetimeofbirth.length > 0
              ? _gputils.FromHL7Date(hl7_parsed_result.pv1.dischargedatetime)
              : new Date();
          var _discharge_date_update: Boolean = await hl7_service.updatePatientVisitForDischarge(
            _patient_visit_id,
            _patient_discharge_date
          );
        }
      } else {
        if (_alarm_obs_data != null)
          _device_service.update_alarm_received(
            _device_id,
            _alarm_obs_data.received_on
          );
        else if (!skip_result) {
          _device_service.update_result_received(
            _device_id,
            _device_obs_data.received_on
          );
        }
      }
      //
      result = _alarm_obs_data;
    } catch (hl7_ORU_Error) {
      // result = false;
      var err = hl7_ORU_Error;
      throw hl7_ORU_Error;
    }
    return result;
  }
}
