import mongoose from "mongoose";
const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect
        console.log("DATABASE CONNECTED SUCESSFULLY")
    } catch (error) {
        console.log(`DATABASE TO CONNECT KRLE: ${error.message}`)
    }
}

export default connectMongoDB