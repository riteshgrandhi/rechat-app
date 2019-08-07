"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var port = 3001;
var app = express_1.default();
app.listen(port, function () {
    console.log("listening on port: " + port + "...");
});
app.get("/api/data", function (req, res) {
    res.send({ express: "Express server is connected!" });
});
//# sourceMappingURL=server.js.map