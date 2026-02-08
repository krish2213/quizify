const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const challenge = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    from:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    to:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    questions:[{
        id:Number,
        question:{
            type:String,
        },
        options:[String],
        correctoption:Number
    }],

    userAttempts:[{
        user:{type:Schema.Types.ObjectId, ref:"User"},
        score:Number,
    }],
    topic:{type:String}
});

module.exports = mongoose.model("Challenge",challenge);