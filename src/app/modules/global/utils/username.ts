import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { ErrorResponse } from "../../global/models/errorres.model";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import { UsersWrapper } from "../../alarm/models/users.model";
import { UsersService } from "../../alarm/service/users.service";
import { ActionReq } from "../models/actionreq.model";
import { BaseService } from "../service/base.service";



export class username extends BaseService{


    async get(_req: UsersWrapper): Promise<UsersWrapper> {
        try {
            await using(this.db_provider.getDisposableDB(), async (db) => {
              await db.connect();
              var user_service: UsersService = new UsersService();
            
              try {                
                var req = new UsersWrapper();
                req.id = _req.id;
                req.first_name = this.environment.FIRSTNAME;
                req.middle_name = this.environment.MIDDLENAME;
                req.last_name = this.environment.LASTNAME;
             
             await user_service.getUserbyid(
                req
                );
              
                await db.commitTransaction();
              } catch (error) {
                await db.rollbackTransaction();
                throw error;
              }
            });
          } catch (e) {
            let error = e;
            throw error;
          }
          return _req;
        }











}