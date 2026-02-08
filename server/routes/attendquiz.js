const express = require("express")
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const UserQuiz = require("../models/userquiz");

router.get("/", isLoggedIn, (req, res) => {
    if (req.query) {
        var { quizcode } = req.query;
    }
    else {
        quizcode = '0';
    }
    res.json({ code: req.query.quizcode || '0' });
})
router.post("/", isLoggedIn, async (req, res) => {
    const { quizcode } = req.body;
    const quiz = await UserQuiz.findOne({ number: quizcode });
    if (!quiz) {
        return res.status(404).json({ success: false, message: "Invalid Quiz Code" });
    }
    req.session.code = quizcode;
    return res.json({ success: true });
})
module.exports = router;