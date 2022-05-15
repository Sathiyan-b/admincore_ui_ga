import multer from "multer";
import { Request } from "express";
import Jimp from "jimp";
import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";
import crypto from "crypto";
import * as _ from "lodash";
import streamifier from "streamifier";
import concat from "concat-stream";
import { Environment } from ".";
interface CustomImageStorageProps {
  storage: "local";
  output: "jpg" | "png";
  greyscale: boolean;
  /**
   * quality should be between 0 and 100
   */
  quality: number;
  square: boolean;
  /**
   * threshold should be greater than 0
   */
  threshold: number;
  responsive: boolean;
}
export class CustomImageStorage implements multer.StorageEngine {
  constructor(props: CustomImageStorageProps) {
    this.environment = new Environment();
    this.setup(props);
  }
  environment: Environment;
  options: CustomImageStorageProps = {
    storage: "local",
    output: "png",
    greyscale: false,
    quality: 70,
    square: true,
    threshold: 500,
    responsive: true,
  };
  upload_path: string = "";
  upload_base_url: string = "";
  setup(props: Partial<CustomImageStorageProps>): void {
    this.options = {
      ...this.options,
      ...props,
    };
    var UPLOAD_PATH = path.resolve(this.environment.IMAGE_STORAGE || "images");
    // var BASE_URL = path.resolve(process.env.IMAGE_BASE_URL || "/images");
    // set the upload path
    this.upload_path = this.options.responsive
      ? path.join(UPLOAD_PATH, "responsive")
      : UPLOAD_PATH;

    // set the upload base url
    // this.upload_base_url = this.options.responsive
    //   ? path.join(BASE_URL, "responsive")
    //   : BASE_URL;
    if (this.options.storage == "local") {
      // if upload path does not exist, create the upload path structure
      !fs.existsSync(this.upload_path) && mkdirp.sync(this.upload_path);
    }
  }
  _generateRandomFilename(): string {
    // create pseudo random bytes
    var bytes = crypto.pseudoRandomBytes(32);

    // create the md5 hash of the random bytes
    var checksum = crypto.createHash("MD5").update(bytes).digest("hex");

    // return as filename the hash with the output extension
    return checksum + "." + this.options.output;
  }
  _createOutputStream(file_path: string, callback: (...args: any[]) => void) {
    var output: fs.WriteStream = fs.createWriteStream(file_path);
    output.on("error", callback);
    output.on("finish", () => {
      callback(null, {
        destination: this.upload_path,
        // baseUrl: this.upload_base_url,
        filename: path.basename(file_path),
        // storage: this.options.storage,
      });
    });
    return output;
  }
  _processImage(image: Jimp, callback: (...args: any[]) => void) {
    var batch: Array<{
      stream: fs.WriteStream;
      image: Jimp;
    }> = [];
    var size_list: Array<string> = ["lg", "md", "sm"];
    var filename: string = this._generateRandomFilename();
    var mime: string = Jimp.MIME_PNG;
    var clone: Jimp = image.clone();
    var width: number = clone.bitmap.width;
    var height: number = clone.bitmap.height;
    var square: number = Math.min(width, height);
    var threshold: number = this.options.threshold;
    // resolve the Jimp output mime type
    switch (this.options.output) {
      case "jpg":
        mime = Jimp.MIME_JPEG;
        break;
      case "png":
      default:
        mime = Jimp.MIME_PNG;
        break;
    }
    // auto scale the image dimensions to fit the threshold requirement
    if (threshold && square > threshold) {
      clone =
        square == width
          ? clone.resize(threshold, Jimp.AUTO)
          : clone.resize(Jimp.AUTO, threshold);
    }
    // crop the image to a square if enabled
    if (this.options.square) {
      if (threshold) {
        square = Math.min(square, threshold);
      }

      // fetch the new image dimensions and crop
      clone = clone.crop(
        (clone.bitmap.width % square) / 2,
        (clone.bitmap.height % square) / 2,
        square,
        square
      );
    }
    // convert the image to greyscale if enabled
    if (this.options.greyscale) {
      clone = clone.greyscale();
    }

    // set the image output quality
    clone = clone.quality(this.options.quality);

    if (this.options.responsive) {
      // map through the responsive sizes and push them to the batch
      batch = _.map(size_list, (size) => {
        var output_stream: fs.WriteStream;

        var image: Jimp | null = null;
        var filepath: string | Array<String> = filename.split(".");

        // create the complete filepath and create a writable stream for it
        filepath = filepath[0] + "_" + size + "." + filepath[1];
        filepath = path.join(this.upload_path, filepath);
        output_stream = this._createOutputStream(filepath, callback);

        // scale the image based on the size
        switch (size) {
          case "sm":
            image = clone.clone().scale(0.3);
            break;
          case "md":
            image = clone.clone().scale(0.7);
            break;
          case "lg":
            image = clone.clone();
            break;
        }

        // return an object of the stream and the Jimp image
        return {
          stream: output_stream,
          image: image!,
        };
      });
    } else {
      batch.push({
        stream: this._createOutputStream(
          path.join(this.upload_path, filename),
          callback
        ),
        image: clone,
      });
    }

    // process the batch sequence
    _.each(batch, (current) => {
      // get the buffer of the Jimp image using the output mime type
      current.image.getBuffer(mime, (err, buffer) => {
        if (this.options.storage == "local") {
          // create a read stream from the buffer and pipe it to the output stream
          streamifier.createReadStream(buffer).pipe(current.stream);
        }
      });
    });
  }
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void
  ): void {
    var fileManipulate = concat((image_data) => {
      // read the image buffer with Jimp
      // it returns a promise
      Jimp.read(image_data)
        .then((image) => {
          // process the Jimp image buffer
          this._processImage(image, callback);
        })
        .catch(callback);
    });
    // write the uploaded file buffer to the fileManipulate stream
    file.stream.pipe(fileManipulate);
  }
  _removeFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void
  ): void {
    var matches: RegExpMatchArray | null;
    var pathsplit: Array<String> = [];
    var filename = file.filename;
    var _path: string = path.join(this.upload_path, filename);
    var paths: Array<string> = [];

    // delete the file properties
    // delete file.filename;
    // delete file.destination;
    // delete file.baseUrl;
    // delete file.storage;

    // create paths for responsive images
    if (this.options.responsive) {
      pathsplit = _path.split("/");
      matches = pathsplit.pop()!.match(/^(.+?)_.+?\.(.+)$/i);

      if (matches) {
        paths = _.map(["lg", "md", "sm"], function (size) {
          return (
            pathsplit.join("/") +
            "/" +
            (matches![1] + "_" + size + "." + matches![2])
          );
        });
      }
    } else {
      paths = [_path];
    }

    // delete the files from the filesystem
    _.each(paths, function (_path) {
      fs.unlink(_path, callback);
    });
  }
}

// setup a new instance of the AvatarStorage engine
var storage = new CustomImageStorage({
  square: false,
  responsive: true,
  greyscale: false,
  quality: 90,
} as CustomImageStorageProps);

var limits = {
  files: 1, // allow only 1 file per request
  fileSize: 1024 * 1024 * 10, // 10 MB (max file size)
};

var fileFilter = function (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) {
  // supported image file mimetypes
  var allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/gif"];

  if (_.includes(allowedMimes, file.mimetype)) {
    // allow supported image files
    callback(null, true);
  } else {
    // throw error for invalid files
    callback(
      new Error(
        "Invalid file type. Only jpg, png and gif image files are allowed."
      )
    );
  }
};

// setup multer
export var CustomImageUploader: multer.Multer = multer({
  storage: storage,
  limits: limits,
  fileFilter: fileFilter,
});
