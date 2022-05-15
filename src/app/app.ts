/* load environment variables */
process.env.TZ = "UTC";
import dotenv from "dotenv";
const env_variables: DotenvConfigOutput = dotenv.config({
  path: ".env",
});
/* libraries */
import express from "express";
import  { json as json_body_parser, text as text_body_parser } from "body-parser";
import cors from "cors";
import compression from "compression";
import errorHandler from "errorhandler";
import * as _ from "lodash";
import httpContext from "express-http-context";
// var path = require("path");
import path from "path";
/* types */
import { Logger } from "log4js";
import * as ExpressCore from "express-serve-static-core";
import { DotenvConfigOutput } from "dotenv";
/* user defined imports */
import { Preset } from "./preset";
import {
  logger,
  Environment,
  json_custom_stringifier,
} from "./modules/global/utils";
import { ALARMModule } from "./modules/alarm";
import { AuthModule } from "./modules/auth";
import { GlobalModule } from "./modules/global";

export class ExpressApp {
  /* create express app */
  app: ExpressCore.Express = express();

  /* global logger */
  global_logger: Logger = logger.getLogger("[INITIALIZATION]");

  /* environment */
  environment?: Environment;

  /* ui path */
  ui_dist_path = path.join(__dirname, "../../ui-dist");
  constructor() {
    this.init();
  }

  init = () => {
    /* load environment variables */
    this.environment = new Environment();

    this.global_logger.info(
      "ENVIRONMENT VARIABLES -> " +
        json_custom_stringifier.stringify(this.environment)
    );

    /* set host ip address */
    this.app.set("host", process.env.HOST || "0.0.0.0");

    /* set port */
    this.app.set("port", this.environment.PORT || 3000);

    /* omit to use hit server with self signed certificate */
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    /* enable cross origin resource sharing */
    this.app.use(cors());

    /* static resource */
    this.app.use("/assets", express.static("assets"));
    this.app.use(express.static(this.ui_dist_path));

    /* response compression middleware */
    this.app.use(compression());

    /* middleware that only parses json and only looks at requests where the Content-Type header matches the type option. */
    this.app.use(json_body_parser());

    this.app.use(text_body_parser());

    /* user context middleware */
    this.app.use(httpContext.middleware);
    
    /* global module */
    this.app.use("/global/api", GlobalModule);

    /* auth module */
    if (this.environment.AUTH) this.app.use("/auth/api", AuthModule);

    /* alarm module */
    if (this.environment.ALARM)
      this.app.use("/admincore/api", ALARMModule);

    /* ui */
    this.app.get("*", (req, res, next) => {
      try {
        res.sendFile(this.ui_dist_path + "/index.html");
      } catch (error) {
        next(error);
      }
    });

    /* unexpected server error handler */
    if (this.environment.NODE_ENV == "development") {
      /* only use in development */
      /* renders error message as readable html format */
      this.app.use(errorHandler());
    } else {
      /* returns blunt error on production mode for integrity */
      this.app.use((err: any, req: any, res: any, next: any) => {
        res.status(500).send("Server Error");
      });
    }
  };
  startErrorServer = () => {
    var error_server: ExpressCore.Express = express();
    /* set host ip address */
    error_server.set("host", process.env.HOST || "0.0.0.0");

    /* set port */
    error_server.set("port", this.environment!.PORT || 3000);

    /* enable cross origin resource sharing */
    error_server.use(cors());

    /* make ui static resource */
    error_server.use(express.static(this.ui_dist_path));

    /* response compression middleware */
    error_server.use(compression());

    /* ui */
    error_server.get("*", (req, res, next) => {
      try {
        var path = req.path;
        if (req.path != "/servererror") {
          res.redirect("/servererror");
        }
        res.sendFile(this.ui_dist_path + "/index.html");
      } catch (error) {
        next(error);
      }
    });
    error_server.listen(
      error_server.get("port"),
      error_server.get("host"),
      () => {
        this.global_logger.error(
          `Error Server running at http://${error_server.get(
            "host"
          )}:${error_server.get("port")}`
        );
      }
    );
  };
  start = async () => {
    try {
      /* preset before starting server */
      const preset = new Preset();

      /* parallel preset, server wont wait for it to complete */
      preset.synchronous();

      /* server will wait for this preset to complete if it throws any error server wont start */
      await preset.asynchronous();

    } catch (e) {
      var error = e;
      this.global_logger.error(
        "Failed ->",
        json_custom_stringifier.stringify(error)
      );
      //   this.startErrorServer();
    } finally {
      /* start the server */
      this.app.listen(this.app.get("port"), this.app.get("host"), () => {
        this.global_logger.info(
          `Server running at http://${this.app.get("host")}:${this.app.get(
            "port"
          )}`
        );
      });
    }
  };
}
