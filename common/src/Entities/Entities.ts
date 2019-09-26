export enum OpType {
  ADD = 0,
  DELETE = 1
}
export enum Events {
  SERVER_TEXT_UPDATE = "server_text_update",
  CLIENT_TEXT_UPDATE = "client_text_update",
  CARET_POSITION_CHANGE = "caret_position_change",
  CLIENT_JOIN_MARC = "client_join_marc"
}
export enum IEquality {
  LESSER = -1,
  EQUAL = 0,
  GREATER = 1
}
export enum Role {
  // READ = -1,
  EDITOR = 0,
  OWNER = 1,
  ADMIN = 2
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
  marcId: string;
  userId: string;
  caret: { height: number; left: number; top: number };
}
export interface IChangeEventData {
  marcId: string;
  opSequence: ICharOpSequence;
}
export interface IClientJoinData {
  marcId: string;
}

export interface IMarc {
  title: string;
  marcId: string;
  document: ICFRCharacter[];
  usersList: {
    userName: string;
    role: Role;
  }[];
}

export interface IUser {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}
