import {
  varchar,
  pgTable,
  uuid,
  pgEnum,
  timestamp,
  primaryKey,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const messageType = pgEnum("type", ["Video", "Image", "Text"]);

export const userTable = pgTable("userrr", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  image: varchar("image"),
});

export const friendTable = pgTable("friend", {
  id: uuid("id").primaryKey().defaultRandom(),
  you: uuid("you")
    .references(() => userTable.id)
    .notNull(),
  friend: uuid("friend")
    .references(() => userTable.id)
    .notNull(),
  lastText: varchar("lastText").notNull(),
  messageRead: boolean("messageRead"),
  count: integer("count"),
  lastTime: timestamp("lastTime").defaultNow(),
});

export const messageTable = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: messageType("type").notNull(),
  text: varchar("text").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  userId: uuid("userId")
    .references(() => {
      return userTable.id;
    })
    .notNull(),
  conversationId: uuid("conversationId")
    .references(() => conversationTable.id)
    .notNull(),
});

export const conversationTable = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  user1: uuid("user1")
    .references(() => {
      return userTable.id;
    })
    .notNull(),
  user2: uuid("user2")
    .references(() => {
      return userTable.id;
    })
    .notNull(),
});
