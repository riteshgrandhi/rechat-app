export enum OpType {
  ADD = 0,
  DELETE = 1
}
export enum Events {
  SERVER_TEXT_UPDATE = "server_text_update",
  CLIENT_TEXT_UPDATE = "client_text_update",
  CARET_POSITION_CHANGE = "caret_position_change"
}
export enum IEquality {
  LESSER = -1,
  EQUAL = 0,
  GREATER = 1
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
export interface IComparisonResult {
  equality: IEquality;
  // uidTieBreak: number;
}
export interface ICaretEventData {
  userId: string;
  caret: { height: number; left: number; top: number };
}
