const express = require("express")
const router = express.Router();
const UserQuiz = require("../models/userquiz");
const {isLoggedIn} = require("../middleware");

router.post("/", isLoggedIn, async (req, res) => {
    try {
        const { questions,topic} = req.body;
        if (!questions || questions.length === 0) {
            return res.status(400).json({ error: "Invalid quiz data" });
        }
        const newQuiz = new UserQuiz({ author: req.user._id, questions, topic:topic});
        await newQuiz.save();
        return res.json({ message: "Quiz saved successfully", number: newQuiz.number });
    } catch (error) {
        console.log("Error storing quiz:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports=router;