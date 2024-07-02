import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {

    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("--------------------------------------------------------------------");
        console.log("\nMongo DB Connection Instance : ",connectionInstance.connection.db.databaseName);
        console.log("\nMongo DB Connected || Connection HOST : ", connectionInstance.connection.host);
        console.log("--------------------------------------------------------------------");

    } catch (error) {
        console.log("Mongo DB Connection Failed : ", error);
        process.exit(1);
    }

}

export default connectDB