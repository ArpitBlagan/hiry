import { Router } from "express";
import { validateToken } from "./middleware";
import multer from "multer";
import path from "path";
import {
  addFriend,
  getFriends,
  imageUpload,
  isLoggedIn,
  login,
  register,
  searchUser,
} from "./controller/user";
import { getMessage } from "./controller/message";
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage, limits: { fileSize: 1000000 } });
export const router = Router();
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/upload").post(upload.single("file"), imageUpload);
router.use(validateToken);
router.route("/isloggedin").get(isLoggedIn);
router.route("/search").get(searchUser);
router.route("/addfriend").post(addFriend);
router.route("/getfriends").get(getFriends);
router.route("/getmessages").get(getMessage);
