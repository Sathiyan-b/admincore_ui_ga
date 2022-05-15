import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { UserRoleProfiles, UserRoleProfilesWrapper } from "../models/userroleprofiles.model";
import { UserRoleProfilesService } from "../service/userroleprofiles.service";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<UserRoleProfiles> = new ActionRes<UserRoleProfiles>({
            item: new UserRoleProfiles(),
          });
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<UserRoleProfiles>> = new ActionRes<
      Array<UserRoleProfiles>
    >();
    var service: UserRoleProfilesService = new UserRoleProfilesService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<UserRoleProfiles> = new ActionRes<UserRoleProfiles>();
          var service: UserRoleProfilesService = new UserRoleProfilesService();
          result.item = await service.insert(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/update",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<UserRoleProfiles> = new ActionRes<UserRoleProfiles>();
          var service: UserRoleProfilesService = new UserRoleProfilesService();
          result.item = await service.update(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/delete",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<UserRoleProfiles> = new ActionRes<UserRoleProfiles>();
          var service: UserRoleProfilesService = new UserRoleProfilesService();
          result.item = await service.delete(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
      export { router as UserRoleProfilesController}
