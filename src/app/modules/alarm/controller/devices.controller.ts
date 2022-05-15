import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { Devices, DevicesWrapper } from "../models/devices.model";
import { DevicesService } from "../service/devices.service";
import * as _ from "lodash";
import { checkToken } from "../middleware/auth.middleware";
const router = express.Router();
router.get("/entity", async (req, res, next) => {
  try {
    var result: ActionRes<Devices> = new ActionRes<Devices>();
    next(result);
  } catch (error) {
    next(error);
  }
});


router.get("/getDevicesForAssociate/:identifier", async (req, res, next) => {
  try {
    var result: ActionRes<Array<DevicesWrapper>> = new ActionRes<Array<DevicesWrapper>>();
    result.item = Array<DevicesWrapper>();
    var _device_identifier =_.get(req, "params.identifier", "")
    var service: DevicesService = new DevicesService();
    result.item = await service.getDevicesForAssociate(_device_identifier);
    next(result);
  } catch (error) {
    next(error);
  }
});


router.get("/getAssociatedDevices", async (req, res, next) => {
  try {
    var result: ActionRes<Array<DevicesWrapper>> = new ActionRes<Array<DevicesWrapper>>();
    result.item = Array<DevicesWrapper>();
    var service: DevicesService = new DevicesService();
    result.item = await service.getAssociatedDevices();
    next(result);
  } catch (error) {
    next(error);
  }
});

// router.use(checkToken);

router.post("/get",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<Devices>> = new ActionRes<Array<Devices>>();
    result.item = Array<Devices>();
    var service: DevicesService = new DevicesService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/createinbulk",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Array<Devices>> = new ActionRes<Array<Devices>>();
    var service: DevicesService = new DevicesService();
    var request: Array<Devices> = new Array<Devices>();
    _.forEach(req.body.item, (v: Devices) => {
      request.push(v);
    });
    result.item = await service.insert(request);
    next(result);
  } catch (error) {
    next(error);
  }
});
router.put("/",checkToken, async (req, res, next) => {
  try {
    var result: ActionRes<Devices> = new ActionRes<Devices>();
    var service: DevicesService = new DevicesService();
    result.item = await service.update(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});
// router.post("/delete", async (req, res, next) => {
//   try {
//     var result: ActionRes<Devices> = new ActionRes<Devices>();
//     var service: DevicesService = new DevicesService();
//     result.item = await service.delete(req.body.item);
//     next(result);
//   } catch (error) {
//     next(error);
//   }
// });
router.put("/deleteinbulk",checkToken, async (req, res, next) => {
  try {
    var device_service: DevicesService = new DevicesService();
    var request: Devices = new Devices();
    request = req.body.item;
    // _.forEach(req.body.item, (v:Devices) => {
    //   request.push((v));
    // });

    var result: ActionRes<Devices> = new ActionRes<Devices>();
    result.item = await device_service.deleteDeviceInBulk(request);
    // result.item  = role_list;
    next(result);
  } catch (error) {
    next(error);
  }
});

router.put("/togglesuspendinbulk",checkToken, async (req, res, next) => {
  try {
    var device_service: DevicesService = new DevicesService();
    var request: Devices = new Devices();
    request = req.body.item;
    // _.forEach(req.body.item, (v:Devices) => {
    //   request.push((v));
    // });

    var result: ActionRes<Devices> = new ActionRes<Devices>();
    result.item = await device_service.togglesuspendDeviceInBulk(request);

    next(result);
  } catch (error) {
    next(error);
  }
});

router.post("/getdevicesforuserpoc",checkToken, async (req, res, next) => {
  try {
    var device_service: DevicesService = new DevicesService();
    var _req = new DevicesWrapper();
    var device_list = await device_service.getdevicesforuserpoc(
      _req,
    );
    var result: ActionRes<Array<DevicesWrapper>> = new ActionRes<
      Array<DevicesWrapper>
    >();
    result.item = device_list;
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});



export { router as DevicesController };
