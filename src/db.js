import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube");

const db = mongoose.connection;

const hanleOpen = () => console.log("Conneted to DB");
const hanleError = (error) => console.log("DB Error", error);

db.on("error", hanleError);
db.once("open", hanleOpen);