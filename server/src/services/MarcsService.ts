import {
  IMarc,
  CFRString,
  IChangeEventData,
  Logger,
  IUser,
  Role
} from "remarc-app-common";
import MarcModel, { IMarcDocument } from "./../models/MarcModel";
import { MongoError } from "mongodb";
import ShortId from "shortid";

export default class MarcsService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public async getMarcs(user: IUser): Promise<IMarc[]> {
    return MarcModel.find(
      {
        // "usersList.userName": user.userName,
        "usersList.email": user.email,
        "usersList.role": { $gte: Role.EDITOR }
      },
      { _id: false, document: false, "usersList._id": false, __v: false }
    )
      .then(marcs => {
        return marcs;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async getMarcById(
    marcId: string,
    user?: IUser
  ): Promise<IMarc | null> {
    let _query: any = { marcId: marcId };
    if (user) {
      _query = {
        ..._query,
        // "usersList.userName": user.userName,
        "usersList.email": user.email,
        "usersList.role": { $gte: Role.EDITOR }
      };
    }
    return MarcModel.findOne(_query, {
      _id: false,
      "usersList._id": false,
      __v: false
    })
      .then(marc => {
        return marc;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async updateMarc(data: IChangeEventData, user?: IUser) {
    let marc: IMarc | null;
    try {
      marc = await this.getMarcById(data.marcId, user);
    } catch (err) {
      throw err;
    }
    if (!marc) {
      throw "Marc with given Id not found!";
    }
    let cfrString: CFRString = new CFRString(this.logger, marc.document);
    cfrString.applyOpSequence(data.opSequence);

    return MarcModel.updateOne(
      { marcId: data.marcId },
      { document: cfrString.get() }
    )
      .then(m => {
        return m;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async editMarc(
    marcId: string,
    title: string,
    user: IUser
  ): Promise<IMarc | null> {
    return await MarcModel.updateOne(
      {
        marcId: marcId,
        // "usersList.userName": user.userName,
        "usersList.email": user.email,
        "usersList.role": { $gte: Role.OWNER }
      },
      { title: title }
    ).then(m => {
      if (m.nModified == 0) {
        throw "No matched Marc found";
      }
      return m;
    });
  }

  public async createMarc(title: string, user: IUser): Promise<IMarc | null> {
    let marcDocument = new MarcModel({
      title: title,
      marcId: ShortId.generate(),
      document: [],
      usersList: [{ email: user.email, role: Role.OWNER }]
    } as IMarc);

    return await marcDocument.save().then((m: IMarcDocument) => {
      return m;
    });
  }
}
