const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizschema = new Schema({
    date:{type:String,unique:true},
    questions:[{
        id:Number,
        question:{
            type:String,
        },
        options:[String],
        correctoption:Number
    }]
});

module.exports=mongoose.model("Quiz",quizschema);