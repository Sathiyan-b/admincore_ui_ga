import sql from "mssql";
import { IDisposable, Environment, DB } from ".";
import { ConnectionPool, Transaction, Request, TYPES, config } from "mssql";
import * as _ from "lodash";
import moment from "moment";
import { DisposablePool } from "./db";

export class MSSQLDB implements DB {
  CLASS_TAG: string = "MSSQLDisposablePool";
  is_transaction_enabled: boolean = false;
  config: config;
  pool: ConnectionPool;
  client: ConnectionPool | null = null;
  transaction: Transaction | null = null;
  constructor(config?: config) {
    if (config) {
      this.config = config;
    } else {
      const environment = new Environment();
      this.config = {
        user: environment.SQL_SERVER_USER,
        password: environment.SQL_SERVER_PASSWORD,
        server: environment.SQL_SERVER as string,
        database: environment.SQL_SERVER_DATABASE as string,
        port: environment.SQL_SERVER_PORT,
        options: {
          useUTC: false,
          encrypt: false, // Use this if you're on Windows Azure
          instanceName: environment.SQL_SERVER_INSTANCE,
        },
      };
    }
    this.pool = new sql.ConnectionPool(this.config);
  }
  getDisposablePool(): DisposablePool {
    throw new Error("Method not implemented.");
  }
  async connect(): Promise<void> {
    let METHOD_TAG: string = "connect";
    try {
      this.client = await this.pool.connect();
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
  }
  async beginTransaction(): Promise<void> {
    let METHOD_TAG: string = "beginTransaction";
    try {
      if (this.client == null) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} : ${Environment.DB_VENDOR.mssql} DB client not initialized`
        );
      }
      this.transaction = new sql.Transaction(this.client);
      await this.transaction.begin();
      this.is_transaction_enabled = true;
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
  }
  async commitTransaction(): Promise<void> {
    let METHOD_TAG: string = "commitTransaction";
    try {
      if (this.is_transaction_enabled == false) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} : transaction not begun`
        );
      }
      if (this.client == null) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} DB client not initialized`
        );
      }
      if (this.transaction == null) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} DB transaction not initialized`
        );
      }
      await this.transaction.commit();
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
  }
  async rollbackTransaction(): Promise<void> {
    let METHOD_TAG: string = "rollbackTransaction";
    try {
      if (this.is_transaction_enabled == false) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} : transaction not begun`
        );
      }
      if (this.client == null) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} DB client not initialized`
        );
      }
      if (this.transaction == null) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} DB transaction not initialized`
        );
      }
      await this.transaction.rollback();
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
  }
  async executeQuery(query: string, inputs: Object = {}): Promise<any[]> {
    let METHOD_TAG: string = "executeQuery";
    let result: Array<any> = [];
    try {
      if (this.client == null) {
        throw new Error(
          `${this.CLASS_TAG} : ${METHOD_TAG} DB client not initialized`
        );
      }
      query = this.dbSpecificQueryChanges(query);
      let request: Request;
      if (this.is_transaction_enabled == true) {
        if (this.transaction == null) {
          throw new Error(
            `${this.CLASS_TAG} : ${METHOD_TAG} DB transaction not initialized`
          );
        }
        request = new sql.Request(this.transaction);
      } else {
        request = new sql.Request(this.client);
      }
      this.addInputs(request, inputs);
      let db_resp = await request.query(query);
      result = db_resp.recordset;
      /* convert nvarchar to json */
      _.forEach(result, (row) => {
        _.forEach(row, (v, k) => {
          if (typeof v == "string" && this.isJson(v)) {
            row[k] = JSON.parse(v);
          }
        });
      });
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
    return result;
  }
  async dispose(): Promise<void> {
    let METHOD_TAG: string = "dispose";
    try {
      if (this.client) this.client.close();
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
  }
  dbSpecificQueryChanges(query: string) {
    query = query.replace(/returning \*/gi, "; select SCOPE_IDENTITY() as id");
    query = query.replace(/returning id/gi, "; select SCOPE_IDENTITY() as id");
    query = query.replace(/false/gi, "0");
    query = query.replace(/true/gi, "1");
    return query;
  }
  addInputs(request: Request, inputs: Object) {
    _.forEach(inputs, (value, key) => {
      let temp :any= value;
      if (typeof temp == "boolean") {
        temp = temp == true ? 1 : 0;
      }
      request.input(key, temp);
    });
  }
  isJson = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
}
