import { ICFRCharacter, ICharOpSequence, OpType, ICharId } from "./Entities";

export class CFRString {
  private _cfrString: ICFRCharacter[];

  // constructor(props?: { text: string; userId: string }) {
  constructor(props?: { text: string; userId: string }) {
    this._cfrString = [
      // {
      //   char: "##start##",
      //   uniqueId: [{ relativePos: 0, userId: "$$default$$" }]
      // },
      // { char: "##end##", uniqueId: [{ relativePos: 1, userId: "$$default$$" }] }
    ];
    // if (props) {
    //   this.convertFromString(props);
    // }
  }

  // public convertFromString(props: { text: string; userId: string }) {
  //   let res: ICFRCharacter[] = [];
  //   for (let i = 0; i < props.text.length; i++) {
  //     res.push({
  //       char: props.text[i],
  //       uniqueId: [{ relativePos: i, userId: props.userId }]
  //     });
  //   }
  //   this._cfrString = res;
  // }

  public get() {
    return this._cfrString;
  }

  public applyOpSequence(opSequence: ICharOpSequence) {
    opSequence.forEach(op => {
      switch (op.type) {
        case OpType.ADD: {
          this.insertCfrCharacter(op.cfrCharacter);
        }
        case OpType.DELETE: {
          this.deleteCfrCharacter(op.cfrCharacter);
        }
      }
    });
  }

  private insertCfrCharacter(char: ICFRCharacter) {
    let index: number = -1;
    let level: number = 0;
    // find the index to insert
    for (let i = 0; i < this._cfrString.length; i++) {
      if (
        this._cfrString[i].uniqueId[level].relativePos ==
        char.uniqueId[level].relativePos
      ) {
        index = i;
        level++;
        if (
          level >= char.uniqueId.length - 1 ||
          level >= this._cfrString[i].uniqueId.length - 1
        ) {
          break;
        }
      }
    }
    if (index == -1) {
      index = this._cfrString.length;
    }
    this._cfrString.splice(index, 0, char);
  }

  private deleteCfrCharacter(char: ICFRCharacter) {
    // let index: number = -1;
    // find the index to remove
    // do {} while (true);
    // this._cfrString.splice(index, 0);
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
      // let newUId: ICharId[] = [];
      // if (this._cfrString[props.globalPos + i - 1]) {
      //   newUId = this._cfrString[props.globalPos + i - 1].uniqueId.slice();
      //   if (
      //     //if same user made previous edit
      //     newUId[newUId.length - 1].userId == props.userId &&
      //     //if next element doesn't exist or if next element is of different root
      //     (!this._cfrString[props.globalPos + i] ||
      //       this._cfrString[props.globalPos + i].uniqueId[0].relativePos >
      //         newUId[0].relativePos)
      //   ) {
      //     let _id = Object.assign({}, newUId[newUId.length - 1]);
      //     _id.relativePos++;
      //     newUId[newUId.length - 1] = _id;
      //   } else {
      //     newUId.push({ relativePos: i, userId: props.userId });
      //   }
      // } else {
      //   newUId.push({ relativePos: i, userId: props.userId });
      // }
      // let _cfrChar: ICFRCharacter = {
      //   char: props.text[i],
      //   uniqueId: newUId
      // };
      // this._cfrString.splice(props.globalPos + i, 0, _cfrChar);
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
    console.log(`inserted ${props.char} at ${props.globalPos} with id:`);
    console.log(uIdNew);
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

  public localRemove(props: {
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
    console.log(this.getText());

    console.log(
      this._cfrString.map(c => {
        return c.char + "|" + c.uniqueId.map(u => u.relativePos).join();
      })
    );
  }
}
