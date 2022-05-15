import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import { TeamMembers, TeamMembersWrapper } from "../models/teammembers.model";
import { TeamMembersService } from "../service/teammembers.service";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<TeamMembers> = new ActionRes<TeamMembers>({
            item: new TeamMembers(),
          });
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<TeamMembers>> = new ActionRes<
      Array<TeamMembers>
    >();
    var service: TeamMembersService = new TeamMembersService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<TeamMembers> = new ActionRes<TeamMembers>();
          var service: TeamMembersService = new TeamMembersService();
          result.item = await service.insert(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/update",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<TeamMembers> = new ActionRes<TeamMembers>();
          var service: TeamMembersService = new TeamMembersService();
          result.item = await service.update(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
router.post("/delete",checkToken, async (req, res, next) => {
        try {
          var result: ActionRes<TeamMembers> = new ActionRes<TeamMembers>();
          var service: TeamMembersService = new TeamMembersService();
          result.item = await service.delete(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
      export { router as TeamMembersController}
