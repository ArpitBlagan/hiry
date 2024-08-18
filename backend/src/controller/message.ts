import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "../db";
import { conversationTable, friendTable, messageTable } from "../db/schema";
import { Request, Response } from "express";
export const saveMessage = async (
  text: string,
  type: any,
  from: string,
  to: string
) => {
  console.log(text, type, from, to);
  let user1, user2;
  if (from > to) {
    user1 = to;
    user2 = from;
  } else {
    user1 = from;
    user2 = to;
  }
  try {
    await db
      .update(friendTable)
      .set({ lastText: text, messageRead: false, lastTime: new Date() })
      .where(sql`${friendTable.you}=${to} and ${friendTable.friend}=${from}`);
    const conversations = await db
      .select()
      .from(conversationTable)
      .where(
        sql`${conversationTable.user1}=${user1} and ${conversationTable.user2}=${user2}`
      );
    console.log(conversations);
    if (conversations.length == 0) {
      const conversation = await db
        .insert(conversationTable)
        .values({
          user1: user1,
          user2: user2,
        })
        .returning({ id: conversationTable.id });
      console.log(conversation);
      //@ts-ignore
      await db.insert(messageTable).values({
        type,
        text,
        userId: from,
        conversationId: conversation[0].id,
      });
    } else {
      //@ts-ignore
      await db.insert(messageTable).values({
        type,
        text,
        userId: from,
        conversationId: conversations[0].id,
      });
    }
    return { message: "messags saved:)" };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};
export const getMessage = async (req: Request, res: Response) => {
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
  } else {
    user2 = from;
    user1 = to;
  }
  try {
    await db
      .update(friendTable)
      .set({ messageRead: true, count: 0 })
      .where(sql`${friendTable.you}=${from} and ${friendTable.friend}=${to}`);
    const conversations = await db
      .select()
      .from(conversationTable)
      .where(
        sql`${conversationTable.user1}=${user1} and ${conversationTable.user2}=${user2}`
      );
    if (conversations.length == 0) {
      return res.status(200).json([]);
    }
    const messages = await db
      .select({
        id: messageTable.id,
        type: messageTable.type,
        text: messageTable.text,
        createdAt: messageTable.createdAt,
        from: messageTable.userId,
      })
      .from(messageTable)
      .innerJoin(
        conversationTable,
        eq(messageTable.conversationId, conversationTable.id)
      )
      .where(
        sql`${conversationTable.user1}=${user1} and ${conversationTable.user2}=${user2}`
      )
      .orderBy(desc(messageTable.createdAt))
      .offset(offset)
      .limit(limit);
    console.log(messages);
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong:(" });
  }
};
