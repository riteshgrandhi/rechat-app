import mongoose, { Schema, Document, HookSyncCallback } from "mongoose";
import { IUser } from "remarc-app-common";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";

const usersSchema = new Schema({
  userName: {
    type: String,
    required: [true, "UserName is required"],
    validate: {
      validator: (v: string) => {
        if (v.length < 6) {
          return false;
        }
        if (!/^[a-z0-9]+$/i.test(v)) {
          return false;
        }
        return true;
      },
      msg: "UserName is not valid"
    },
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
    // validate: {
    //   validator: (v: string) => {
    //     if (v.length < 8) {
    //       return false;
    //     }
    //     if (!/^[a-z0-9]+$/i.test(v)) {
    //       return false;
    //     }
    //     return true;
    //   },
    //   msg: "Password is not valid"
    // }
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: (v: string) => {
        if (
          !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
            v
          )
        ) {
          return false;
        }
        return true;
      },
      msg: "Email is not valid"
    }
  },
  firstName: { type: String, required: [true, "FirstName is required"] },
  lastName: { type: String }
});

function getHashPassword(password: string): Promise<string> {
  return argon2.hash(password, { salt: randomBytes(32) });
}

usersSchema.statics.comparePassword = function(
  password: string,
  hashPassword: string
): Promise<boolean> {
  return argon2.verify(hashPassword, password);
};

export interface IUserDocument extends IUser, Document {
  password: string;
  salt: string;
}

usersSchema.pre<IUserDocument>("save", async function(next) {
  this.password = await getHashPassword(this.password);
  next();
});

export default mongoose.model<IUserDocument>("Users", usersSchema);
