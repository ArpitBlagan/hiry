"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const middleware_1 = require("./middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const user_1 = require("./controller/user");
const message_1 = require("./controller/message");
const storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 1000000 } });
exports.router = (0, express_1.Router)();
exports.router.route("/login").post(user_1.login);
exports.router.route("/register").post(user_1.register);
exports.router.route("/upload").post(upload.single("file"), user_1.imageUpload);
exports.router.use(middleware_1.validateToken);
exports.router.route("/isloggedin").get(user_1.isLoggedIn);
exports.router.route("/search").get(user_1.searchUser);
exports.router.route("/addfriend").post(user_1.addFriend);
exports.router.route("/getfriends").get(user_1.getFriends);
exports.router.route("/getmessages").get(message_1.getMessage);
