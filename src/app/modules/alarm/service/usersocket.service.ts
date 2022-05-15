import { BaseService } from "./base.service";
import WebSocket from "ws";
import QueryString from "query-string";
import * as http from "http";
import { GlobalBaseService } from "../../global/service/globalbase.service";
import _ from "lodash";
import jwt, { decode } from "jsonwebtoken";
import { Server as WebSocketServer } from "ws";
import stream from "stream";
import { Socket } from "net";
import { ErrorResponse } from "../../global/models/errorres.model";
import * as uuid from "uuid";
import { global_logger } from "../../global/utils";
import { AuthService } from "./auth.service";
import { GuardianUserSessions, GuardianUserSessionsWrapper } from "../models/guardianusersessions.model";
import { SocketMessage } from "../models/usersocket.model";
import { DevicesWrapper } from "../models/devices.model";
export class UserSocketService extends BaseService {
  websocketServer: WebSocketServer | null = null;
  // usersockets: { [key: string]: WebSocket } = {};
  usersockets: Array<{
    user_id: number;
    session_id: string;
    order_id: number;
    socket: WebSocket;
  }> = [];
  addSocket = (server: http.Server) => {
    try {
      this.websocketServer = new WebSocketServer({
        noServer: true,
        path: "/usersocket",
      });

      server.on(
        "upgrade",
        (request: http.IncomingMessage, socket: Socket, head: Buffer) => {
          this.websocketServer!.handleUpgrade(
            request,
            socket,
            head,
            (websocket) => {
              this.websocketServer!.emit("connection", websocket, request);
            }
          );
        }
      );
      this.invalidateSockets();
      this.websocketServer.on("connection", this.onConnection);
    } catch (e) {
      var error = e;
      throw error;
    }
  };
  onConnection = (websocket: WebSocket, request: http.IncomingMessage) => {
    try {
      // let params : QueryString.ParsedQuery | null = null;
      // if(request && request.url){
      //     let [path,queryparamstring] = request.url.split("?");
      //     params = QueryString.parse(queryparamstring)
      // }
      var session: GuardianUserSessions = new GuardianUserSessions();
      var socketid: string = "";
      websocket.on("message", async (message) => {
        global_logger.info("on message ", message.toString());

        session = await this.validateToken(message.toString());
        if (session.user_id == 0) {
          websocket.close(
            1014,
            JSON.stringify(
              new ErrorResponse({
                message: "Unauthorized",
              })
            )
          );
        } else {
          // socketid = session.user_id + "_" + uuid.v4();

          var socket_index = this.usersockets.findIndex((v1) => {
            if (v1 && v1.user_id) return v1.user_id == session.user_id;
          });
          if (socket_index != -1) {
            this.usersockets[socket_index].socket = websocket;
          } else {
            this.usersockets.push({
              user_id: session.user_id || 0,
              session_id: session.access_token || "",
              order_id: 0,
              socket: websocket,
            });
          }
          global_logger.info("[SOCKET LIST] ", this.usersockets);
          //   do {
          //   socketid = userid + "_" + uuid.v4();
          // } while (_.has(this.usersockets, socketid));
          // this.usersockets[socketid] = websocket;
        }

        // userid = await this.validateToken(message.toString());
        // if (userid == 0) {
        //   websocket.close(
        //     1014,
        //     JSON.stringify(
        //       new ErrorResponse({
        //         message: "Unauthorized"
        //       })
        //     )
        //   );
        // } else {
        //   do {
        //     socketid = userid + "_" + uuid.v4();
        //   } while (_.has(this.usersockets, socketid));
        //   this.usersockets[socketid] = websocket;
        // }
      });
      websocket.on("close", () => {
        global_logger.info("on close ");

        if (session.user_id != 0 && session.access_token!.length > 0) {
          var socket_index = this.usersockets.findIndex((v1) => {
            return v1.user_id == session.user_id;
          });
          if (socket_index != -1) {
            this.usersockets.splice(socket_index, 1);
            // delete this.usersockets[socket_index];
          }
        }
      });
      websocket.on("error", () => {
        global_logger.info("on error ");
        if (session.user_id != 0 && session.access_token!.length > 0) {
          var socket_index = this.usersockets.findIndex((v1) => {
            return v1.user_id == session.user_id;
          });
          if (socket_index != -1) {
            this.usersockets.splice(socket_index, 1);
            // delete this.usersockets[socket_index];
          }
        }
      });
    } catch (error) {
      this.log(GlobalBaseService.LogLevels.error, error);
    }
  };

  // setPatientOrderID = (patient_order_id: number): boolean => {
  //   var global_service: GlobalBaseService = new GlobalBaseService();
  //   var result: boolean = false;
  //   global_logger.info("[USER CONTEXT] ", this.user_context);
  //   try {
  //     var user_id = global_service.user_context.user.id;
  //     var token = global_service.user_context.token;
  //     var socket_index = this.usersockets.findIndex((v1) => {
  //       return v1.user_id == user_id && v1.session_id == token;
  //     });
  //     if (socket_index != -1) {
  //       this.usersockets[socket_index].order_id = patient_order_id;
  //       this.usersockets[socket_index].socket.send(patient_order_id);
  //       result = true;
  //     }
  //   } catch (error) {}
  //   return result;
  // };

  sendGraphData = (patient_order_id: number) => {
    try {
      var sockts = this.usersockets.filter((v1) => {
        return v1.order_id == patient_order_id;
      });
      sockts.forEach((v2) => {
        let result = true;
        var _post_data = new SocketMessage();
        _post_data.alarm_type = SocketMessage.MESSAGE_TYPES.GRAPH_DATA;
        _post_data.patient_order_id = patient_order_id;
        v2.socket.send(JSON.stringify(_post_data));
      });
    } catch (error) {
      this.log(GlobalBaseService.LogLevels.error, error);
    }
  };

  sendAlarmNotification = (userid: number, alarm_obs: DevicesWrapper) => {
    try {
      var socket = this.usersockets.find((v1) => {
        return v1.user_id == userid;
      });
      if (socket != undefined) {
        let _post_data = new SocketMessage();
        _post_data.alarm_type = SocketMessage.MESSAGE_TYPES.ALARM;
        _post_data.alarm_obs = alarm_obs;
        socket.socket.send(JSON.stringify(_post_data));
      }
    } catch (error) {
      this.log(GlobalBaseService.LogLevels.error, error);
    }
  };

  sendNotification = (userid: number, data: Object) => {
    try {
      var keys = _.filter(_.keys(this.usersockets), (v) => {
        let userid_temp = parseInt(v.split("_")[0] as string);
        return userid_temp == userid;
      });
      // _.forEach(keys, v => {
      //   this.usersockets[v].send(JSON.stringify(data));
      // });
    } catch (error) {
      this.log(GlobalBaseService.LogLevels.error, error);
    }
  };

  validateToken = async (token: string) => {
    var result: GuardianUserSessions = new GuardianUserSessions();
    try {
      let authservice = new AuthService();
      let session = await authservice.isAccesstokenValid(token);
      result = session;
    } catch (error) {
      this.log(GlobalBaseService.LogLevels.error, {
        error,
        tag: this.validateToken,
      });
    }
    return result;
  };
  invalidateSockets = () => {
    try {
      if (this.usersockets.length > 0) {
        this.usersockets.forEach((v1) => {
          if (v1.socket.readyState == WebSocket.CLOSED) {
            v1.socket.close();
          }
        });
      }
      setTimeout(this.invalidateSockets, 5000);
    } catch (error) {
      this.log(GlobalBaseService.LogLevels.error, error);
    }
  };
}
export const usersocketservice = new UserSocketService();
