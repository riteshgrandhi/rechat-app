export enum OpType {
  ADD = 0,
  DELETE = 1
}
export enum Events {
  SERVER_TEXT_UPDATE = "server_text_update",
  CLIENT_TEXT_UPDATE = "client_text_update"
}
export interface ICharOpSequence
  extends Array<{ type: OpType; cfrCharacter: ICFRCharacter }> {}

export interface ICFRCharacter {
  char: string;
  uniqueId: ICharId[];
}
export interface ICharId {
  relativePos: number;
  userId: string;
}
