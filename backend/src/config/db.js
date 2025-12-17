import mongoose from "mongoose"
import {ENV} from "../config/env.js"

export const connectDB = async()=>{
  try {
    const conn = await mongoose.connect(ENV.DB_URL)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.log("❌ Error in DB connection",error)
    process.exit(1)
  }
}