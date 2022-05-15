import * as _ from "lodash";
export class Environment {
  BASE_URL: string;
  PORT: number;
  ALARM: boolean;
  /* MLLP configuration */
  MLLP_PORT: number;
  /* Socket config */
  OPEN_EMR_PORT: number;
  // DB Vendor
  DB_VENDOR: Environment.DB_VENDOR;
  /* image uploader */
  IMAGE_FIELD: string;
  IMAGE_STORAGE: string;
  /* app mode */
  NODE_ENV: string;
  /* modules */
  AUTH: boolean;

  // user name
  FIRSTNAME: string;
  MIDDLENAME: string;
  LASTNAME: string;

  // postgres config
  PGUSER: string;
  PGHOST: string;
  PGPASSWORD: string;
  PGDATABASE: string;
  PGPORT: number;
  // mssql config
  SQL_SERVER_USER: string;
  SQL_SERVER_PASSWORD: string;
  SQL_SERVER: string;
  SQL_SERVER_INSTANCE: string;
  SQL_SERVER_DATABASE: string;
  SQL_SERVER_PORT: number;
  //JWT refer jsonwebtoken
  JWT_SECRET: string;
  TOKEN_EXPIRES_IN: any;
  //Session refer moment
  SESSION_EXPIRES_IN: any;
  //auth
  SECRET: string;
  ////ACTIVE DIRECTORY FOR LDAP
  // url: string="";
  // baseDN: string="";
  // username: string="";
  // password: string="";
  // Auth
  // Auth mode
  AUTH_MODE: string;
  AUTH_APP_NAME: string;
  AUTH_APP_SECRET: string;
  AUTH_SERVER_LOGIN_ENDPOINT: string;
  AUTH_UI_URL: string;
  AUTH_SERVER_URL: string;
  AUTH_SERVER_USERINFO_ENDPOINT: string;
  AUTH_SERVER_LOGOUT_ENDPOINT: string;
  AUTH_SERVER_REFRESH_TOKEN_ENDPOINT: string;
  // Pointofcare
  POC_SERVER_POC_USER_ENDPOINT: string;
  POC_SERVER_UNSUBSCRIBE_ENDPOINT: string;
  POC_SERVER_ENDPOINT: string;
  POC_SERVER_GET_ENDPOINT: string;
  // Appsettings
  APPSETTING_TAGS: string;
  // Team
  TEAM_SERVER_TEAM_USER_ENDPOINT: string;
  TEAM_SERVER_TEAMS_ENDPOINT: string;
  // smtp
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;

  /* IV gateway */
  IV_GATEWAY_BASEURL: string;
  IV_GATEWAY_REGISTER: string;
  IV_GATEWAY_LOGIN: string;
  IV_GATEWAY_CONFIG: string;
  IV_GATEWAY_ASSOCIATE: string;
  IV_GATEWAY_DISASSOCIATE: string;

  // ldap
  LDAP_URL: string;
  LDAP_BASE_DN: string;
  LDAP_USER_NAME: string;
  LDAP_PASSWORD: string;
  //privileges
  ID: number;
  IDENTIFIER: string;
  DISPLAYTEXT: string;
  ISACTIVE: boolean;
  /* Queue configuration */
  REDIS_URL: string;
  QUEUE_ENABLED: boolean;

  /* Scheduler configuration */
  SCHEDULER_ENABLED: boolean;

  language: Array<{ code: string; name: string }> = [];
  mail_subject: string;
  constructor() {
    var env = process.env;
    this.BASE_URL = _.get(env, "BASE_URL", "");
    this.PORT = parseInt(_.get(env, "PORT", "").trim());
    this.ALARM = _.get(env, "ALARM", "false") == "true" ? true : false;
    this.PORT = parseInt(_.get(env, "PORT", "3000").trim());
    this.IMAGE_FIELD = _.get(env, "IMAGE_FIELD", "");
    this.IMAGE_STORAGE = _.get(env, "IMAGE_STORAGE", "");
    this.NODE_ENV = _.get(process, "env.NODE_ENV", "development").trim();
    this.AUTH = _.get(process, "env.AUTH", "").trim() == "true";
    this.ALARM = _.get(process, "env.ALARM", "").trim() == "true";
    this.SQL_SERVER = _.get(env, "SQL_SERVER", "").trim();
    this.SQL_SERVER_USER = _.get(process, "env.SQL_SERVER_USER", "").trim();
    this.AUTH_MODE = _.get(env, "AUTH_MODE", "").trim();
    this.AUTH_SERVER_URL = _.get(env, "AUTH_SERVER_URL", "").trim();
    this.APPSETTING_TAGS = _.get(env, "APPSETTING_TAGS", "");
    /* privilege */
    this.IDENTIFIER = _.get(process, "env.IDENTIFIER", "").trim();
    this.DISPLAYTEXT = _.get(process, "env.DISPLAYTEXT", "").trim();
    this.ISACTIVE = _.get(process, "env.ISACTIVE", "").trim() == "true";
    this.ID = parseInt(_.get(env, "ID", "0").trim());
    /* user name */
    this.FIRSTNAME = _.get(process, "env.FIRSTNAME", "").trim();
    this.MIDDLENAME = _.get(process, "env.MIDDLENAME", "").trim();
    this.LASTNAME = _.get(process, "env.LASTNAME", "").trim();

    this.MLLP_PORT = parseInt(_.get(env, "MLLP_PORT", "0").trim());
    this.OPEN_EMR_PORT = parseInt(_.get(env, "OPEN_EMR_PORT", "0").trim());

    this.SQL_SERVER_PASSWORD = _.get(
      process,
      "env.SQL_SERVER_PASSWORD",
      ""
    ).trim();
    this.SQL_SERVER = _.get(process, "env.SQL_SERVER", "").trim();
    this.SQL_SERVER_INSTANCE = _.get(
      process,
      "env.SQL_SERVER_INSTANCE",
      ""
    ).trim();
    this.SQL_SERVER_DATABASE = _.get(
      process,
      "env.SQL_SERVER_DATABASE",
      ""
    ).trim();
    this.SQL_SERVER_PORT = parseInt(
      _.get(process, "env.SQL_SERVER_PORT", "0").trim()
    );
    this.DB_VENDOR = _.get(
      env,
      "DB_VENDOR",
      ""
    ).trim() as Environment.DB_VENDOR;

    this.PGUSER = _.get(env, "PGUSER", "").trim();
    this.PGHOST = _.get(env, "PGHOST", "").trim();
    this.PGPASSWORD = _.get(env, "PGPASSWORD", "").trim();
    this.PGDATABASE = _.get(env, "PGDATABASE", "").trim();
    this.PGPORT = parseInt(_.get(env, "PGPORT", "0").trim());

    this.SQL_SERVER = _.get(env, "SQL_SERVER", "").trim();
    this.SQL_SERVER_DATABASE = _.get(env, "SQL_SERVER_DATABASE", "").trim();
    this.SQL_SERVER_INSTANCE = _.get(env, "SQL_SERVER_INSTANCE", "").trim();
    this.SQL_SERVER_PASSWORD = _.get(env, "SQL_SERVER_PASSWORD", "").trim();
    this.SQL_SERVER_PORT = parseInt(_.get(env, "SQL_SERVER_PORT", "0").trim());
    this.SQL_SERVER_USER = _.get(env, "SQL_SERVER_USER", "").trim();

    this.JWT_SECRET = _.get(env, "JWT_SECRET", "").trim();
    this.TOKEN_EXPIRES_IN = JSON.parse(
      _.get(env, "TOKEN_EXPIRES_IN", '{"unit":"h","value":1}')
    );
    this.SESSION_EXPIRES_IN = JSON.parse(
      _.get(env, "SESSION_EXPIRES_IN", '{"unit":"d","value":2}')
    );
    this.SECRET = _.get(env, "SECRET", "");
    this.AUTH_APP_NAME = _.get(env, "AUTH_APP_NAME", "");
    this.AUTH_APP_SECRET = _.get(env, "AUTH_APP_SECRET", "");
    this.AUTH_SERVER_LOGIN_ENDPOINT = _.get(
      env,
      "AUTH_SERVER_LOGIN_ENDPOINT",
      ""
    );
    this.AUTH_UI_URL = _.get(env, "AUTH_UI_URL", "");
    this.AUTH_SERVER_URL = _.get(env, "AUTH_SERVER_URL", "");
    this.AUTH_SERVER_USERINFO_ENDPOINT = _.get(
      env,
      "AUTH_SERVER_USERINFO_ENDPOINT",
      ""
    );
    this.AUTH_SERVER_LOGOUT_ENDPOINT = _.get(
      env,
      "AUTH_SERVER_LOGOUT_ENDPOINT",
      ""
    );
    this.AUTH_SERVER_REFRESH_TOKEN_ENDPOINT = _.get(
      env,
      "AUTH_SERVER_REFRESH_TOKEN_ENDPOINT",
      ""
    );
    this.POC_SERVER_POC_USER_ENDPOINT = _.get(
      env,
      "POC_SERVER_POC_USER_ENDPOINT",
      ""
    );
    this.POC_SERVER_UNSUBSCRIBE_ENDPOINT = _.get(
      env,
      "POC_SERVER_UNSUBSCRIBE_ENDPOINT",
      ""
    );
    this.POC_SERVER_ENDPOINT = _.get(env, "POC_SERVER_ENDPOINT", "");
    this.POC_SERVER_GET_ENDPOINT = _.get(env, "POC_SERVER_GET_ENDPOINT", "");
    this.APPSETTING_TAGS = _.get(env, "APPSETTING_TAGS", "");
    this.TEAM_SERVER_TEAM_USER_ENDPOINT = _.get(
      env,
      "TEAM_SERVER_TEAM_USER_ENDPOINT",
      ""
    );
    this.TEAM_SERVER_TEAMS_ENDPOINT = _.get(
      env,
      "TEAM_SERVER_TEAMS_ENDPOINT",
      ""
    );
    this.PGUSER = _.get(env, "PGUSER", "").trim();
    this.PGHOST = _.get(env, "PGHOST", "").trim();
    this.PGPASSWORD = _.get(env, "PGPASSWORD", "").trim();
    this.PGDATABASE = _.get(env, "PGDATABASE", "").trim();
    this.PGPORT = parseInt(_.get(env, "PGPORT", "0").trim());
    this.IV_GATEWAY_BASEURL = _.get(env, "IV_GATEWAY_BASEURL", "");
    this.IV_GATEWAY_REGISTER = _.get(env, "IV_GATEWAY_REGISTER", "");
    this.IV_GATEWAY_LOGIN = _.get(env, "IV_GATEWAY_LOGIN", "");
    this.IV_GATEWAY_CONFIG = _.get(env, "IV_GATEWAY_CONFIG", "");
    this.IV_GATEWAY_ASSOCIATE = _.get(env, "IV_GATEWAY_ASSOCIATE", "");
    this.IV_GATEWAY_DISASSOCIATE = _.get(env, "IV_GATEWAY_DISASSOCIATE", "");

    this.LDAP_URL = _.get(env, "LDAP_URL", "");
    this.LDAP_BASE_DN = _.get(env, "LDAP_BASE_DN", "");
    this.LDAP_USER_NAME = _.get(env, "LDAP_USER_NAME", "");
    this.LDAP_PASSWORD = _.get(env, "LDAP_PASSWORD", "");

    this.REDIS_URL = _.get(env, "REDIS_URL", "");
    this.QUEUE_ENABLED =
      _.get(env, "QUEUE_ENABLED", "false") == "true" ? true : false;
    this.SCHEDULER_ENABLED =
      _.get(env, "SCHEDULER_ENABLED", "false") == "true" ? true : false;

    // smtp
    this.smtp_server = env.smtp_server ? env.smtp_server : "";
    this.smtp_port =
      env.smtp_port && !isNaN(parseInt(env.smtp_port))
        ? parseInt(env.smtp_port)
        : 587;
    this.smtp_username = env.smtp_username ? env.smtp_username : "";
    this.smtp_password = env.smtp_password ? env.smtp_password : "";
    this.smtp_secure =
      env.smtp_secure && env.smtp_secure.trim().toUpperCase() == "TRUE"
        ? true
        : false;
    this.language = JSON.parse(_.get(env, "language", "[]"));
    this.mail_subject = env.mail_subject ? env.mail_subject : "";
  }
  static getInstance() {
    return new Environment();
  }
}

export class Duration {
  unit: string = "";
  value: number = 0;
}
export namespace Environment {
  export enum DB_VENDOR {
    mssql = "MSSQL",
    pg = "PG",
  }
  export enum AuthMode {
    NATIVE = "NATIVE",
    LDAP = "LDAP",
  }
}
