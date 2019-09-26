import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import UserModel from "../models/UserModel";
import { IUser } from "remarc-app-common";
import { Config } from "../config/serverConfig";

export function configurePassport(passport: PassportStatic) {
  passport.use(
    new LocalStrategy(
      { usernameField: "userName", passwordField: "password" },
      async (userName, password, cb) => {
        try {
          let user = await UserModel.findOne(
            { userName: userName },
            { _id: false, __v: false }
          );

          if (!user) {
            return cb({
              errmsg: "Incorrect Email or Password"
            });
          }

          let _cmpResult: boolean = await UserModel.schema.statics.comparePassword(
            password,
            user.password
          );

          if (!_cmpResult) {
            return cb(
              {
                errmsg: "Incorrect Email or Password."
              },
              false
            );
          }

          let _user: IUser = {
            userName: user.userName,
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
          return cb(
            null,
            await UserModel.findOne({ userName: jwtPayload.userName })
          );
        } catch (err) {
          return cb(err);
        }
      }
    )
  );
}
