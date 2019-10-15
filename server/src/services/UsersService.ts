import { Logger, IUser, Role } from "remarc-app-common";
import UserModel from "./../models/UserModel";
import { MongoError } from "mongodb";

export default class UsersService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public findUsers(query: string): Promise<IUser[]> {
    return UserModel.find({
      $or: [{ email: query }, { firstName: query }, { lastName: query }]
    })
      .then(users => users)
      .catch((err: MongoError) => {
        throw err.message;
      });
  }
}
