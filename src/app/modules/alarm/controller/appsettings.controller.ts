import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { AppSettingsService } from "../service/appsettings.service";
import { AppSettingsModel } from "../models/appsettings.model";
import * as _ from "lodash";
import { checkToken } from "../middleware/auth.middleware";
import { SettingsCriteria, SettingsModel } from "../models/settings.model";
import { checkPermissions } from "../../auth/middleware/permissions.middleware";
import { PrivilegePermissions } from "../../auth/models/permissions.model";

const router = express.Router();
router.get("/entity",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<AppSettingsModel> = new ActionRes<AppSettingsModel>({
      item: new AppSettingsModel(),
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get("/all", async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    // var id = _.get(req, "params.id", 0);
    var appsettings_list = await appsettings_service.getAppSettings();
    var result: ActionRes<AppSettingsModel> = new ActionRes<AppSettingsModel>({
      item: appsettings_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<object> = new ActionRes<object>();
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var env_settings = await appsettings_service.environmentSettings();
    result.item = env_settings;
    next(result);
  } catch (error) {
    next(error);
  }
});

// router.get(
// 	"/getADCredentials/:active_directory_root",
// 	checkToken,
// 	async (req, res, next) => {
// 		try {
// 			var appsettings_service: AppSettingsService = new AppSettingsService();
// 			var ad_name = _.get(req, "params.active_directory_root", "");
// 			var ad_credentials = await appsettings_service.getActiveDirectoryCredentials(
// 				ad_name
// 			);
// 			var result: ActionRes<AppSettingsWrapper> = new ActionRes<
// 				AppSettingsWrapper
// 			>({
// 				item: ad_credentials,
// 			});
// 			next (result);
// 		} catch (error) {
// 			next(error);
// 		}
// 	}
// );

router.put(
  "/",checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_SETTINGS],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  checkToken,
  async (req, res, next) => {
    try {
      var appsettings_service: AppSettingsService = new AppSettingsService();
      var appsettings: AppSettingsModel =
        await appsettings_service.updateAppSettings(req.body.item);
      var result: ActionRes<AppSettingsModel> = new ActionRes<AppSettingsModel>(
        {
          item: appsettings,
        }
      );
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/", checkToken,
  checkPermissions(
    [PrivilegePermissions.PERMISSIONS.CAN_MANAGE_SETTINGS],
    PrivilegePermissions.PERMISSION_CHECK_MODE.EVERY
  ),
  checkToken,
  async (req, res, next) => {
    try {
      var appsettings_service: AppSettingsService = new AppSettingsService();
      var appsettings: AppSettingsModel =
        await appsettings_service.insertAppSettings(
          new AppSettingsModel(req.body.item)
        );
      var result: ActionRes<AppSettingsModel> = new ActionRes<AppSettingsModel>(
        {
          item: appsettings,
        }
      );
      next(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/getappsetting",checkToken, async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var getFormat: SettingsModel = await appsettings_service.getSettings(
      req.body.item
    );
    var result: ActionRes<SettingsModel> = new ActionRes<SettingsModel>({
      item: getFormat,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/insertsettings",checkToken, async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var getFormat = await appsettings_service.addsettings(req.body.item);
    var result: ActionRes<SettingsModel> = new ActionRes<SettingsModel>({
      item: getFormat,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});
router.post("/updatesettings",checkToken, async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var getFormat = await appsettings_service.updatesettings(req.body.item);
    var result: ActionRes<SettingsModel> = new ActionRes<SettingsModel>({
      item: getFormat,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getTagsAndColorList",checkToken, async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var getFormat: Array<SettingsCriteria> =
      await appsettings_service.getTagsAndColorList();
    var result: ActionRes<Array<SettingsCriteria>> = new ActionRes<
      Array<SettingsCriteria>
    >();
    result.item = getFormat;
    next(result);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", checkToken, async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var id = _.get(req, "params.id", 0);
    var appsettings_list = await appsettings_service.getAppSettingsbyid(
      new AppSettingsModel({ id: id })
    );
    var result: ActionRes<Array<AppSettingsModel>> = new ActionRes<
      Array<AppSettingsModel>
    >({
      item: appsettings_list,
    });
    next(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getTagsAndColorList",checkToken, async (req, res, next) => {
  try {
    var appsettings_service: AppSettingsService = new AppSettingsService();
    var getFormat: Array<SettingsCriteria> =
      await appsettings_service.getTagsAndColorList();
    var result: ActionRes<Array<SettingsCriteria>> = new ActionRes<
      Array<SettingsCriteria>
    >();
    result.item = getFormat;
    next(result);
  } catch (error) {
    next(error);
  }
});

export { router as AppSettingsController };
