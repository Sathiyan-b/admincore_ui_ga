import { DB, Environment } from ".";
import { MSSQLDB } from "./mssql_db";
import { PGDB } from "./pg_db";

export class DBProvider {
  CLASS_TAG: string = "DBProvider";
  db_vendor: Environment.DB_VENDOR;
  constructor() {
    this.db_vendor = new Environment().DB_VENDOR;
  }
  getDisposableDB(): DB {
    let result: DB;
    switch (this.db_vendor) {
      case Environment.DB_VENDOR.pg:
        result = new PGDB();
        break;
      case Environment.DB_VENDOR.mssql:
        result = new MSSQLDB();
        break;
      default:
        result = new PGDB();
        break;
    }
    return result;
  }
}
