const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalmongoose = require("passport-local-mongoose");

const userschema = new Schema({
    username : {type:String, unique:true, required:true},
    email:{type:String,unique:true},
    logoutAttempts:[{date:String,times:Number}],
    quizAttempts:[{date:String,score:Number}],
    sudokuAttempts: [{date:String,score:Number}],
    totalScore:{type:Number,default:0},
    profilePicture:{
        type:String,
        default : "https://res.cloudinary.com/di5q8uqqc/image/upload/v1752672038/dp_e8jusg.jpg"
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    rank : {type:Number,default:0},
    xp : {type:Number,default:0},
    won : {type:Number, default:0},
    lost : {type:Number, default:0},
    draw : {type:Number, default:0},
    recentform : [{type:Number}]

});
userschema.plugin(passportlocalmongoose);
module.exports=mongoose.model("User",userschema);