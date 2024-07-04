import mongoose from "mongoose";
import "dotenv/config.js";

const mongoURI = process.env.MONGO_DB_URI;

const connectToMongo = async () => {
  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log(
        "*******************connection successful mongoose********************"
      );
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
};
export default connectToMongo;
