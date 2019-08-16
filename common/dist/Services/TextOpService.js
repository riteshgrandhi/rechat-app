"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Entities_1 = require("../Entities/Entities");
var TextOpService = /** @class */ (function () {
    function TextOpService() {
    }
    TextOpService.prototype.performOpsOnText = function (text, ops) {
        var updatedText = text;
        console.log(ops);
        ops.opList.forEach(function (op) {
            if (op.type == Entities_1.OpType.ADD) {
                updatedText =
                    updatedText.substring(0, op.position) +
                        op.text +
                        updatedText.substring(op.position);
            }
            else if (op.type == Entities_1.OpType.DELETE) {
                updatedText =
                    updatedText.substring(0, op.position) +
                        updatedText.substring(op.position + op.text.length);
            }
        });
        console.log("text: " + text);
        console.log("updatedtext: " + updatedText);
        return updatedText;
    };
    return TextOpService;
}());
exports.TextOpService = TextOpService;
