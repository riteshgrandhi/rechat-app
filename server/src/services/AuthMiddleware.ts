import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import UserModel from "../models/UserModel";
import { IUser } from "remarc-app-common";
import { Config } from "../config/serverConfig";

export function configureAuthMiddleware(passport: PassportStatic) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, cb) => {
        try {
          let user = await UserModel.findOne(
            { email: email },
            { _id: false, __v: false }
          );

          if (!user) {
            return cb("Incorrect Email or Password");
          }

          let _cmpResult: boolean = await UserModel.schema.statics.comparePassword(
            password,
            user.password
          );

          if (!_cmpResult) {
            return cb("Incorrect Email or Password.", false);
          }

          let _user: IUser = {
            // userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          };

          return cb(null, _user, {
            message: "Logged In Successfully"
          });
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: Config.jwtSecret
      },
      async (jwtPayload: IUser, cb) => {
        try {
          // let user = await UserModel.findOne({ userName: jwtPayload.userName })
          return cb(null, jwtPayload);
        } catch (err) {
          return cb(err);
        }
      }
    )
  );
}
