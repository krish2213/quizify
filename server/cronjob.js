const cron = require("node-cron");
const User = require("./models/user");
const Leaderboard = require("./models/leaderboard");

let cacheleaderboard = [];
let cachedailyleaderboard = [];
let leaderboard = [];
let dailyleaderboard = [];
let updatedtime = "";
async function updateleaderboard() {
  leaderboard = await User.find({ quizAttempts: { $ne: [] } }, { username: 1, totalScore: 1, profilePicture: 1, updatedAt: 1, xp: 1 }).sort({ totalScore: -1, xp: -1, username: -1 });
  await Leaderboard.findOneAndUpdate({ type: "overall" }, { data: leaderboard }, { upsert: true, new: true });
  const overall = await Leaderboard.findOne({ type: "overall" });
  var r = 1;
  for (let u of overall.data) {
    const us = await User.findOne({ username: u.username });
    us.rank = r;
    us.save();
    r++;
  }
  updatedtime = overall.updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(", ", " (");
  if (updatedtime.includes("am")) {
    updatedtime = updatedtime.replace("am", "").trim() + "AM)";
  }
  else {
    updatedtime = updatedtime.replace("pm", "").trim() + "PM)";
  }
  cacheleaderboard = overall ? overall.data : [];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ind = yesterday.toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).split('/').reverse().join('-');
  dailyleaderboard = await User.aggregate([{
    $project: {
      username: 1,
      profilePicture: 1,
      xp: 1,
      quizScore: {
        $getField: {
          field: "score",
          input: {
            $first: {
              $filter: {
                input: "$quizAttempts",
                as: "qa",
                cond: { $eq: ["$$qa.date", ind] }
              }
            }
          }
        }
      },
      sudokuScore: {
        $getField: {
          field: "score",
          input: {
            $first: {
              $filter: {
                input: "$sudokuAttempts",
                as: "sa",
                cond: { $eq: ["$$sa.date", ind] }
              }
            }
          }
        }
      }
    }
  },
  {
    $addFields: {
      totalScore: { $add: [{ $ifNull: ["$quizScore", 0] }, { $ifNull: ["$sudokuScore", 0] }] }
    }
  },
  {
    $match: { totalScore: { $gt: 0 } }
  },
  { $sort: { totalScore: -1, xp: -1, username: -1 } },
  {
    $project: {
      username: 1,
      profilePicture: 1,
      score: "$totalScore",
      date: ind
    }
  }
  ]);
  await Leaderboard.findOneAndUpdate(
    { type: "daily" },
    { data: dailyleaderboard },
    { upsert: true, new: true }
  );
  const daily = await Leaderboard.findOne({ type: "daily" });
  cachedailyleaderboard = daily ? daily.data : [];
}
cron.schedule("24 0 * * *", async () => {
  await updateleaderboard();
  console.log("Updated Leaderboard at 12:24AM");
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

async function loadonrestart() {
  const overall = await Leaderboard.findOne({ type: "overall" });
  updatedtime = overall.updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(", ", " (");
  if (updatedtime.includes("am")) {
    updatedtime = updatedtime.replace("am", "").trim() + "AM)";
  }
  else {
    updatedtime = updatedtime.replace("pm", "").trim() + "PM)";
  }
  cacheleaderboard = overall ? overall.data : [];
  const daily = await Leaderboard.findOne({ type: "daily" });
  cachedailyleaderboard = daily ? daily.data : [];
}
//load on server restart
(async () => {
  await loadonrestart();
  console.log(updatedtime);
})();

module.exports = {
  dailyleaderboard: () => cachedailyleaderboard,
  leaderboard: () => cacheleaderboard,
  updatedAt: () => updatedtime
};