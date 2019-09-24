import { IMarc, CFRString, IChangeEventData, Logger } from "remarc-app-common";
import MarcModel, { IMarcDocument } from "./../models/MarcModel";
import { MongoError } from "mongodb";
import ShortId from "shortid";

export default class MarcsService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public async getMarcs(): Promise<IMarc[]> {
    return MarcModel.find({}, { _id: false, document: false })
      .then(marcs => {
        return marcs;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async getMarcById(marcId: string): Promise<IMarc | null> {
    return MarcModel.findOne({ marcId: marcId }, { _id: false })
      .then(marc => {
        return marc;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async updateMarc(data: IChangeEventData) {
    let marc: IMarc | null;
    try {
      marc = await this.getMarcById(data.marcId);
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

  public async editMarc(marcId: string, title: string) {
    return MarcModel.updateOne({ marcId: marcId }, { title: title })
      .then(m => {
        return m;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public createMarc(title: string): Promise<IMarc | null> {
    let marcDocument = new MarcModel({
      title: title,
      marcId: ShortId.generate(),
      document: []
    } as IMarc);

    return marcDocument
      .save()
      .then((m: IMarcDocument) => {
        return m;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }
}
