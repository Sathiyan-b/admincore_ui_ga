import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { PrivilegesService } from "../service/privileges.service";
import { Privileges, PrivilegeAssociationModel, PrivilegesWrapper } from "../models/privileges.model";
import * as _ from "lodash";
import { checkToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/all",checkToken, async (req, res, next) => {
	try {
		var privileges_service: PrivilegesService = new PrivilegesService();
		var privileges_list = await privileges_service.getPrivileges();
		var result: ActionRes<Array<PrivilegesWrapper>> = new ActionRes<Array<PrivilegesWrapper>>({
			item: privileges_list
		});
		next (result);
	} catch (error) {
		next(error);
	}
});

router.get("/load",checkToken, async (req, res, next) => {
	try {
		var privileges_service: PrivilegesService = new PrivilegesService();
		var privileges_list = await privileges_service.getPrivilegeForAssociation();
		var result: ActionRes<Array<PrivilegeAssociationModel>> = new ActionRes<Array<PrivilegeAssociationModel>>({
			item: privileges_list
		});
		next (result);
	} catch (error) {
		next(error);
	}
});

router.get("/:type/:id",checkToken, async (req, res, next) => {
	try {
		var privileges_service: PrivilegesService = new PrivilegesService();
		var type = _.get(req, "params.type");
		var id = _.get(req, "params.id");
		console.log("inside privilege - Controller: Type", type);
		var privileges_list;
		if (type == "id")
		{
			console.log("inside type = id");
			privileges_list = await privileges_service.getPrivilegeByID(id);
		}
		else if (type == "groupid")	
		{
			console.log("inside type = groupid");
			privileges_list = await privileges_service.getPrivilegesByGroup(id);
		}
		var result: ActionRes<Array<Privileges>> = new ActionRes<Array<Privileges>>({
			item: privileges_list
		});
		next (result);
	} catch (error) {
		next(error);
	}
});


router.put("/insertinbulk",checkToken, async (req, res, next) => {
	try {
		var Privileges_Service: PrivilegesService = new PrivilegesService();
		var request: Array<PrivilegesWrapper> = new Array<PrivilegesWrapper>();
		_.forEach(req.body.item, (v) => {
			var _req = new PrivilegesWrapper();
			_req.identifier = v.identifier
			 _req.display_text = v.display_text
			 _req.privilege_group_id = v.privilege_group_id
			 _req.app_id = v.app_id
			 _req.lang_code = v.lang_code
			 _req.created_by = v.created_by
			 _req.modified_by = v.modified_by
			 _req.created_on = v.created_on
			 _req. modified_by = v. modified_by
			 _req.is_active = v.is_active
			 _req.is_suspended = v.is_suspended
			 _req.parent_id = v.parent_id
			 _req. is_factory = v. is_factory
			 _req. notes = v. notes
			
			request.push(_req);
		});
		var Privilege_list: Array<PrivilegesWrapper> = await Privileges_Service.insert(
			request
		);
		var result: ActionRes<Array<PrivilegesWrapper>> = new ActionRes<
			Array<PrivilegesWrapper>
		>({
			item: Privilege_list,
		});
		next (result);
	} catch (error) {
		next(error);
	}
});

export { router as PrivilegeController };
