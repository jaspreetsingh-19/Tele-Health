import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export default async function connect() {
    try {
        // Avoid duplicate connections
        if (mongoose.connection.readyState === 1) {
            console.log("✅ Already connected to MongoDB");
            return;
        }


        await mongoose.connect(process.env.MONGO_URI);

        mongoose.connection.on("connected", () => {
            console.log("✅ DB connected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ DB connection error:", err);
            process.exit(1);
        });

    } catch (e) {
        console.error("❌ Error in connect():", e);
        throw e;
    }
}
