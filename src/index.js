import dotevn from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotevn.config({ path: "./.env" });


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      app.on("error", (error) => {
        console.log("Express Mongo Communication Error");
        throw error;
      });
      console.log("Server is listening to port : ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Mong DB Connection Failed, ERROR : ", err);
  });

// const app = express();

// ;( async () => {
//     try {
//         await mongoose.connect(`${process.env.DB_NAME}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("Express Mongo Communication Error");
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             log("App is listening on Port : ", process.env.PORT)
//         })
//     } catch (error) {
//         console.log("DB Connectivity Error : ", error);
//     }
// })()
