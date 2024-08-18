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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = exports.saveMessage = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const saveMessage = (text, type, from, to) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(text, type, from, to);
    let user1, user2;
    if (from > to) {
        user1 = to;
        user2 = from;
    }
    else {
        user1 = from;
        user2 = to;
    }
    try {
        yield db_1.db
            .update(schema_1.friendTable)
            .set({ lastText: text, messageRead: false, lastTime: new Date() })
            .where((0, drizzle_orm_1.sql) `${schema_1.friendTable.you}=${to} and ${schema_1.friendTable.friend}=${from}`);
        const conversations = yield db_1.db
            .select()
            .from(schema_1.conversationTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.conversationTable.user1}=${user1} and ${schema_1.conversationTable.user2}=${user2}`);
        console.log(conversations);
        if (conversations.length == 0) {
            const conversation = yield db_1.db
                .insert(schema_1.conversationTable)
                .values({
                user1: user1,
                user2: user2,
            })
                .returning({ id: schema_1.conversationTable.id });
            console.log(conversation);
            //@ts-ignore
            yield db_1.db.insert(schema_1.messageTable).values({
                type,
                text,
                userId: from,
                conversationId: conversation[0].id,
            });
        }
        else {
            //@ts-ignore
            yield db_1.db.insert(schema_1.messageTable).values({
                type,
                text,
                userId: from,
                conversationId: conversations[0].id,
            });
        }
        return { message: "messags saved:)" };
    }
    catch (err) {
        console.log(err);
        return { error: err };
    }
});
exports.saveMessage = saveMessage;
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, page } = req.query;
    const limit = 15;
    let offset = Number(page) - 1;
    offset *= limit;
    console.log("getMessage", limit, offset, page);
    if (!from || !to) {
        return res.status(400).json({ message: "both user id required:(" });
    }
    let user1, user2;
    if (from < to) {
        user1 = from;
        user2 = to;
    }
    else {
        user2 = from;
        user1 = to;
    }
    try {
        yield db_1.db
            .update(schema_1.friendTable)
            .set({ messageRead: true, count: 0 })
            .where((0, drizzle_orm_1.sql) `${schema_1.friendTable.you}=${from} and ${schema_1.friendTable.friend}=${to}`);
        const conversations = yield db_1.db
            .select()
            .from(schema_1.conversationTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.conversationTable.user1}=${user1} and ${schema_1.conversationTable.user2}=${user2}`);
        if (conversations.length == 0) {
            return res.status(200).json([]);
        }
        const messages = yield db_1.db
            .select({
            id: schema_1.messageTable.id,
            type: schema_1.messageTable.type,
            text: schema_1.messageTable.text,
            createdAt: schema_1.messageTable.createdAt,
            from: schema_1.messageTable.userId,
        })
            .from(schema_1.messageTable)
            .innerJoin(schema_1.conversationTable, (0, drizzle_orm_1.eq)(schema_1.messageTable.conversationId, schema_1.conversationTable.id))
            .where((0, drizzle_orm_1.sql) `${schema_1.conversationTable.user1}=${user1} and ${schema_1.conversationTable.user2}=${user2}`)
            .orderBy((0, drizzle_orm_1.asc)(schema_1.messageTable.createdAt))
            .offset(offset)
            .limit(limit);
        console.log(messages);
        res.status(200).json(messages);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "something went wrong:(" });
    }
});
exports.getMessage = getMessage;
