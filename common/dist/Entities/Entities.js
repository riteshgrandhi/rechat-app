"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OpType;
(function (OpType) {
    OpType[OpType["ADD"] = 0] = "ADD";
    OpType[OpType["DELETE"] = 1] = "DELETE";
})(OpType = exports.OpType || (exports.OpType = {}));
var Events;
(function (Events) {
    Events["SERVER_TEXT_UPDATE"] = "server_text_update";
    Events["CLIENT_TEXT_UPDATE"] = "client_text_update";
})(Events = exports.Events || (exports.Events = {}));
