import express from "express";
// import { UI } from "bull-board";
// import UI from "bull-board"
import { UserController } from "./users.controller";
import { EnterpriseController } from "./enterprise.controller";
// import { LocationController } from "./location.controller";
import { ReferenceListController } from "./referencelist.controller";
// import { PrivilegeGroupController } from "./privilegegroup.controller";
import { PrivilegeController } from "./privileges.controller";
import { RoleProfileController } from "./roleprofiles.controller";
import { AppSettingsController } from "./appsettings.controller";
import { AuthController } from "./auth.controller";
import { checkToken } from "../middleware/auth.middleware";
import { PasswordPolicyController } from "./passwordpolicy.controller";
// import { FileManagerController } from "./filemanager.controller";
import { UserTeamController } from "./userteam.controller";
import { PointofCareController } from "./pointofcare.controller";
import { ApplicationController } from "./application.controller";
import { EntHierarchyController } from "./entheirarchy.controller";
import { DevicesController } from "./devices.controller";
import { AlarmObservationsController } from "./alarmobservations.controller";
import { alarmsController } from "./alarms.controller";
import { PatientMedicationsController } from "./patientmedications.controller";
import { PatientVisitsController } from "./patientvisits.controller";
import { PatientOrdersController } from "./patientorders.controller";
//
const router = express.Router();
router.use("/enthierarchy", EntHierarchyController);
router.use("/auth", AuthController);
router.use("/appsetting", AppSettingsController);
// router.use(checkToken);
router.use("/pointofcare", PointofCareController);
router.use("/userteam", UserTeamController);
router.use("/application", ApplicationController);
router.use("/reference", ReferenceListController);
router.use("/alarms", alarmsController)
router.use("/user", UserController);
router.use("/patientmedications", PatientMedicationsController);
router.use("/enterprise", EnterpriseController);
// router.use("/location", LocationController);
router.use("/privilege", PrivilegeController); // to get by ID
router.use("/patientvisits", PatientVisitsController); 
router.use("/patientorders", PatientOrdersController); 
// router.use("/privilegegroup", PrivilegeGroupController);
router.use("/roleprofile", RoleProfileController);
router.use("/passwordpolicy", PasswordPolicyController);
// router.use("/filemanager", FileManagerController);
router.use("/devices", DevicesController);
router.use("/alarmobservations", AlarmObservationsController);

export { router as AlarmRoutes };
