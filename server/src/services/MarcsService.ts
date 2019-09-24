import { IMarc, CFRString, IChangeEventData, Logger } from "remarc-app-common";
import MarcModel, { IMarcDocument } from "./../models/MarcModel";
import { MongoError } from "mongodb";
import ShortId from "shortid";

export default class MarcsService {
  private logger: Logger;
  // private marcs: IMarc[] = [
  //   {
  //     marcId: "mydoc",
  //     title: "My Document",
  //     document: []
  //   },
  //   {
  //     marcId: "readme",
  //     title: "Read Me Document",
  //     document: []
  //   }
  // ];

  // private documents: { [marcId: string]: CFRString };

  constructor(logger: Logger) {
    this.logger = logger;
    // this.documents = {};
    // this.marcs.forEach(m => {
    //   this.documents[m.marcId] = new CFRString(this.logger, m.document);
    // });
  }

  public async getMarcs(): Promise<IMarc[]> {
    // return this.marcs;
    return MarcModel.find({}, { _id: false })
      .then(marcs => {
        return marcs;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async getMarcById(marcId: string): Promise<IMarc | null> {
    // let index: number = this.marcs.findIndex(m => {
    //   return marcId ? m.marcId == marcId : false;
    // });
    // if (index < 0) {
    //   return null;
    // } else {
    //   return this.marcs[index];
    // }
    return MarcModel.findOne({ marcId: marcId }, { _id: false })
      .then(marc => {
        return marc;
      })
      .catch((err: MongoError) => {
        throw err.errmsg;
      });
  }

  public async updateMarc(data: IChangeEventData) {
    // this.documents[data.marcId].applyOpSequence(data.opSequence);
    // let _marc = await this.getMarcById(data.marcId);
    // if (_marc) {
    //   _marc.document = this.documents[data.marcId].get();
    // }
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
