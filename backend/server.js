import express from "express";
import dotenv from "dotenv"
import authroutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000
// console.log(process.env.MONGO_URI)

//middleware for authentication
app.use("/api/auth", authroutes);



//listening to the port
app.listen(PORT, () => {
  console.log(`SERVER STARTED AT ${PORT}`);
  connectMongoDB()
});
