import mongoose from "mongoose";
import { DB_NAME } from "../constanta.js";

const connectDB = async () => {
    try {
        const connectionInstanxe = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB connected !! DB Host : ${connectionInstanxe.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;