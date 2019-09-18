import { IMarc, CFRString, IChangeEventData } from "remarc-app-common";

export default class MarcsService {
  private marcs: IMarc[] = [
    {
      id: "mydoc",
      title: "My Document",
      document: []
    },
    {
      id: "readme",
      title: "Read Me Document",
      document: []
    }
  ];

  private documents: { [marcId: string]: CFRString };

  constructor() {
    this.documents = {};
    this.marcs.forEach(m => {
      this.documents[m.id] = new CFRString(m.document);
    });
  }

  public getMarcs() {
    return this.marcs;
  }

  public getMarcById(marcId: string): IMarc | null {
    let index: number = this.marcs.findIndex(m => {
      return marcId ? m.id == marcId : false;
    });
    if (index < 0) {
      return null;
    } else {
      return this.marcs[index];
    }
  }

  public updateMarc(data: IChangeEventData) {
    this.documents[data.marcId].applyOpSequence(data.opSequence);
    let _marc = this.getMarcById(data.marcId);
    if (_marc) {
      _marc.document = this.documents[data.marcId].get();
    }
  }
}
