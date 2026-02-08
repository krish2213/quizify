const mongoose = require("mongoose");
const leaderboardSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  data: [
    {
      username: String,
      totalScore: Number,
      profilePicture: String,
      quizAttempts:[{date:String,score:Number}],
      score: Number,
    },
  ],
},
{ timestamps: true }
);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);