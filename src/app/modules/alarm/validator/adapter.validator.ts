// import Joi, { number, string } from "joi";
// import * as _ from "lodash";
// import { BaseValidator } from "./base.validator";

// export class AdapterValidator extends BaseValidator {
//   assign_adapter = Joi.object()
//     .keys({
//       driver_id: number().max(8).allow(0),
//       driver_name: string().trim().required(),
//       cable_name: string().trim().max(50).required(),
//     })
//     .unknown();

//   bulk_assign_adapter = Joi.array().items(this.assign_adapter);
// }
