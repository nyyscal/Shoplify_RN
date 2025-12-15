import express from "express"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 8000
const app = express()

app.get("/api/health",(req,res)=>{
  res.status(200).json({message:"Succss"})
})

app.listen(PORT,()=>{
  console.log(`Server is running on http://localhost:${PORT}`)
})