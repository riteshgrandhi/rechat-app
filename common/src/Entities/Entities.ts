export enum OpType {
  ADD = 0,
  DELETE = 1
}
export enum Events {
  SERVER_TEXT_UPDATE = "server_text_update",
  CLIENT_TEXT_UPDATE = "client_text_update",
  CARET_POSITION_CHANGE = "caret_position_change",
  CLIENT_JOIN_MARC = "client_join_marc",
  CLIENT_SEARCH_USERS = "client_search_users",
  SERVER_SEARCH_RESULTS = "server_search_results"
}
export enum IEquality {
  LESSER = -1,
  EQUAL = 0,
  GREATER = 1
}
export enum Role {
  // READ = -1,
  EDITOR = 1,
  OWNER = 2,
  ADMIN = 3
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
  user: IUser;
  caret: { height: number; left: number; top: number };
}
export interface IChangeEventData {
  marcId: string;
  opSequence: ICharOpSequence;
}
export interface IClientJoinData {
  marcId: string;
}
export interface ISearchUsersData {
  query: string;
}
export interface ISearchUsersResults {
  results: IUser[];
}

export interface IAccessUser {
  email: string;
  role: Role;
}

export interface IMarc {
  title: string;
  marcId: string;
  document: ICFRCharacter[];
  usersList: IAccessUser[];
}

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  isNewUser?: boolean;
}

export interface IUpdateUserData extends IAccessUser {
  removeUser?: boolean;
}

export interface IUpdateUserResponse
  extends Array<{ email: string; message: string }> {}
