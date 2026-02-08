const express = require("express")
const router = express.Router();
const User = require("../models/user");
const Quiz = require("../models/quiz");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
    const user = await User.findOne({ username: req.user.username });
    const ind = new Date().toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).split("/").reverse().join("-");
    const data = await Quiz.findOne({ date: ind });
    const attemptexist = user.quizAttempts.find(attempt => attempt.date === ind);
    const logattempt = user.logoutAttempts.find(a => a.date === ind);
    if (attemptexist) {
        if (logattempt) {
            if (logattempt.times === 3) {
                return res.json({ solved: true, data, score: 0, caption: "Your attempt for today is over due to exceeding the tab-switch limit" });
            }
        }
        return res.json({ solved: true, data, score: attemptexist.score, caption: "You already completed today's quiz!" });
    }
    if (logattempt) {
        if (logattempt.times === 3) {
            user.quizAttempts.push({ date: ind, score: 0 });
            await user.save();
            return res.json({ solved: true, data, score: 0, caption: "Your attempt for today is over due to exceeding the tab-switch limit" });
        }
    }
    res.json({ solved: false, data });
});

router.post("/", isLoggedIn, async (req, res) => {
    try {
        const ind = new Date().toLocaleDateString("en-GB", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).split("/").reverse().join("-");
        const quiz = await Quiz.findOne({ date: ind });
        let score = 0;
        const useranswers = req.body;
        const user = await User.findOne({ username: req.user.username });
        const attemptexist = user.quizAttempts.find(attempt => attempt.date === ind);
        if (attemptexist) {
            return res.json({ solved: true, data: quiz, score: attemptexist.score, caption: "You already completed today's quiz!" });
        }
        quiz.questions.forEach((question, index) => {
            const useranswer = useranswers[`question_${index}`];
            if (useranswer !== undefined && parseInt(useranswer) === question.correctoption) {
                score++;
            }
        });
        user.quizAttempts.push({ date: ind, score });
        user.totalScore += score;
        user.xp += 1;
        await user.save();
        return res.json({ solved: true, data: quiz, score: score, caption: "You have successfully completed the quiz for today!" });
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Server Error");
    }
})

module.exports = router;