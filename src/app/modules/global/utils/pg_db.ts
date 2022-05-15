import { DB, IDisposable } from ".";
/* types */
import { Pool, PoolClient } from "pg";
import _, { values } from "lodash";
import moment from "moment";
import { DisposablePool } from "./db";
/* global postgres pool */
const global_pool: Pool = new Pool();
export class PGDisposablePool implements IDisposable {
  CLASS_TAG: string = "PGDisposablePool";
  pool: Pool;
  client: PoolClient | null = null;
  constructor(pool?: Pool) {
    if (pool) {
      this.pool = pool;
    } else {
      this.pool = global_pool;
    }
  }
  async connect(): Promise<PoolClient> {
    try {
      this.client = await this.pool.connect();
    } catch (e) {
      throw e;
    }
    return this.client;
  }
  async dispose() {
    try {
      if (this.client) this.client.release();
    } catch (e) {
      throw e;
    }
  }
}
export class PG_DB {
  constructor() {}
  public getPGDisposablePool() {
    return new PGDisposablePool();
  }
}

export class PGDB implements DB {
  CLASS_TAG: string = "PGDB";
  pool: Pool;
  client: PoolClient | null = null;
  is_transaction_enabled: boolean = false;
  constructor() {
    this.pool = global_pool;
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
          `${this.CLASS_TAG} : ${METHOD_TAG} : DB client not initialized`
        );
      }
      await this.client.query("BEGIN");
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
          `${this.CLASS_TAG} : ${METHOD_TAG} : DB client not initialized`
        );
      }
      await this.client.query("COMMIT");
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
          `${this.CLASS_TAG} : ${METHOD_TAG} : DB client not initialized`
        );
      }
      await this.client.query("ROLLBACK");
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
          `${this.CLASS_TAG} : ${METHOD_TAG} : DB client not initialized`
        );
      }
      query = this.addInputs(query, inputs);
      var db_resp = await this.client.query(query);
      result = db_resp.rows;
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
    return result;
  }
  addInputs(query: string, inputs: Object) {
    let result = query;
    _.forEach(inputs, (value, key) => {
      let input_string = "";
      switch (typeof value) {
        case "string":
          input_string = `'${value}'`;
          break;
        case "number":
          input_string = `${value}`;
          break;
        case "boolean":
          input_string = `${value ? "TRUE" : "FALSE"}`;
          break;
        default:
          if (value instanceof Date)
            input_string = `${moment(value).format(
              "YYYY-MM-dd HH:mm:ss.SSSZ"
            )}`;
          break;
      }
      result = result.replace(new RegExp(`@${key}`, "ig"), input_string);
    });
    return result;
  }
  async dispose(): Promise<void> {
    let METHOD_TAG: string = "dispose";
    try {
      if (this.client) this.client.release();
    } catch (error) {
      console.log(`${this.CLASS_TAG} : ${METHOD_TAG}`, error);
      throw error;
    }
  }
}
