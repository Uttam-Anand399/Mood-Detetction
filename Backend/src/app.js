const express=require("express")
const app=express();
const songsRoute=require("./Router/songs.router")

app.use(express.json())
app.use("/",songsRoute)

module.exports=app;