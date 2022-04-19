import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

const hanleOpen = () => console.log("Conneted to DB");
const hanleError = (error) => console.log("DB Error", error);

db.on("error", hanleError);
db.once("open", hanleOpen);