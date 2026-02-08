const express = require("express")
const router = express.Router();
const UserQuiz = require("../models/userquiz");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
    if (!req.session.code) {
        return res.json({ redirect: "/attendquiz" });
    }
    try {
        const quiz = await UserQuiz.findOne({ number: req.session.code });
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        const attempt = quiz.logoutAttempts.find(a => a.user && a.user.toString() === req.user._id.toString());
        if (attempt) {
            if (attempt.times === 3) {
                const userAttempt = quiz.userAttempts.find(attempt => attempt.user && attempt.user.toString() === req.user._id.toString());
                if (!userAttempt) {
                    quiz.userAttempts.push({ user: req.user._id, score: 0 });
                    await quiz.save();
                }
                return res.json({ solved: true, data: quiz, score: 0, caption: "You cannot attempt this quiz because you have exceeded the tab-switch limit" });
            }
        }
        const userAttempt = quiz.userAttempts.find(attempt => attempt.user && attempt.user.toString() === req.user._id.toString());
        if (userAttempt) {
            return res.json({ solved: true, data: quiz, score: userAttempt.score, caption: "You have already attempted this Quiz!" });
        }
        const user = await User.findById(quiz.author);
        res.json({ data: quiz, author: user.username });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return res.status(500).json({ error: "Error" });
    }

})

router.post("/:number", isLoggedIn, async (req, res) => {
    try {
        const { number } = req.params;
        const quiz = await UserQuiz.findOne({ number });
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        const user = await User.findById(req.user._id);
        const userAttempt = quiz.userAttempts.find(attempt => attempt.user && attempt.user.toString() === req.user._id.toString());
        if (userAttempt) {
            return res.json({ solved: true, data: quiz, score: userAttempt.score, caption: "You have already attempted this Quiz!" });
        }
        let score = 0;
        const userAnswers = req.body.answers || req.body;
        quiz.questions.forEach((question, index) => {
            const userAnswer = userAnswers[`question_${index}`];
            if (userAnswer !== undefined && parseInt(userAnswer) === question.correctoption) {
                score++;
            }
        });
        quiz.userAttempts.push({ user: user._id, score });
        await quiz.save();
        return res.json({ solved: true, data: quiz, score, caption: "Congratulations!" });
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
module.exports = router;