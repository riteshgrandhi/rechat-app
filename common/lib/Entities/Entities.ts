export interface IOpSequence {
  id: string;
  opList: ITextOp[];
}

export interface ITextOp {
  type: OpType;
  text: string;
  position: number;
}

export enum OpType {
  ADD,
  DELETE
}

export enum Events {
  SERVER_TEXT_UPDATE = "server_text_update",
  CLIENT_TEXT_UPDATE = "client_text_update"
}
