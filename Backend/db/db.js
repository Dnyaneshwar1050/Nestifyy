import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const DBConection = async () =>{
    try {
        const conectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`DataBase connected !! DB Host: ${conectionInstance.connection.host}`)
    } catch (error) {
        console.error("MONGODB conection error", error);
        process.exit(1)
    }
}

export default DBConection;