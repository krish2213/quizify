const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userQuizSchema = new Schema({
    number : {type:String,unique:true},
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    questions: [{
        id: Number,
        question: {
            type: String,
        },
        options: [String],
        correctoption: Number
    }],
     userAttempts: [{
        user: {type: Schema.Types.ObjectId, ref: "User"},
        score: Number,
    }],
    logoutAttempts: [{
        user:{type: Schema.Types.ObjectId, ref: "User"},
        times:Number
    }],
    topic : {type:String}
});

async function generateUniqueNumber() {
    let unique = false;
    let number;
    while (!unique) {
        number = Math.floor(1000 + Math.random() * 9000).toString();
        const existingQuiz = await mongoose.model("UserQuiz").findOne({ number });
        if (!existingQuiz) {
            unique = true;
        }
    }
    return number;
}

userQuizSchema.pre("save", async function (next) {
    if (!this.number) {
        this.number = await generateUniqueNumber();
    }
    next();
});


module.exports = mongoose.model("UserQuiz", userQuizSchema);
