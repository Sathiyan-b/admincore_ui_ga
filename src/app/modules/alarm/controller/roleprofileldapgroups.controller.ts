import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { RoleProfileLDAPGroups, RoleProfileLDAPGroupsWrapper } from "../models/roleprofileldapgroups.model";
import { RoleProfileLDAPGroupsService } from "../service/roleprofileldapgroups.service";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<RoleProfileLDAPGroups> = new ActionRes<RoleProfileLDAPGroups>({
            item: new RoleProfileLDAPGroups(),
          });
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<RoleProfileLDAPGroups>> = new ActionRes<
      Array<RoleProfileLDAPGroups>
    >();
    var service: RoleProfileLDAPGroupsService = new RoleProfileLDAPGroupsService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<RoleProfileLDAPGroups> = new ActionRes<RoleProfileLDAPGroups>();
          var service: RoleProfileLDAPGroupsService = new RoleProfileLDAPGroupsService();
          result.item = await service.insert(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/update",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<RoleProfileLDAPGroups> = new ActionRes<RoleProfileLDAPGroups>();
          var service: RoleProfileLDAPGroupsService = new RoleProfileLDAPGroupsService();
          result.item = await service.update(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/delete",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<RoleProfileLDAPGroups> = new ActionRes<RoleProfileLDAPGroups>();
          var service: RoleProfileLDAPGroupsService = new RoleProfileLDAPGroupsService();
          result.item = await service.delete(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
      export { router as RoleProfileLDAPGroupsController}
