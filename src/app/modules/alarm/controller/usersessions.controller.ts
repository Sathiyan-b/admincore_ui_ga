import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { checkToken } from "../middleware/auth.middleware";
import {
  UserSessions,
  UserSessionsWrapper,
} from "../models/usersessions.model";
import { UserSessionsService } from "../service/usersessions.service";
const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<UserSessions> = new ActionRes<UserSessions>({
      item: new UserSessions(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<UserSessions>> = new ActionRes<
      Array<UserSessions>
    >();
    var service: UserSessionsService = new UserSessionsService();
    result.item = await service.get(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/insert",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<UserSessions> = new ActionRes<UserSessions>();
    var service: UserSessionsService = new UserSessionsService();
    result.item = await service.insert(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/update",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<UserSessions> = new ActionRes<UserSessions>();
    var service: UserSessionsService = new UserSessionsService();
    result.item = await service.update(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
// router.post("/delete", async (req, res, next) => {
//   try {
//     var result: ActionRes<UserSessions> = new ActionRes<UserSessions>();
//     var service: UserSessionsService = new UserSessionsService();
//     result.item = await service.delete(req.body.item);
//     next(result);
//   } catch (error) {
//     next(error);
//   }
// });
export { router as UserSessionsController };
