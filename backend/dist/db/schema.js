"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationTable = exports.messageTable = exports.friendTable = exports.userTable = exports.messageType = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.messageType = (0, pg_core_1.pgEnum)("type", ["Video", "Image", "Text"]);
exports.userTable = (0, pg_core_1.pgTable)("userrr", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 50 }).notNull(),
    email: (0, pg_core_1.varchar)("email").notNull().unique(),
    password: (0, pg_core_1.varchar)("password").notNull(),
    image: (0, pg_core_1.varchar)("image"),
});
exports.friendTable = (0, pg_core_1.pgTable)("friend", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    you: (0, pg_core_1.uuid)("you")
        .references(() => exports.userTable.id)
        .notNull(),
    friend: (0, pg_core_1.uuid)("friend")
        .references(() => exports.userTable.id)
        .notNull(),
    lastText: (0, pg_core_1.varchar)("lastText").notNull(),
    messageRead: (0, pg_core_1.boolean)("messageRead"),
    count: (0, pg_core_1.integer)("count"),
    lastTime: (0, pg_core_1.timestamp)("lastTime").defaultNow(),
});
exports.messageTable = (0, pg_core_1.pgTable)("message", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    type: (0, exports.messageType)("type").notNull(),
    text: (0, pg_core_1.varchar)("text").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    userId: (0, pg_core_1.uuid)("userId")
        .references(() => {
        return exports.userTable.id;
    })
        .notNull(),
    conversationId: (0, pg_core_1.uuid)("conversationId")
        .references(() => exports.conversationTable.id)
        .notNull(),
});
exports.conversationTable = (0, pg_core_1.pgTable)("conversation", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().unique(),
    user1: (0, pg_core_1.uuid)("user1")
        .references(() => {
        return exports.userTable.id;
    })
        .notNull(),
    user2: (0, pg_core_1.uuid)("user2")
        .references(() => {
        return exports.userTable.id;
    })
        .notNull(),
});
