import express from "express"
import dotenv from "dotenv"

dotenv.config()

export const ENV ={
  PORT : process.env.PORT || 8000,
  NODE_ENV : process.env.NODE_ENV || "development",
  DB_URL : process.env.DB_URL 
}