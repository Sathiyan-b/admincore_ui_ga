import { using, Environment } from "../../global/utils";
import { BaseService } from "./base.service";
import * as _ from "lodash";
import path from "path";
import fs from "fs";
export class UploadService extends BaseService {
  constructor() {
    super();
    this.environment = new Environment();
  }
  environment: Environment;
  async deleteImage(_req: string): Promise<boolean> {
    var result: boolean = false;
    try {
      var base_path = path.resolve(this.environment.IMAGE_STORAGE || "images");

      var size_list: Array<string> = ["lg", "md", "sm"];
      var [file_name, extension] = _req.split(".");
      _.forEach(size_list, (size) => {
        var file_path: string = `${base_path}\\responsive\\${file_name}_${size}.${extension}`;
        if (fs.existsSync(file_path)) {
          fs.unlinkSync(file_path);
        }
      });
      result = true;
    } catch (e) {
      var error = e;
      throw error;
    }
    return result;
  }
}
