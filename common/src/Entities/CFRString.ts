import {
  ICFRCharacter,
  ICharOpSequence,
  OpType,
  ICharId
} from "./Entities";

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

  public insertString(props: {
    text: string;
    userId: string;
    globalPos: number;
  }): ICharOpSequence {
    var _opSequence: ICharOpSequence = { sequence: [] };
    for (var i = 0; i < props.text.length; i++) {
      var newUId: ICharId[] = [];
      if (this._cfrString[props.globalPos + i - 1]) {
        newUId = this._cfrString[props.globalPos + i - 1].uniqueId.slice();
        if (
          //if same user made previous edit
          newUId[newUId.length - 1].userId == props.userId &&
          //if next element doesn't exist or if next element is of different root
          (!this._cfrString[props.globalPos + i] ||
            this._cfrString[props.globalPos + i].uniqueId.length <
              newUId.length)
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
      this._cfrString.splice(props.globalPos, 0, _cfrChar);
      _opSequence.sequence.push({ type: OpType.ADD, cfrCharacter: _cfrChar });
    }
    return _opSequence;
  }

  public deleteString(props: {
    text: string;
    userId: string;
    globalPos: number;
  }) {
    this._cfrString.splice(props.globalPos);
  }

  public print() {
    console.log(this._cfrString.map(c => c.char).join(""));

    console.log(
      this._cfrString.map(c => {
        return c.char + "-" + c.uniqueId.map(u => u.relativePos).join();
      })
    );
  }
}
