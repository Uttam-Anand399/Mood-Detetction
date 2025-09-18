const mongoose=require("mongoose")

function connectToDB(){
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("Connected to db")
    })
    .catch((err)=>{
        console.log("Error in connecting",err.message);
        
    })
}
module.exports=connectToDB;