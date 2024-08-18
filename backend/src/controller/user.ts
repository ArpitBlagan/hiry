import { Request, Response } from "express";
import fs from "fs";
import bcrypt from "bcryptjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { friendTable, userTable } from "../db/schema";
import { desc, eq, ilike, sql } from "drizzle-orm";
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
  },
});
const uploadToS3 = async (file: any, name: any) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
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

  const command = new PutObjectCommand(params as any);
  try {
    const response = await s3Client.send(command);
    console.log("File uploaded successfully:", response);
    return response;
  } catch (error) {
    throw error;
  }
};
export const imageUpload = async (req: Request, res: Response) => {
  //Image compression

  //Upload to S3
  if (req.file) {
    try {
      const compressedImage = await sharp(req.file.path).toBuffer();
      await uploadToS3(compressedImage, req.file.filename);
      const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${req.file.filename}`;
      console.log(imageUrl);
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "something went wrong:(" });
        }
      });
      return res.status(200).json(imageUrl);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "something went wrong:(" });
    }
  }
  return res.status(400).json({ message: "file not found :(" });
};
export const register = async (req: Request, res: Response) => {
  const { name, email, password, image } = req.body;
  console.log("request", name, email, password, image);
  try {
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    console.log("users", users);
    if (users.length) {
      return res.status(400).json({ message: "email already register:(" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await db
      .insert(userTable)
      .values({
        name,
        email,
        password: hash,
        image,
      })
      .returning({ userId: userTable.id });
    console.log(user);
    res.status(202).json({ message: "user register successfully:(" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong:(" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  if (users.length == 0) {
    return res.status(400).json({ message: "email not foudn:(" });
  }
  const user = users[0];
  try {
    const pass = await bcrypt.compare(password, users[0].password);
    if (!pass) {
      return res
        .status(400)
        .json({ message: "email and password combination is wrong:(" });
    }
    const token = jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      process.env.SECRET as string
    );
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
  } catch (err) {
    res.status(500).json({ message: "something went wrong:(" });
  }
};

export const isLoggedIn = async (req: Request, res: Response) => {
  console.log("cool");
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    id: req.user.id,
    image: req.user.image,
  });
};
export const logout = async (req: Request, res: Response) => {
  res.cookie("token", "", { sameSite: "none", httpOnly: true, secure: true });
  res.status(200).json({ message: "logged out successfully" });
};

export const searchUser = async (req: Request, res: Response) => {
  const { searchText } = req.query;
  console.log(searchText);
  try {
    const results = await db
      .select()
      .from(userTable)
      .where(ilike(userTable.name, `%${searchText}%`));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "somegthing went wrong" });
  }
};

export const addFriend = async (req: Request, res: Response) => {
  const { user1, user2 } = req.body;
  try {
    await db.insert(friendTable).values([
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
  } catch (err) {
    res.status(500).json({ message: "somegthing went wrong" });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const friends = await db
      .select({
        friendId: friendTable.friend,
        friendName: userTable.name,
        friendEmail: userTable.email,
        friendImage: userTable.image,
        lastText: friendTable.lastText,
        lastTime: friendTable.lastTime,
        isRead: friendTable.messageRead,
      })
      .from(friendTable)
      .innerJoin(userTable, eq(friendTable.friend, userTable.id))
      .where(eq(friendTable.you, userId))
      .orderBy(desc(friendTable.lastTime));
    console.log(friends);
    res.status(200).json(friends);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "somegthing went wrong" });
  }
};
