import * as _ from "lodash";
import { toNumber } from "lodash";

export class SendingApplication {
    namespaceid: string = "";
    universalid: string = "";
    universalidtype: string = "";
}
export class ReceivingApplication {
    namespaceid: string = "";
    universalid: string = "";
    universalidtype: string = "";
}

export class PrincipalLanguageOfMessage {
    identifier: string = "";
    text: string = "";
    nameofthecodingsystem: string = "";
}
export class MessageProfileIdentifier {
    entityidentifier: string = "";
    namespaceid: string = "";
    universalid: string = "";
    universalidtype: string = "";
}
export class MessageType {
    messagecode: string = "";
    triggerevent: string = "";
    messagestructure: string = "";
}
export class PatientIdentifierList {
    idnumber: string = "";
    assigningauthority: string = "";
    identifiertypecode: string = "";
}
export class PatientName {
    familyname: string = "";
    givenname: string = "";
    nametypecode: string = "";
}
export class AssignedPatientLocation {
    nursingunit: string = "";
    room: string = "";
    bed: string = "";
    facility: string = "";
    building: string = "";
    floor: string = "";
}
export class AttendingDoctor {
    idnumber: string = "";
    familyname: string = "";
    givenname: string = "";
}

export class PlaceOrderNumber {
    entityidentifier: string = "";
    namespaceid: string = "";
    universalid: string = "";
    universalidtype: string = "";
    namespacesid: string = "";
}
export class FillerOrderNumber {
    entityidentifier: string = "";
    namespaceid: string = "";
    universalid: string = "";
    universalidtype: string = "";
}

export class UniversalServiceIdentifier {
    identifier: string = "";
    text: string = "";
    nameofcodingsystem: string = "";
}
export class ObservationIdentifier {
    identifier: string = "";
    text: string = "";
    nameofthecodingsystem: string = "";
}
export class ObservationUnit {
    identifier: string = "";
}
export class Units {
    identifier: string = "";
    text: string = "";
    nameofcodingsystem: string = "";
    alternateidentifier: string = "";
    alternatetext: string = "";
    nameofalternatecodingsystem: string = "";
}
export class ObservationKeyValue {
    key: string = "";
    value: string = "";
}
export class EquipmentInstanceIdentifier {
    entityidentifier: string = "";
    universalid: string = "";
    universalidtype: string = "";
}
export class OrderingProvider {
    idnumber: string = "";
    familyname: string = "";
    givenname: string = "";
}
export class ActionBy {
    idnumber: string = "";
    familyname: string = "";
    givenname: string = "";
}
export class GiveCode {
    identifier: string = "";
    text: string = "";
}
export class GiveUnits {
    identifier: string = "";
    text: string = "";
    nameofcodingsystem: string = "";
    alternateidentifier: string = "";
    alternatetext: string = "";
    nameofalternatecodingsystem: string = "";
}
export class GiveRateUnits {
    identifier: string = "";
    text: string = "";
    nameofcodingsystem: string = "";
    alternateidentifier: string = "";
    alternatetext: string = "";
    nameofalternatecodingsystem: string = "";
}
export class AdministrationMethod {
    text: string = "";
    nameofcodingsystem: string = "";
}
export class AdministrationDevice {
    text: string = "";
    nameofcodingsystem: string = "";
}
export class Route {
    identifier: string = "";
    text: string = "";
    nameofcodingsystem: string = "";
}
export class GiveDrugStrengthVolumeUnits {
    identifier: string = "";
    text: string = "";
    nameofcodingsystem: string = "";
    alternateidentifier: string = "";
    alternatetext: string = "";
    nameofalternatecodingsystem: string = "";
}

export class PV1 {
    setidpv1: string = "";
    patientclass: string = "";
    assignedpatientlocation: AssignedPatientLocation = new AssignedPatientLocation();

    attendingdoctor: AttendingDoctor = new AttendingDoctor();
    admissiondatetime: string = "";
    dischargedatetime: string = "";
    visitnumber: string = "";
}
export class PID {
    setid: string = "";
    patientid: string = "";

    patientidentifierlist: PatientIdentifierList = new PatientIdentifierList();

    patientname: PatientName = new PatientName();

    datetimeofbirth: string = "";
    administractivesex: string = "";
}
export class MSH {
    fieldseperator: string = "";
    encodingcharacters: string = "";
    sendingapplication: SendingApplication = new SendingApplication();

    sendingfacility: string = "";

    recevingapplication: ReceivingApplication = new ReceivingApplication();

    receivingfacility: string = "";

    datetimeofmessage: string = "";
    messagetype: MessageType = new MessageType();

    messagecontrolid: string = "";
    processingid: string = "";
    versionid: string = "";
    acceptacknowledgementtype: string = "";
    applicationacknowledgementtype: string = "";
    countrycode: string = "";
    characterset: string = "";
    principallanguageofmessage: PrincipalLanguageOfMessage = new PrincipalLanguageOfMessage();

    messageprofileidentifier: MessageProfileIdentifier = new MessageProfileIdentifier();
}
export class OBR {
    setidobr: string = "";
    placeordernumber: PlaceOrderNumber = new PlaceOrderNumber();

    fileordernumber: FillerOrderNumber = new FillerOrderNumber();

    universalserviceidentifier: UniversalServiceIdentifier = new UniversalServiceIdentifier();

    observationdatetime: string = "";
}
export class OBX {
    setidbox: string = "";
    valuetype: string = "";
    observationidtifier: ObservationIdentifier = new ObservationIdentifier();

    units: Units = new Units();

    observationsubid: string = "";
    observationresultstatus: string = "";
    datetimeofobeservation: string = "";
    equipmentinstanceidentifier: string = "";
    datetimeoftheanalysis: string = "";
    equipmentinstanceidentifer: EquipmentInstanceIdentifier = new EquipmentInstanceIdentifier();
    observationvalue: string = "";
    hasobservationlist: boolean = false;
    observationvalues: ObservationKeyValue[] = new Array<ObservationKeyValue>();
    observationvaluelist: string[] = new Array<string>();
    infusertype: string = "";
}

export class ORC {
    ordercontrol: string = "";
    placeordernumber: PlaceOrderNumber = new PlaceOrderNumber();
    filerordernumber: FillerOrderNumber = new FillerOrderNumber();
    datetimeoftransaction: string = "";
    orderingprovider: OrderingProvider = new OrderingProvider();
    actionby: ActionBy = new ActionBy();
    advancedbeneficiarynoticecode: string = "";
    datetimeoforder: string = "";
    orderstatus: string = "";
}

export class RDS {
    ordercontrol: string = "";
    orc: ORC = new ORC();
    tq: TQ1 = new TQ1();
    rxd: RXD = new RXD();
    rxr: RXR = new RXR();
    rxc: RXC[] = new Array<RXC>();
}

export class RAS {
    ordercontrol: string = "";
    orc: ORC = new ORC();
    tq: TQ1 = new TQ1();
    rxr: RXR = new RXR();
    rxa: RXA = new RXA();
}

export class TQ1 {
    quantity: string = "";
    quantity_unit: string = "";
    occurrence: string = "";
    occurrence_unit: string = '';
    priority: string = "";
    start_time: string = "";
    end_time: string = "";
    repeat_pattern: string = "";
}

export class RXD {
    dispense_code: string = "";
    prescription_number: string = "";  
}

export class RXG {
    givesubidcounter: string = "";
    givecode: GiveCode = new GiveCode();
    giveamountminimum: string = "";
    giveunits: GiveUnits = new GiveUnits();
    giverateamount: string = "";
    giverateunits: GiveRateUnits = new GiveRateUnits();
    givestrengthunits: string = "";
    givedrugstrengthvolume: string = "";
    givedrugstrengthvolumeunits: GiveDrugStrengthVolumeUnits = new GiveDrugStrengthVolumeUnits();
}

export class RXR {
    route: Route = new Route();
    administrationsite: string = "";
    administrationdevice: string = "";
    administrationMethod: string = "";
}

export class RXC {
    component_type: string = "";
    component_code_identifier: string = "";
    component_code_text: string = "";
    component_qty: string = "";
    component_units_identifier: string = ""
    component_units_text: string = ""
    component_strength: string = "";
    component_strength_units: string = "";
    component_drug_strength_volume: string = "";
    component_drug_strength_volume_units: string = "";
}

export class RXA {
    administration_start_time: string = "";
    administration_end_time: string = "";
    administered_drug_code: string = "";
    administered_drug_name: string = "";
    administered_qty: string = "";
    administered_units_identifier: string = ""
    administered_units_text: string = ""
    administered_diluent_amount: number = 0;
    administered_diluent_unit: string = "";
    administered_rate: number = 0;
    administered_rate_unit: string = "";
    administered_dose: number = 0;
    administered_dose_unit: string = "";
}

export class Hl7Result {
    // msh_entityidentifier: string = "";
    obx: Array<OBX> = new Array<OBX>();
    rxr = {} as RXR;
    orc = {} as ORC;
    rxg = {} as RXG;
    msh = {} as MSH;
    pid = {} as PID;
    pv1 = {} as PV1;
    obr = {} as OBR;
    rds = {} as RDS;
    ras = {} as RAS;

    DeviceID(): any {
        if (this.obx != null && this.obx.length > 0) {
            // Added by KareInfinity begins...
            if (this.msh.messageprofileidentifier.entityidentifier != "ACM_04") {
                var found = _.find(this.obx, function (
                    value: OBX,
                    index: number
                ) {
                    if (value.observationidtifier.text == "MDC_ID_PROD_SPEC_SW")
                        return true;
                });
                if (found != null)
                    return (found as OBX).equipmentinstanceidentifier;

                var found = _.find(this.obx, function (
                    value: OBX,
                    index: number
                ) {
                    if (value.observationidtifier.text == "MDC_EVT_ALARM")
                        return true;
                });
                if (found != null)
                    return (found as OBX).equipmentinstanceidentifier;
            }

            var found = _.find(this.obx, function (value: OBX, index: number) {
                if (value.observationidtifier.text == "MDC_ATTR_ALERT_SOURCE")
                    return true;
            });
            if (found != null)
                return (found as OBX).equipmentinstanceidentifier;

            var found = _.find(this.obx, function (value: OBX, index: number) {
                if (
                    value.observationidtifier.text ==
                    "MDC_DEV_PUMP_INFUS_PCA_MDS"
                )
                    return true;
            });
            if (found != null)
                return (found as OBX).equipmentinstanceidentifier;

            var found = _.find(this.obx, function (value: OBX, index: number) {
                if (
                    value.observationidtifier.text ==
                    "MDC_DEV_PUMP_INFUS_PCA_VMD"
                )
                    return true;
            });
            if (found != null)
                return (found as OBX).equipmentinstanceidentifier;

            var found = _.find(this.obx, function (value: OBX, index: number) {
                if (
                    value.observationidtifier.text ==
                    "MDC_DEV_PUMP_DELIVERY_INFO"
                )
                    return true;
            });
            if (found != null)
                return (found as OBX).equipmentinstanceidentifier;

            var found = _.find(this.obx, function (value: OBX, index: number) {
                if (value.observationidtifier.text == "MDC_COMM_STATUS")
                    return true;
            });
            if (found != null)
                return (found as OBX).equipmentinstanceidentifier;
        }
    }

    async Parse(source: string): Promise<Hl7Result> {
        let result: Hl7Result = new Hl7Result();
        result.obx = new Array<OBX>();
        let sourcelist = source.split("\t");
        
        sourcelist = source.split(/\r\n|\r|\n/);

        for (var i = 0; i < sourcelist.length; i++) {
            var line = sourcelist[i];
            let parts = line.split("|");

            if (parts != null && parts.length > 0) {
                switch (parts[0]) {
                    case "MSH":
                        result.msh = new MSH();
                        var secondparts, thrparts, thirdparts, fourthparts, fifthparts;
                        result.msh.encodingcharacters = parts[1] != null && parts[1].length > 0 ? parts[1] : "";
                        //
                        result.msh.sendingapplication = new SendingApplication();
                        if (parts[2] != null && parts[2].length > 0)
                            secondparts = parts[2].split("^");
                        result.msh.sendingapplication.namespaceid = secondparts != null && secondparts.length > 0 ? secondparts[0] : "";
                        result.msh.sendingapplication.universalid = secondparts != null && secondparts.length > 1 ? secondparts[1] : "";
                        result.msh.sendingapplication.universalidtype =
                            secondparts != null && secondparts.length > 0 ? secondparts[2] : "";
                        result.msh.sendingfacility = parts[3];
                        result.msh.datetimeofmessage = parts[4];
                        //
                        result.msh.recevingapplication = new ReceivingApplication();
                        if (parts[4] != null && parts[4].length > 0)
                            thrparts = parts[4].split("^");
                        result.msh.recevingapplication.namespaceid = thrparts != null && thrparts.length > 0 ? thrparts[0] : "";
                        result.msh.recevingapplication.universalid =
                            thrparts != null && thrparts.length > 1 ? thrparts[1] : "";
                        result.msh.recevingapplication.universalidtype =
                            thrparts != null && thrparts.length > 2 ? thrparts[2] : "";
                        result.msh.receivingfacility =
                            parts != null && parts.length > 1 ? parts[5] : "";
                        result.msh.datetimeofmessage = parts[6];
                        //
                        result.msh.messagetype = new MessageType();
                        if (parts[8] != null && parts[8].length > 0)
                            thirdparts = parts[8].split("^");
                        result.msh.messagetype.messagecode = thirdparts != null && thirdparts.length > 0 ? thirdparts[0] : "";
                        result.msh.messagetype.triggerevent = thirdparts != null && thirdparts.length > 1 ? thirdparts[1] : "";
                        result.msh.messagetype.messagestructure = thirdparts != null && thirdparts.length > 2 ? thirdparts[2] : "";
                        result.msh.messagecontrolid = parts[9];
                        result.msh.processingid = parts[10];
                        result.msh.versionid = parts[11];
                        result.msh.acceptacknowledgementtype = parts[14];
                        result.msh.applicationacknowledgementtype = parts[15];
                        result.msh.countrycode = parts.length > 16 ? parts[16] : "";
                        result.msh.characterset =
                            parts != null && parts.length > 17 ? parts[17] : "";
                        //
                        result.msh.principallanguageofmessage = new PrincipalLanguageOfMessage();
                        if (parts[18] != null && parts[18].length > 0)
                            fourthparts = parts[18].split("^");
                        result.msh.principallanguageofmessage.identifier =
                            fourthparts != null && fourthparts.length > 0 ? fourthparts[0] : "";
                        result.msh.principallanguageofmessage.text =
                            fourthparts != null && fourthparts.length > 1 ? fourthparts[1] : "";
                        result.msh.principallanguageofmessage.nameofthecodingsystem =
                            fourthparts != null && fourthparts.length > 2 ? fourthparts[2] : "";
                        //
                        result.msh.messageprofileidentifier = new MessageProfileIdentifier();
                        if (parts[20] != null && parts[20].length > 0)
                            fifthparts = parts[20].split("^");
                        result.msh.messageprofileidentifier.entityidentifier =
                            fifthparts != null && fifthparts.length > 0 ? fifthparts[0] : "";
                        result.msh.messageprofileidentifier.namespaceid =
                            fifthparts != null && fifthparts.length > 1 ? fifthparts[1] : "";
                        result.msh.messageprofileidentifier.universalid =
                            fifthparts != null && fifthparts.length > 2 ? fifthparts[2] : "";
                        result.msh.messageprofileidentifier.universalidtype =
                            fifthparts != null && fifthparts.length > 3 ? fifthparts[3] : "";
                        //
                        // result.msh_entityidentifier = fifthparts != null && fifthparts.length > 0 ? fifthparts[0] : "";
                        break;

                    case "PID":
                        result.pid = new PID();
                        var sixthparts, seventhparts;
                        result.pid.setid = parts.length > 1 ? parts[1] : "";
                        result.pid.patientid = parts.length > 1 ? parts[2] : "";
                        //
                        result.pid.patientidentifierlist = new PatientIdentifierList();
                        if (parts[3] != null && parts[3].length > 0)
                            sixthparts = parts[3].split("^");
                        result.pid.patientidentifierlist.idnumber = sixthparts != null && sixthparts.length > 0 ? sixthparts[0] : "";
                        result.pid.patientidentifierlist.assigningauthority =
                            sixthparts != null && sixthparts.length > 0 ? sixthparts[3] : "";
                        result.pid.patientidentifierlist.identifiertypecode =
                            sixthparts != null && sixthparts.length > 0 ? sixthparts[4] : "";
                        //
                        result.pid.patientname = new PatientName();
                        if (parts[5] != null && parts[5].length > 0)
                            seventhparts = parts[5].split("^");
                        result.pid.patientname.familyname = seventhparts != null && seventhparts.length > 0 ? seventhparts[0] : "";
                        result.pid.patientname.givenname =
                            seventhparts != null && seventhparts.length > 0 ? seventhparts[1] : "";
                        result.pid.patientname.nametypecode =
                            seventhparts != null && seventhparts.length > 6 ? seventhparts[6] : "";
                        //
                        result.pid.datetimeofbirth = parts[7];
                        result.pid.administractivesex = parts[8];
                        break;

                    case "PV1":
                        result.pv1 = new PV1();
                        var eigthparts, fourteenparts;
                        result.pv1.setidpv1 = parts.length > 1 ? parts[1] : "";
                        result.pv1.patientclass = parts[2];
                        //
                        result.pv1.assignedpatientlocation = new AssignedPatientLocation();
                        if (parts[3] != null && parts[3].length > 0)
                            eigthparts = parts[3].split("^");
                        result.pv1.assignedpatientlocation.nursingunit =
                            eigthparts != null && eigthparts.length > 0 ? eigthparts[0] : "";
                        result.pv1.assignedpatientlocation.room = eigthparts != null && eigthparts.length > 1 ? eigthparts[1] : "";
                        result.pv1.assignedpatientlocation.bed = eigthparts != null && eigthparts.length > 2 ? eigthparts[2] : "";
                        result.pv1.assignedpatientlocation.facility = eigthparts != null && eigthparts.length > 3 ? eigthparts[3] : "";
                        result.pv1.assignedpatientlocation.building = eigthparts != null && eigthparts.length > 6 ? eigthparts[6] : "";
                        result.pv1.assignedpatientlocation.floor = eigthparts != null && eigthparts.length > 7 ? eigthparts[7] : "";
                        //
                        result.pv1.attendingdoctor = new AttendingDoctor();
                        if (parts[7] != null && parts[7].length > 0) {
                            fourteenparts = parts[7].split("^");
                            result.pv1.attendingdoctor.idnumber = fourteenparts != null && fourteenparts.length > 0 ? fourteenparts[0] : "";
                            result.pv1.attendingdoctor.familyname =
                                fourteenparts != null && fourteenparts.length > 1 ? fourteenparts[1] : "";
                            result.pv1.attendingdoctor.givenname =
                                fourteenparts != null && fourteenparts.length > 2 ? fourteenparts[2] : "";
                        }
                        var visitnumberparts;
                        if (parts.length > 19)
                            visitnumberparts = parts[19].split("^");
                        if (visitnumberparts != null && visitnumberparts.length > 1) {
                            result.pv1.visitnumber = visitnumberparts[0];    
                        }
                        else
                            result.pv1.visitnumber = parts.length > 19 ? parts[19] : "";
                        result.pv1.admissiondatetime = parts.length > 44 ? parts[44] : "";
                        result.pv1.dischargedatetime = parts.length > 45 ? parts[45] : "";
                        break;

                    case "OBR":
                        result.obr = new OBR();
                        var ninthparts, tenthparts, eleparts;
                        result.obr.setidobr = parts[1];
                        result.obr.placeordernumber = new PlaceOrderNumber();
                        if (parts[2] != null && parts[2].length > 0)
                            ninthparts = parts[2].split("^");
                        result.obr.placeordernumber.entityidentifier =
                            ninthparts != null && ninthparts.length > 0 ? ninthparts[0] : "";
                        result.obr.placeordernumber.namespaceid = ninthparts != null && ninthparts.length > 1 ? ninthparts[1] : "";
                        result.obr.placeordernumber.universalid = ninthparts != null && ninthparts.length > 2 ? ninthparts[2] : "";
                        result.obr.placeordernumber.universalidtype = ninthparts != null && ninthparts.length > 3 ? ninthparts[3] : "";
                        //
                        result.obr.fileordernumber = new FillerOrderNumber();
                        if (parts[3] != null && parts[3].length > 0)
                            tenthparts = parts[3].split("^");
                        result.obr.fileordernumber.entityidentifier = tenthparts != null && tenthparts.length > 0 ? tenthparts[0] : "";
                        result.obr.fileordernumber.namespaceid = tenthparts != null && tenthparts.length > 1 ? tenthparts[1] : "";
                        result.obr.fileordernumber.universalid = tenthparts != null && tenthparts.length > 2 ? tenthparts[2] : "";
                        result.obr.fileordernumber.universalidtype = tenthparts != null && tenthparts.length > 3 ? tenthparts[3] : "";
                        //
                        result.obr.universalserviceidentifier = new UniversalServiceIdentifier();
                        if (parts[4] != null && parts[4].length > 0)
                            eleparts = parts[4].split("^");
                        result.obr.universalserviceidentifier.identifier =
                            eleparts != null && eleparts.length > 0 ? eleparts[0] : "";
                        result.obr.universalserviceidentifier.text =
                            eleparts != null && eleparts.length > 1 ? eleparts[1] : "";
                        //
                        result.obr.observationdatetime = parts[7];
                        break;

                    case "OBX":
                        obx: OBX;
                        // Commenetd by KareInfinity begins...
                        // No point is adding an emptyhere: any; this statement is taken to the last before the break
                        // result.obx.Add(obx);
                        // Commenetd by KareInfinity ends...
                        var obx = new OBX();
                        var obsvaluecontent, tweparts, twentysix, twentyfiveparts;
                        obx.setidbox = parts[1];
                        obx.valuetype = parts[2];
                        //
                        obx.observationidtifier = new ObservationIdentifier();
                        if (parts[3] != null && parts[3].length > 0)
                            tweparts = parts[3].split("^");
                        obx.observationidtifier.identifier = tweparts != null && tweparts.length > 0 ? tweparts[0] : "";
                        obx.observationidtifier.text = tweparts != null && tweparts.length > 1 ? tweparts[1] : "";
                        obx.observationidtifier.nameofthecodingsystem = tweparts != null && tweparts.length > 2 ? tweparts[2] : "";
                        obx.observationsubid = parts.length > 4 ? parts[4] : "";
                        obx.observationvalue = parts.length > 5 ? parts[5] : "";
                        if (obx.observationidtifier != null && obx.observationidtifier.text == "MDC_ID_PROD_SPEC_SW" &&
                            obx.observationvalue.indexOf("~") > 0) {
                            obx.hasobservationlist = true;
                            obx.observationvalues = new Array<
                                ObservationKeyValue
                            >();
                            obsvaluecontent = obx.observationvalue.split("~");
                            for (var ovindex = 0; ovindex < obsvaluecontent.length; ovindex++) {
                                var keyvals = obsvaluecontent[ovindex].split("=");
                                if (keyvals.length == 2) {
                                    var kv = new ObservationKeyValue();
                                    kv.key = keyvals[0];
                                    kv.value = keyvals[1];
                                    if (kv.key == "InfuserType")
                                        obx.infusertype = kv.value;
                                    obx.observationvalues.push(kv);
                                }
                            }
                        } else {
                            obx.observationvaluelist = obx.observationvalue.split("^");
                        }
                        obx.units = new Units();
                        if (parts[6] != null && parts[6].length > 0)
                            twentysix = parts[6].split("^");
                        if (parts.length > 6) {
                            obx.units.identifier = twentysix != null && twentysix.length > 0 ? twentysix[0] : "";
                            obx.units.text =
                                twentysix != null && twentysix.length > 1 ? twentysix[1] : "";
                            obx.units.nameofcodingsystem =
                                twentysix != null && twentysix.length > 2 ? twentysix[2] : "";
                            obx.units.alternateidentifier =
                                twentysix != null && twentysix.length > 3 ? twentysix[3] : "";
                            obx.units.alternatetext =
                                twentysix != null && twentysix.length > 4 ? twentysix[4] : "";
                            obx.units.nameofalternatecodingsystem =
                                twentysix != null && twentysix.length > 5 ? twentysix[5] : "";
                        }
                        obx.observationresultstatus =
                            parts.length > 11 ? parts[11] : "";
                        obx.datetimeofobeservation =
                            parts.length > 14 ? parts[14] : "";
                        obx.equipmentinstanceidentifer = new EquipmentInstanceIdentifier();
                        if (parts[18] != null && parts[18].length > 18) {
                            twentyfiveparts = parts[18].split("^");
                            obx.equipmentinstanceidentifer.entityidentifier =
                                twentyfiveparts != null && twentyfiveparts.length > 0
                                    ? twentyfiveparts[0]
                                    : "";
                            obx.equipmentinstanceidentifer.universalid =
                                twentyfiveparts != null && twentyfiveparts.length > 0
                                    ? twentyfiveparts[2]
                                    : "";
                            obx.equipmentinstanceidentifer.universalidtype =
                                twentyfiveparts != null && twentyfiveparts.length > 0
                                    ? twentyfiveparts[3]
                                    : "";
                        }
                        // Modifed by KareInfinity begins...
                        // obx.equipmentinstanceidentifier = parts.length > 18 ? parts[18] : "";
                        if (
                            obx.setidbox == "3" &&
                            parts.length > 18 &&
                            (result.msh.messageprofileidentifier.entityidentifier == "IPEC_10" ||
                                result.msh.messageprofileidentifier.entityidentifier == "DEC_01" ||
                                result.msh.messageprofileidentifier.entityidentifier == "ACM_04")
                        ) {
                            // obx.equipmentinstanceidentifier = parts[18].substr(0, parts[18].length - 2);
                            obx.equipmentinstanceidentifier = parts[18];
                        } else if (
                            obx.setidbox == "6" &&
                            parts.length > 18 &&
                            result.msh.messageprofileidentifier.entityidentifier == "ACM_04"
                        ) {
                            obx.equipmentinstanceidentifier = parts[18];
                        }
                        /* else
                        if (obx.setidbox == "1" && parts[18] != null)
                        {
                            obx.equipmentinstanceidentifier = parts[18];
                        } */
                        // Modifed by KareInfinity ends...
                        obx.datetimeoftheanalysis = parts.length > 19 ? parts[19] : "";
                        // Added by KareInfinity begins...
                        result.obx.push(obx);
                        // Added by KareInfinity ends...
                        break;

                        case "TQ1":
                            var quantity_parts, occurrence_parts;
                            if (result.rds == null) 
                                result.rds = new RDS();
                            if (result.rds.tq == null)
                                result.rds.tq = new TQ1();
                            if (parts[2] != null && parts[2].length > 0)
                                quantity_parts = parts[2].split("^");
                            result.rds.tq.quantity = quantity_parts != null && quantity_parts.length > 0 ? quantity_parts[0] : "";
                            result.rds.tq.quantity_unit = quantity_parts != null && quantity_parts.length > 0 ? quantity_parts[1] : "";
                            if (parts[13] != null && parts[13].length > 0)
                                occurrence_parts = parts[13].split("^");
                            result.rds.tq.occurrence = occurrence_parts != null && occurrence_parts.length > 0 ? occurrence_parts[0] : "";
                            result.rds.tq.occurrence_unit = occurrence_parts != null && occurrence_parts.length > 0 ? occurrence_parts[1] : "";
                        break;
                        case "RXD":
                            if (result.rds == null) 
                                result.rds = new RDS();
                            if (result.rds.rxd == null)
                                result.rds.rxd = new RXD();    
                            result.rds.rxd.dispense_code = parts[2] != null? parts[2]: "";
                            result.rds.rxd.prescription_number = parts[7] != null? parts[7]: "";
                            break;
                        case "RXR":
                            var route_parts;
                            if (result.rds == null) 
                                result.rds = new RDS();
                            if (result.rds.rxr == null)
                                result.rds.rxr = new RXR();    
                            if (parts[1] != null && parts[1].length > 0)
                                route_parts = parts[1].split("^");
                            result.rds.rxr.route.identifier = route_parts != null && route_parts.length > 0? route_parts[0]: "";
                            result.rds.rxr.route.text = route_parts != null && route_parts.length > 0? route_parts[1]: "";
                            break;
                        case "RXC":
                            var component_code_parts, component_unit_parts;
                            if (result.rds == null) 
                                result.rds = new RDS();
                            if (result.rds.rxc == null)
                                result.rds.rxc = new Array<RXC>();    
                            var rxc_temp = new RXC();
                            if (parts[2] != null && parts[2].length > 0)
                                component_code_parts = parts[2].split("^");
                            if (parts[4] != null && parts[4].length > 0)
                                component_unit_parts = parts[4].split("^");
                            rxc_temp.component_type = parts[1] != null? parts[1]: "";
                            rxc_temp.component_code_identifier = component_code_parts != null && component_code_parts.length > 0? component_code_parts[0]: "";
                            rxc_temp.component_code_text = component_code_parts != null && component_code_parts.length > 0? component_code_parts[1]: "";
                            rxc_temp.component_qty = parts[3] != null? parts[3]: "";
                            rxc_temp.component_units_identifier = component_unit_parts != null && component_unit_parts.length > 0? component_unit_parts[0]: "";
                            rxc_temp.component_units_text = component_unit_parts != null && component_unit_parts.length > 0? component_unit_parts[1]: "";
                            result.rds.rxc.push(rxc_temp);
                        break;
                        case "RXA":
                            if (result.ras == null) 
                                result.ras = new RAS();
                            if (result.ras.rxa == null)
                                result.ras.rxa = new RXA();
                            var seventhparts, ninthparts;
                            result.ras.rxa.administration_start_time = parts[3];
                            result.ras.rxa.administration_end_time = parts[4] != null? parts[4]: "";
                            // result.ras.rxa.administered_drug_code = parts[5];
                            // result.ras.rxa.administered_drug_name = parts[6];
                            result.ras.rxa.administered_qty = parts[6];
                            seventhparts = parts[7].split("^");
                            result.ras.rxa.administered_units_text = seventhparts != null && seventhparts.length > 0? seventhparts[1]:"";
                            if (result.ras.tq == null)
                                result.ras.tq = new TQ1();
                            if (parts[9] != null) 
                                ninthparts = parts[9].split("^");
                            if (ninthparts != null) {
                                result.ras.rxa.administered_diluent_amount = toNumber(ninthparts[0]);
                                result.ras.rxa.administered_diluent_unit = ninthparts[1];
                                result.ras.rxa.administered_rate = toNumber(ninthparts[2]);
                                result.ras.rxa.administered_rate_unit = ninthparts[3];
                                result.ras.rxa.administered_dose = toNumber(ninthparts[4]);
                                result.ras.rxa.administered_dose_unit = ninthparts[5];
                            }
                            //result.ras.tq = result.rds.tq;
                        break;
                        case "ORC":
                            result.orc = new ORC();
                            var fifthteenparts, sixteenparts, seventeenparts, timing_start_parts;
                            result.orc.ordercontrol = parts[1];
                            //
                            result.orc.placeordernumber = new PlaceOrderNumber();
                            if (parts[2] != null && parts[2].length > 0)
                                fifthteenparts = parts[2].split("^");
                            result.orc.placeordernumber.entityidentifier =
                                fifthteenparts != null && fifthteenparts.length > 0 ? fifthteenparts[0] : "";
                            result.orc.placeordernumber.namespacesid =
                                fifthteenparts != null && fifthteenparts.length > 1 ? fifthteenparts[1] : "";
                            result.orc.orderstatus = parts[5];
                            result.orc.datetimeoftransaction = parts[9];
                            //
                            if (parts[7] != null && parts[7].length > 0)
                                timing_start_parts = parts[7].split("^");
                            result.orc.datetimeoforder = timing_start_parts != null && timing_start_parts.length > 0? timing_start_parts[3]: "";
                            result.orc.orderingprovider = new OrderingProvider();
                            if (parts[12] != null && parts[12].length > 0)
                                sixteenparts = parts[12].split("^");
                            result.orc.orderingprovider.idnumber = sixteenparts != null && sixteenparts.length > 0 ? sixteenparts[0] : "";
                            result.orc.orderingprovider.familyname = sixteenparts != null && sixteenparts.length > 1 ? sixteenparts[1] : "";
                            result.orc.orderingprovider.givenname = sixteenparts != null && sixteenparts.length > 2 ? sixteenparts[2] : "";
                            //
                            result.orc.actionby = new ActionBy();
                            if (parts[19] != null && parts[19].length > 0)
                                seventeenparts = parts[19].split("^");
                            result.orc.actionby.idnumber = seventeenparts != null && seventeenparts.length > 0 ? seventeenparts[0] : "";
                            result.orc.actionby.familyname = seventeenparts != null && seventeenparts.length > 1 ? seventeenparts[1] : "";
                            result.orc.actionby.givenname = seventeenparts != null && seventeenparts.length > 2 ? seventeenparts[2] : "";
                            result.orc.advancedbeneficiarynoticecode = parts[20];
                    break;

                    case "RXG":
                        result.rxg = new RXG();
                        var eighteenparts, ninthteenparts, twentyparts, twentyoneparts;
                        result.rxg.givesubidcounter = parts[1];
                        result.rxg.givecode = new GiveCode();
                        if (parts[4] != null && parts[4].length > 0)
                            eighteenparts = parts[4].split("^");
                        result.rxg.givecode.identifier = eighteenparts != null && eighteenparts.length > 0 ? eighteenparts[0] : "";
                        result.rxg.givecode.text = eighteenparts != null && eighteenparts.length > 1 ? eighteenparts[1] : "";
                        result.rxg.giveamountminimum = parts[5];
                        //
                        result.rxg.giveunits = new GiveUnits();
                        if (parts[7] != null && parts[7].length > 0)
                            ninthteenparts = parts[7].split("^");
                        result.rxg.giveunits.identifier = ninthteenparts != null && ninthteenparts.length > 0 ? ninthteenparts[0] : "";
                        result.rxg.giveunits.text = ninthteenparts != null && ninthteenparts.length > 1 ? ninthteenparts[1] : "";
                        result.rxg.giveunits.nameofcodingsystem = ninthteenparts != null && ninthteenparts.length > 2 ? ninthteenparts[2] : "";
                        result.rxg.giveunits.alternateidentifier =
                            ninthteenparts != null && ninthteenparts.length > 3 ? ninthteenparts[3] : "";
                        result.rxg.giveunits.alternatetext = ninthteenparts != null && ninthteenparts.length > 4 ? ninthteenparts[4] : "";
                        result.rxg.giveunits.nameofalternatecodingsystem =
                            ninthteenparts != null && ninthteenparts.length > 5 ? ninthteenparts[5] : "";
                        result.rxg.giverateamount = parts[15];
                        //
                        result.rxg.giverateunits = new GiveRateUnits();
                        if (parts[16] != null && parts[16].length > 0)
                            twentyparts = parts[16].split("^");
                        result.rxg.giverateunits.identifier = twentyparts != null && twentyparts.length > 0 ? twentyparts[0] : "";
                        result.rxg.giverateunits.text = twentyparts != null && twentyparts.length > 1 ? twentyparts[1] : "";
                        result.rxg.giverateunits.nameofcodingsystem =
                            twentyparts != null && twentyparts.length > 2 ? twentyparts[2] : "";
                        result.rxg.giverateunits.alternateidentifier =
                            twentyparts != null && twentyparts.length > 3 ? twentyparts[3] : "";
                        result.rxg.giverateunits.alternatetext =
                            twentyparts != null && twentyparts.length > 4 ? twentyparts[4] : "";
                        result.rxg.giverateunits.nameofalternatecodingsystem =
                            twentyparts != null && twentyparts.length > 5 ? twentyparts[5] : "";
                        result.rxg.givedrugstrengthvolume = parts[23];
                        //
                        result.rxg.givedrugstrengthvolumeunits = new GiveDrugStrengthVolumeUnits();
                        if (parts[24] != null && parts[24].length > 0)
                            twentyoneparts = parts[24].split("^");
                        result.rxg.givedrugstrengthvolumeunits.identifier =
                            twentyoneparts != null && twentyoneparts.length > 0 ? twentyoneparts[0] : "";
                        result.rxg.givedrugstrengthvolumeunits.text =
                            twentyoneparts != null && twentyoneparts.length > 1 ? twentyoneparts[1] : "";
                        result.rxg.givedrugstrengthvolumeunits.nameofcodingsystem =
                            twentyoneparts != null && twentyoneparts.length > 2 ? twentyoneparts[2] : "";
                        result.rxg.givedrugstrengthvolumeunits.alternateidentifier =
                            twentyoneparts != null && twentyoneparts.length > 3 ? twentyoneparts[3] : "";
                        result.rxg.givedrugstrengthvolumeunits.alternatetext =
                            twentyoneparts != null && twentyoneparts.length > 4 ? twentyoneparts[4] : "";
                        result.rxg.givedrugstrengthvolumeunits.nameofalternatecodingsystem =
                            twentyoneparts != null && twentyoneparts.length > 5 ? twentyoneparts[5] : "";
                        break;

                    case "RXR":
                        result.rxr = new RXR();
                        var twentytwoparts, twentythreeparts, twentyfourparts;
                        result.rxr.route = new Route();
                        if (parts[1] != null && parts[1].length > 0)
                            twentytwoparts = parts[1].split("^");
                        result.rxr.route.text = twentytwoparts != null && twentytwoparts.length > 1 ? twentytwoparts[1] : "";
                        result.rxr.route.nameofcodingsystem = twentytwoparts != null && twentytwoparts.length > 2 ? twentytwoparts[2] : "";
                        //
                        if (parts[3] != null && parts[3].length > 0)
                            twentythreeparts = parts[3].split("^");
                        result.rxr.administrationdevice = parts[3] != null? parts[3] : "";
                        if (parts[4] != null && parts[4].length > 0)
                            twentyfourparts = parts[4].split("^");
                        result.rxr.administrationMethod = parts[4] != null? parts[4] : "";
                        /* 
                        result.rxr.administrationdevice = new AdministrationDevice();
                        if (parts[3] != null && parts[3].length > 0)
                            twentythreeparts = parts[3].split("^");
                        result.rxr.administrationdevice.text = twentythreeparts != null && twentythreeparts.length > 1 ? twentythreeparts[1] : "";
                        result.rxr.administrationdevice.nameofcodingsystem =
                            twentythreeparts != null && twentythreeparts.length > 2 ? twentythreeparts[2] : "";
                        //
                        result.rxr.administrationMethod = new AdministrationMethod();
                        if (parts[4] != null && parts[4].length > 0)
                            twentyfourparts = parts[4].split("^");
                        result.rxr.administrationdevice.text = twentyfourparts != null && twentyfourparts.length > 1 ? twentyfourparts[1] : "";
                        result.rxr.administrationdevice.nameofcodingsystem =
                            twentyfourparts != null && twentyfourparts.length > 2 ? twentyfourparts[2] : "";
                        */
                        break;
                }
            }
        }
        return result;
    }
}