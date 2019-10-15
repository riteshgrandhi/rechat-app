import { Router, Request } from "express";
import {
  Logger,
  LogLevel,
  IUser,
  ISignUpResponse,
  ILoginResponse
} from "remarc-app-common";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserModel, { IUserDocument } from "./../models/UserModel";
import { TypedResponse } from "../helpers/Helpers";
import { Config } from "../config/serverConfig";

export default class AuthController {
  public path = "/auth";
  public router: Router = Router();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(`${this.path}/login`, (req, resp) => {
      this.login(req, resp);
    });
    this.router.post(`${this.path}/signup`, (req, resp) => {
      this.signup(req, resp);
    });
  }

  private login(req: Request, resp: TypedResponse<ILoginResponse>) {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        return resp.status(400).json({ message: "Bad Request", error: err });
      }

      if (!user) {
        return resp.status(400).json({ message: "Login Failed", error: err });
      }

      if (info) {
        this.logger.log(AuthController.name, "Info", LogLevel.VERBOSE, info);
      }

      let _user: IUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };

      req.login(_user, { session: false }, err => {
        if (err) {
          return resp.send(err);
        }
      });

      const token = jwt.sign(_user, Config.jwtSecret, { expiresIn: "1h" });

      return resp.json({
        user: _user,
        token: token,
        message: "Login Successful"
      });
    })(req, resp);
  }

  private async signup(req: Request, resp: TypedResponse<ISignUpResponse>) {
    try {
      let password: string = req.body.password;
      let firstName: string = req.body.firstName;
      let lastName: string = req.body.lastName;
      let email: string = req.body.email;

      let user = await UserModel.findOne({ email: email });
      if (user) {
        //already exists
        return resp.status(400).send({
          error: `User with email '${req.body.email}' already exists`
        });
      }
      // let _hash = UserModel.schema.statics.getHashPassword(password);
      let _newUser: IUserDocument = new UserModel({
        password: password,
        firstName: firstName,
        lastName: lastName,
        email: email
      });

      try {
        let u = await _newUser.save();
        let _u: IUser = {
          // userName: u.userName,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email
        };
        this.logger.log(
          AuthController.name,
          "Sign Up Successful",
          LogLevel.VERBOSE,
          _u
        );
        return resp.send({ user: _u, message: "Success" });
      } catch (err) {
        this.logger.log(AuthController.name, "DB Error", LogLevel.VERBOSE, err);
        throw err;
      }
    } catch (err) {
      return resp
        .status(500)
        .json({ error: err.message || err, message: "Failed" });
    }
  }
}
