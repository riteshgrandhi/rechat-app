"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CFRString {
    constructor(props) {
        this._cfrString = [];
        if (props) {
            this.convertFromString(props);
        }
    }
    convertFromString(props) {
        var res = [];
        for (var i = 0; i < props.text.length; i++) {
            res.push({
                char: props.text[i],
                uniqueId: [{ relativePos: i, userId: props.userId }]
            });
        }
        this._cfrString = res;
    }
    get() {
        return this._cfrString;
    }
    insertString(props) {
        for (var i = 0; i < props.text.length; i++) {
            var newUId = [];
            if (this._cfrString[props.globalPos + i - 1]) {
                newUId = this._cfrString[props.globalPos + i - 1].uniqueId.slice();
                if (
                //if same user made previous edit
                newUId[newUId.length - 1].userId == props.userId &&
                    //if next element doesn't exist or if next element is of different root
                    (!this._cfrString[props.globalPos + i] ||
                        this._cfrString[props.globalPos + i].uniqueId.length <
                            newUId.length)) {
                    var _id = Object.assign({}, newUId[newUId.length - 1]);
                    _id.relativePos++;
                    newUId[newUId.length - 1] = _id;
                }
                else {
                    newUId.push({ relativePos: i, userId: props.userId });
                }
            }
            else {
                newUId.push({ relativePos: i, userId: props.userId });
            }
            var _cfrChar = {
                char: props.text[i],
                uniqueId: newUId
            };
            this._cfrString.splice(props.globalPos, 0, _cfrChar);
        }
    }
    print() {
        console.log(this._cfrString.map(c => c.char).join(""));
        console.log(this._cfrString.map(c => {
            return c.char + "-" + c.uniqueId.map(u => u.relativePos).join();
        }));
    }
}
exports.CFRString = CFRString;
//# sourceMappingURL=Entities.js.map