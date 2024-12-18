import express from "express";
import dotenv from "dotenv";
import authroutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
const app = express();
const PORT = process.env.PORT || 3000;
// console.log(process.env.MONGO_URI)

//middleware for parse to json
app.use(express.json());
app.use(express.urlencoded({extended: true})) //parse encoded

app.use(cookieParser())

//middleware for authentication
app.use("/api/auth", authroutes);
app.use("/api/users", userRoutes);

//listening to the port
app.listen(PORT, () => {
  console.log(`SERVER STARTED AT ${PORT}`);
  connectMongoDB();
});
