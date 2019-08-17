export declare enum OpType {
    ADD = 0,
    DELETE = 1
}
export declare enum Events {
    SERVER_TEXT_UPDATE = "server_text_update",
    CLIENT_TEXT_UPDATE = "client_text_update"
}
export interface ICharOp {
    type: OpType;
    character: ICFRCharacter;
}
export interface ICFRCharacter {
    char: string;
    uniqueId: ICharId[];
}
interface ICharId {
    relativePos: number;
    userId: string;
}
export declare class CFRString {
    private _cfrString;
    constructor(props?: {
        text: string;
        userId: string;
    });
    convertFromString(props: {
        text: string;
        userId: string;
    }): void;
    get(): ICFRCharacter[];
    insertString(props: {
        text: string;
        userId: string;
        globalPos: number;
    }): void;
    print(): void;
}
export {};
