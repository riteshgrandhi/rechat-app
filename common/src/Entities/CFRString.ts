import {
  ICFRCharacter,
  ICharOpSequence,
  OpType,
  ICharId,
  IComparisonResult,
  IEquality
} from "./Entities";
import { Logger, LogLevel } from "../Logger/Logger";

export class CFRString {
  private _cfrString: ICFRCharacter[];
  private logger: Logger;

  constructor(logger: Logger, cfrCharList?: ICFRCharacter[]) {
    this.logger = logger;
    this._cfrString = cfrCharList || [];
    let t: number = 0;
  }

  private static compareUid(id1: ICharId[], id2: ICharId[]): IComparisonResult {
    let i: number = 0;
    let flag: IEquality = IEquality.EQUAL;
    let tieBreak: IEquality = IEquality.EQUAL;

    while (id1[i] && id2[i]) {
      if (id1[i].relativePos < id2[i].relativePos) {
        flag = IEquality.LESSER;
        break;
      } else if (id1[i].relativePos > id2[i].relativePos) {
        flag = IEquality.GREATER;
        break;
      } else {
        if (id1[i].userId != id2[i].userId && tieBreak == 0) {
          tieBreak =
            id1[i].userId < id2[i].userId
              ? IEquality.LESSER
              : IEquality.GREATER;
        }
        flag = IEquality.EQUAL;
      }
      i++;
    }

    if (flag == IEquality.EQUAL) {
      if (id1[i] != null && id2[i] == null) {
        flag = IEquality.GREATER;
      } else if (id1[i] == null && id2[i] != null) {
        flag = IEquality.LESSER;
      }
    }

    if (flag == 0 && tieBreak != 0) {
      flag = tieBreak;
    }

    return { equality: flag };
  }

  public get() {
    return this._cfrString;
  }

  public applyOpSequence(
    opSequence: ICharOpSequence,
    currentSelection?: { start: number; end: number }
  ) {
    opSequence.forEach(op => {
      switch (op.type) {
        case OpType.ADD: {
          this.remoteInsert(op.cfrCharacter, currentSelection);
          break;
        }
        case OpType.DELETE: {
          this.remoteRemove(op.cfrCharacter, currentSelection);
          break;
        }
      }
    });
  }

  private remoteInsert(
    char: ICFRCharacter,
    currentSelection?: { start: number; end: number }
  ) {
    // find the index to insert
    let index: number = this.findIndexToInsert(char);
    if (index < 0) {
      this.logger.log(CFRString.name, "Error", LogLevel.ERROR);
      return;
    }
    this.logger.log(
      CFRString.name,
      `found insertion index`,
      LogLevel.VERBOSE,
      index
    );

    if (currentSelection) {
      if (index <= currentSelection.start) {
        currentSelection.start += 1;
      }
      if (index <= currentSelection.end) {
        currentSelection.end += 1;
      }
    }

    this._cfrString.splice(index, 0, char);
  }

  private remoteRemove(
    char: ICFRCharacter,
    currentSelection?: { start: number; end: number }
  ) {
    // find the index to remove
    let index: number = this.findIndexToRemove(char);
    if (index < 0) {
      this.logger.log(CFRString.name, "Error", LogLevel.ERROR);
      return;
    }
    if (currentSelection) {
      if (index <= currentSelection.start) {
        currentSelection.start -= 1;
      }
      if (index <= currentSelection.end) {
        currentSelection.end -= 1;
      }
    }
    this._cfrString.splice(index, 1);
  }

  public insertString(props: {
    text: string;
    userId: string;
    globalPos: number;
  }): ICharOpSequence {
    let _opSequence: ICharOpSequence = [];

    for (let i = 0; i < props.text.length; i++) {
      let _cfrChar: ICFRCharacter = this.localInsert({
        char: props.text[i],
        userId: props.userId,
        globalPos: props.globalPos + i
      });
      _opSequence.push({ type: OpType.ADD, cfrCharacter: _cfrChar });
    }

    return _opSequence;
  }

  private localInsert(props: {
    char: string;
    userId: string;
    globalPos: number;
  }): ICFRCharacter {
    //generate Unique Id
    const uIdBefore =
      (this._cfrString[props.globalPos - 1] &&
        this._cfrString[props.globalPos - 1].uniqueId) ||
      [];
    const uIdAfter =
      (this._cfrString[props.globalPos] &&
        this._cfrString[props.globalPos].uniqueId) ||
      [];
    const uIdNew = this.generateUId(uIdBefore, uIdAfter, props.userId);

    //insert into string
    let _cfrChar: ICFRCharacter = {
      char: props.char,
      uniqueId: uIdNew
    };
    this._cfrString.splice(props.globalPos, 0, _cfrChar);
    this.logger.log(
      CFRString.name,
      `inserted ${props.char} at ${props.globalPos} with id`,
      LogLevel.VERBOSE,
      uIdNew
    );

    return _cfrChar;
  }

  private generateUId(
    posBefore: ICharId[],
    posAfter: ICharId[],
    userId: string,
    newPos: ICharId[] = []
  ): ICharId[] {
    let before: ICharId = posBefore[0] || {
      relativePos: -Infinity,
      userId: userId
    };

    let after: ICharId = posAfter[0] || {
      relativePos: Infinity,
      userId: userId
    };

    if (after.relativePos - before.relativePos > 1) {
      let newRelativePos: number =
        before.relativePos == -Infinity
          ? after.relativePos - 1
          : before.relativePos + 1;

      if (Math.abs(newRelativePos) == Infinity) {
        newRelativePos = 0;
      }
      newPos.push({ relativePos: newRelativePos, userId: userId });
      return newPos;
    } else if (after.relativePos - before.relativePos == 1) {
      newPos.push(before);
      return this.generateUId(posBefore.slice(1), [], userId, newPos);
    } else if (after.relativePos == before.relativePos) {
      if (before.userId != after.userId) {
        newPos.push(before);
        return this.generateUId(posBefore.slice(1), [], userId, newPos);
      } else {
        newPos.push(before);
        return this.generateUId(
          posBefore.slice(1),
          posAfter.slice(1),
          userId,
          newPos
        );
      }
    } else {
      throw "Order Mismatch";
    }
  }

  private findIndexToRemove(char: ICFRCharacter): number {
    var index: number = this.findIndexToRemoveBinary(
      char,
      0,
      this._cfrString.length == 0 ? 0 : this._cfrString.length - 1
    );

    this.logger.log(
      CFRString.name,
      "found removal index",
      LogLevel.VERBOSE,
      index
    );
    return index;
  }

  private findIndexToInsert(char: ICFRCharacter): number {
    if (this._cfrString.length == 0) {
      return 0;
    }

    let res: IComparisonResult;
    let len: number = this._cfrString.length - 1;

    res = CFRString.compareUid(char.uniqueId, this._cfrString[0].uniqueId);
    if (res.equality == IEquality.LESSER) {
      return 0;
    }

    res = CFRString.compareUid(char.uniqueId, this._cfrString[len].uniqueId);
    if (res.equality == IEquality.GREATER) {
      return len + 1;
    }

    return this.findIndextoInsertBinary(char, 0, len);
  }

  private findIndexToRemoveBinary(
    cfrChar: ICFRCharacter,
    start: number,
    end: number
  ): number {
    let mid: number = Math.floor((start + end) / 2);
    let res: IComparisonResult = CFRString.compareUid(
      cfrChar.uniqueId,
      this._cfrString[mid].uniqueId
    );
    if (start >= end && res.equality != IEquality.EQUAL) {
      return -1;
    }
    // found match
    if (res.equality == IEquality.LESSER) {
      return this.findIndexToRemoveBinary(cfrChar, start, mid - 1);
    } else if (res.equality == IEquality.GREATER) {
      return this.findIndexToRemoveBinary(cfrChar, mid + 1, end);
    } else {
      if (cfrChar.char != this._cfrString[mid].char) {
        throw "Character Mismatch";
      }
      return mid;
    }
  }

  private findIndextoInsertBinary(
    cfrChar: ICFRCharacter,
    start: number,
    end: number
  ): number {
    let mid: number = Math.floor((start + end) / 2);
    let res: IComparisonResult = CFRString.compareUid(
      cfrChar.uniqueId,
      this._cfrString[mid].uniqueId
    );

    if (start + 1 == end) {
      let res_next: IComparisonResult = CFRString.compareUid(
        cfrChar.uniqueId,
        this._cfrString[mid + 1].uniqueId
      );
      if (
        res.equality == IEquality.GREATER &&
        res_next.equality == IEquality.LESSER
      ) {
        return mid + 1;
      } else {
        throw "Not Found";
      }
    } else {
      if (res.equality == IEquality.LESSER) {
        return this.findIndextoInsertBinary(cfrChar, start, mid);
      } else if (res.equality == IEquality.GREATER) {
        return this.findIndextoInsertBinary(cfrChar, mid, end);
      } else {
        throw "Same uId Found";
      }
    }
  }

  public deleteString(props: {
    text: string;
    userId: string;
    globalPos: number;
  }): ICharOpSequence {
    return this.localRemove(props);
  }

  private localRemove(props: {
    text: string;
    userId: string;
    globalPos: number;
  }): ICharOpSequence {
    let _opSequence: ICharOpSequence = [];

    for (let i = 0; i < props.text.length; i++) {
      _opSequence.push({
        type: OpType.DELETE,
        cfrCharacter: this._cfrString[props.globalPos + i]
      });
    }

    this._cfrString.splice(props.globalPos, props.text.length);
    return _opSequence;
  }

  public getText() {
    // return this._cfrString.map((c: ICFRCharacter) => c.char).join();
    let res: string = "";

    for (let i = 0; i < this._cfrString.length; i++) {
      res += this._cfrString[i].char;
    }

    return res;
  }

  public print() {
    this.logger.log(
      CFRString.name,
      this.getText(),
      LogLevel.VERBOSE,
      this._cfrString.map(c => {
        return c.char + "|" + c.uniqueId.map(u => u.relativePos).join();
      })
    );
  }
}
