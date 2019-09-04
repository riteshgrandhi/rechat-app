import { ICFRCharacter, ICharOpSequence, OpType, ICharId } from "./Entities";

export class CFRString {
  private _cfrString: ICFRCharacter[];

  constructor(props?: { text: string; userId: string }) {
    this._cfrString = [];
    if (props) {
      this.convertFromString(props);
    }
  }

  public convertFromString(props: { text: string; userId: string }) {
    var res: ICFRCharacter[] = [];
    for (var i = 0; i < props.text.length; i++) {
      res.push({
        char: props.text[i],
        uniqueId: [{ relativePos: i, userId: props.userId }]
      });
    }
    this._cfrString = res;
  }

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
    var index: number = -1;
    var level: number = 0;
    // find the index to insert
    for (var i = 0; i < this._cfrString.length; i++) {
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
    // var index: number = -1;
    // find the index to remove
    // do {} while (true);
    // this._cfrString.splice(index, 0);
  }

  public insertString(props: {
    text: string;
    userId: string;
    globalPos: number;
  }): ICharOpSequence {
    var _opSequence: ICharOpSequence = [];
    for (var i = 0; i < props.text.length; i++) {
      var newUId: ICharId[] = [];
      if (this._cfrString[props.globalPos + i - 1]) {
        newUId = this._cfrString[props.globalPos + i - 1].uniqueId.slice();
        if (
          //if same user made previous edit
          newUId[newUId.length - 1].userId == props.userId &&
          //if next element doesn't exist or if next element is of different root
          (!this._cfrString[props.globalPos + i] ||
            this._cfrString[props.globalPos + i].uniqueId[0].relativePos >
              newUId[0].relativePos)
        ) {
          var _id = Object.assign({}, newUId[newUId.length - 1]);
          _id.relativePos++;
          newUId[newUId.length - 1] = _id;
        } else {
          newUId.push({ relativePos: i, userId: props.userId });
        }
      } else {
        newUId.push({ relativePos: i, userId: props.userId });
      }
      var _cfrChar: ICFRCharacter = {
        char: props.text[i],
        uniqueId: newUId
      };
      this._cfrString.splice(props.globalPos + i, 0, _cfrChar);
      _opSequence.push({ type: OpType.ADD, cfrCharacter: _cfrChar });
    }
    return _opSequence;
  }

  public deleteString(props: {
    text: string;
    userId: string;
    globalPos: number;
  }): ICharOpSequence {
    var _opSequence: ICharOpSequence = [];
    for (var i = 0; i < props.text.length; i++) {
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
    var res: string = "";
    for (var i = 0; i < this._cfrString.length; i++) {
      res += this._cfrString[i].char;
    }
    return res;
  }

  public print() {
    console.log(this.getText());

    console.log(
      this._cfrString.map(c => {
        return c.char + "-" + c.uniqueId.map(u => u.relativePos).join();
      })
    );
  }
}
