const express=require("express")
const router=express.Router()
const multer=require("multer")
const uploadFile=require("../Services/songs.service")
const songsModel=require("../model/songs.model")
const cors=require("cors")

router.use(express.json())
router.use(cors())


const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/songs",upload.single("audioFile"),async(req,res)=>{
    // let file=req.body
    // console.log(file)
    console.log(req.body);
    console.log(req.file);
    let fileData=await uploadFile(req.file)
    console.log(fileData);
    
    let songs=songsModel.create({
        title:req.body.title,
        artist:req.body.artist,
        audioFile:fileData.url,
        mood:req.body.mood
    })
    res.status(200).json({
        message:"Song created succesfully",
        song:songs
    })
    
})
router.get("/songs",async(req,res)=>{
    let data=await songsModel.find()
    res.json(data)
})
module.exports=router