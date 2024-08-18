"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriends = exports.addFriend = exports.searchUser = exports.logout = exports.isLoggedIn = exports.login = exports.register = exports.imageUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
});
const uploadToS3 = (file, name) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${name}`,
        Body: file,
        ContentType: [
            "image/jpg",
            "image/png",
            "image/svg",
            "video/mp4",
            "video/mkv",
            "video/avi",
        ],
    };
    const command = new client_s3_1.PutObjectCommand(params);
    try {
        const response = yield s3Client.send(command);
        console.log("File uploaded successfully:", response);
        return response;
    }
    catch (error) {
        throw error;
    }
});
const imageUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Image compression
    //Upload to S3
    if (req.file) {
        try {
            const compressedImage = yield (0, sharp_1.default)(req.file.path).toBuffer();
            yield uploadToS3(compressedImage, req.file.filename);
            const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${req.file.filename}`;
            console.log(imageUrl);
            fs_1.default.unlink(req.file.path, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "something went wrong:(" });
                }
            });
            return res.status(200).json(imageUrl);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "something went wrong:(" });
        }
    }
    return res.status(400).json({ message: "file not found :(" });
});
exports.imageUpload = imageUpload;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, image } = req.body;
    console.log("request", name, email, password, image);
    try {
        const users = yield db_1.db
            .select()
            .from(schema_1.userTable)
            .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email));
        console.log("users", users);
        if (users.length) {
            return res.status(400).json({ message: "email already register:(" });
        }
        const hash = yield bcryptjs_1.default.hash(password, 10);
        const user = yield db_1.db
            .insert(schema_1.userTable)
            .values({
            name,
            email,
            password: hash,
            image,
        })
            .returning({ userId: schema_1.userTable.id });
        console.log(user);
        res.status(202).json({ message: "user register successfully:(" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "something went wrong:(" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const users = yield db_1.db
        .select()
        .from(schema_1.userTable)
        .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email));
    if (users.length == 0) {
        return res.status(400).json({ message: "email not foudn:(" });
    }
    const user = users[0];
    try {
        const pass = yield bcryptjs_1.default.compare(password, users[0].password);
        if (!pass) {
            return res
                .status(400)
                .json({ message: "email and password combination is wrong:(" });
        }
        const token = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
            },
        }, process.env.SECRET);
        res.cookie("token", token, {
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });
        res.status(200).json({
            message: "loggedin successfully",
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
        });
    }
    catch (err) {
        res.status(500).json({ message: "something went wrong:(" });
    }
});
exports.login = login;
const isLoggedIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("cool");
    res.status(200).json({
        name: req.user.name,
        email: req.user.email,
        id: req.user.id,
        image: req.user.image,
    });
});
exports.isLoggedIn = isLoggedIn;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "", { sameSite: "none", httpOnly: true, secure: true });
    res.status(200).json({ message: "logged out successfully" });
});
exports.logout = logout;
const searchUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchText } = req.query;
    console.log(searchText);
    try {
        const results = yield db_1.db
            .select()
            .from(schema_1.userTable)
            .where((0, drizzle_orm_1.ilike)(schema_1.userTable.name, `%${searchText}%`));
        res.status(200).json(results);
    }
    catch (err) {
        res.status(500).json({ message: "somegthing went wrong" });
    }
});
exports.searchUser = searchUser;
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user1, user2 } = req.body;
    try {
        yield db_1.db.insert(schema_1.friendTable).values([
            {
                you: user1,
                friend: user2,
                lastText: "start conversation",
                messageRead: true,
            },
            {
                you: user2,
                friend: user1,
                lastText: "start conversation",
                messageRead: true,
            },
        ]);
        res.status(200).json({ message: "added successfully:)" });
    }
    catch (err) {
        res.status(500).json({ message: "somegthing went wrong" });
    }
});
exports.addFriend = addFriend;
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const friends = yield db_1.db
            .select({
            friendId: schema_1.friendTable.friend,
            friendName: schema_1.userTable.name,
            friendEmail: schema_1.userTable.email,
            friendImage: schema_1.userTable.image,
            lastText: schema_1.friendTable.lastText,
            lastTime: schema_1.friendTable.lastTime,
            isRead: schema_1.friendTable.messageRead,
        })
            .from(schema_1.friendTable)
            .innerJoin(schema_1.userTable, (0, drizzle_orm_1.eq)(schema_1.friendTable.friend, schema_1.userTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.friendTable.you, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.friendTable.lastTime));
        console.log(friends);
        res.status(200).json(friends);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "somegthing went wrong" });
    }
});
exports.getFriends = getFriends;
