import nodemailer from "nodemailer";
import { Environment, global_logger, logger } from ".";

class Mailer {
  TAG: string = "Mailer";
  private static _instance: Mailer | null = null;
  private transporter: nodemailer.Transporter | null = null;
  private smtp_server: string;
  private port: number;
  private secure: boolean;
  private user_name: string;
  private password: string;
  constructor(
    _smtp_server: string,
    _port: number,
    _secure: boolean,
    _user_name: string,
    _password: string
  ) {
    this.smtp_server = _smtp_server;
    this.port = _port;
    this.secure = _secure;
    this.user_name = _user_name;
    this.password = _password;
  }
  public static getInstance() {
    if (this._instance == null) {
      let {
        smtp_server,
        smtp_port,
        smtp_secure,
        smtp_username,
        smtp_password,
      } = Environment.getInstance();
      this._instance = new Mailer(
        smtp_server,
        smtp_port,
        smtp_secure,
        smtp_username,
        smtp_password
      );
    }
    return this._instance;
  }
  async init() {
    let METHOD_TAG: string = "init";
    try {
      this.transporter = nodemailer.createTransport({
        // pool:true,
        host: this.smtp_server,
        port: this.port,
        secure: this.secure, // true for 465, false for other ports
        auth: {
          user: this.user_name, // generated ethereal user
          pass: this.password, // generated ethereal password
          // ssl:true
        },
      });
    } catch (error) {
      var e = error;
      global_logger.error(this.TAG, METHOD_TAG, error);
      throw error;
    }
  }
  async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    let METHOD_TAG = "sendMail";
    let result: boolean = false;
    try {
      if (this.transporter == null) {
        throw new Error("Mailer not initialized");
      }
      await this.transporter.sendMail({
        from: this.user_name,
        to,
        subject,
        text,
      });
      result = true;
    } catch (error) {
      let e = error;
      global_logger.error(this.TAG, METHOD_TAG, e);
    }
    return result;
  }
}
export { Mailer };
