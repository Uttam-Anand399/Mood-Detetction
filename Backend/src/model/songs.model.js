const mongoose=require("mongoose")

const songsSchema=new mongoose.Schema({
    title:String,
    artist:String,
    audioFile:String,
    mood:String
})

const songsModel=mongoose.model("songs",songsSchema)
module.exports=songsModel