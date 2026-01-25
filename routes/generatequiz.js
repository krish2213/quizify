const express = require("express")
const router = express.Router();
const axios = require("axios");
const UserQuiz = require("../models/userquiz");
const { isLoggedIn } = require("../middleware");
const Groq = require("groq-sdk").default;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_QUIZ });
async function generateQuiz(topic, count) {
    try {
        const response = await groq.chat.completions.create({
            model: process.env.MODEL1,
            messages: [
                {
                    role: "system",
                    content: process.env.SYSTEMPROMPT
                },
                {
                    role: "user",
                    content: `Generate exactly ${count} multiple-choice quiz questions on the topic: ${topic}. Mix difficulty levels (easy, medium, hard) but DO NOT generate more or fewer than ${count} questions.`
                }
            ]
        });
        const content = response.choices?.[0]?.message?.content?.trim() || "";
        const jsonString = content.slice(content.indexOf("["), content.lastIndexOf("]") + 1);
        const questions = JSON.parse(jsonString).slice(0,count);

        return questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            options: q.options,
            correctoption: q.correctoption
        }));
    } catch (error) {
        console.error("Error generating quiz with Groq:", error.message);
        return "error";
    }
}
/*
async function generateQuiz(topic, count) {
    try {
        const response = await axios.post(`${process.env.SEND_REQUEST}`,
            {
                contents: [
                    {
                        parts: [{
                            text: `${process.env.SYSTEMPROMPT}. Generate exactly ${count} multiple-choice quiz questions on the topic: ${topic}. Mix difficulty levels(medium, hard).`
                        }]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        const jsonString = content.slice(content.indexOf("["), content.lastIndexOf("]") + 1);
        const questions = JSON.parse(jsonString).slice(0, count);

        return questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            options: q.options,
            correctoption: q.correctoption
        }));
    } catch (error) {
        console.error("Error generating quiz with Gemini:", error.message);
        return "error";
    }
}
*/
router.post("/", isLoggedIn, async (req, res) => {
    const quiztopic = req.session.quiztopic;
    const qcount = req.session.qcount;
    try {
        const question = await generateQuiz(quiztopic, qcount);
        if (!question) {
            return res.redirect("/createquiz");
        }
        const newQuiz = new UserQuiz({ author: req.user._id, questions: question, topic: quiztopic });
        await newQuiz.save();
        req.session.newQuiz = newQuiz;
        return res.json({ success: true });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
})

module.exports=router;