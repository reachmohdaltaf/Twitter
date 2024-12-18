import mongoose from "mongoose";
const connectMongoDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log("MONGODB CONNECTED")
    } catch (error) {
        console.log(`DATABASE TO CONNECT KRLE: ${error.message}`)
        process.exit(1); // Stop the server if connection fails

    }
}

export default connectMongoDB