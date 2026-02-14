const express = require("express")
const router = express.Router();
const app = express();
const User = require("../models/user");
const UserQuiz = require("../models/userquiz");
const Challenge = require("../models/challenge");
const Sudoku = require("../models/sudoku");
const { isLoggedIn, isAuth, storeReturnTo } = require("../middleware");
const { transporter } = require("../mailconfig");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Groq = require("groq-sdk").default;
const axios = require("axios");
const user = require("../models/user");

router.get("/home-stats", isLoggedIn, async (req, res) => {
    const c = await Challenge.find({ $or: [{ from: req.user._id }, { to: req.user._id }], userAttempts: { $not: { $elemMatch: { user: req.user._id } } } });
    res.json({ count: c.length, user: req.user });
})

router.get("/current_user", (req, res) => {
    res.json({ user: req.user || null });
});

router.post("/login", (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.json({ success: true, user: req.user });
    }
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ success: false, message: info?.message || "Invalid username or password" });
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({ success: true, user });
        });
    })(req, res, next);
});

router.post("/register", isAuth, async (req, res, next) => {
    try {
        const { email, username } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.json({ success: false, message: "Username or Email already exists." });
        }
        const token = jwt.sign({ email, username }, process.env.JWTSECRET, { expiresIn: "300s" });
        const verifylink = `${process.env.FRONTEND_URL}/verifyaccount/${token}`;
        const message = `
         <p>Dear ${username},</p>
         <p>Click the link below to verify your account:</p>
         <p><a href="${verifylink}" target="_blank" style="color:#7B16FF; text-decoration:none;">Verify</a></p>
         <p>This link expires in <b>5 minutes</b>.</p>
         <br>
         <p>Happy Quizzing,<br>The Quizify Team 🌟</p>`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Your Account - Quizify",
            html: message
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.json({ success: false, message: "Invalid email!" });
            }
            else {
                return res.json({ success: true, message: "Verification link sent." });
            }
        })
    }
    catch (ex) {
        return res.json({ success: false, message: ex.message });
    }
})

router.get("/verify-token/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        res.json({ success: true, ...decoded });
    } catch (e) {
        res.json({ success: false, message: "Invalid or expired token" });
    }
})

router.post("/setpwd", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "🎉 Welcome to Quizify - Let the Quizzing Begin!",
            text: `
Hi ${username},
        Welcome to Quizify! 🎯 We're thrilled to have you on board. Get ready to explore, create, and challenge yourself with exciting quizzes!
         🔥 Here's what you can do:
                ✅ Play quizzes on various topics 📚
                ✅ Create your own quizzes & challenge friends 🎨
                ✅ Generate quizzes automatically with AI 🤖
                ✅ Take on the Daily Quiz & boost your score! 📅
                ✅ Climb the Leaderboard & compete with top players! 🏆
                ✅ Follow other users & see their quiz activity! 👥

🚀 Start your journey now and explore quizzes

Come back every day for a new quiz and stay ahead in the game! If you have any questions, feel free to reach out.

Happy quizzing! 🎉

Cheers,
The Quizify Team 🌟`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error")
                return res.redirect("/register");
            }
            else {
                return res.redirect("/login");
            }
        })
        req.login(registeredUser, err => {
            if (err) return res.json({ success: false, message: err.message });
            res.json({ success: true });
        })
    }
    catch (e) {
        res.json({ success: false, message: "Registration failed or user exists" });
    }
})

router.post("/logoutt", isLoggedIn, async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json({ success: true });
    });
})

router.post('/logout', async (req, res) => {
    const user = await User.findById(req.user._id);
    const ind = new Date().toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).split("/").reverse().join("-");

    const attempt = user.logoutAttempts.find(a => a.date === ind);
    if (attempt) {
        attempt.times += 1;
        console.log("check2");
    }
    else {
        user.logoutAttempts.push({ date: ind, times: 1 });
        console.log("check1");
    }
    app.locals.tabswitch = true;
    await user.save();
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json({ success: true });
    });
});

router.post('/quizlogout', async (req, res) => {
    const quiz = await UserQuiz.findOne({ number: req.body.number });
    const attempt = quiz.logoutAttempts.find(a => a.user.toString() === req.user._id.toString());
    if (attempt) {
        attempt.times += 1;
        console.log("check2");
    }
    else {
        quiz.logoutAttempts.push({ user: req.user._id, times: 1 });
        console.log("check1");
    }
    app.locals.tabswitch = true;
    await quiz.save();
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json({ success: true });
    });
});

// router.get("/changepwd") removed

router.post("/changepwd", isAuth, async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email: email })
    if (!user) {
        req.flash("error", "User doesn't exists");
        return res.redirect("/changepwd")
    }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWTSECRET, { expiresIn: '120s' });
    const resetURL = `${process.env.FRONTEND_URL}/resetpassword?id=${user._id}&token=${token}`;
    const username = user.username;
    const message = `
    <p>You are receiving this mail because you (or someone else) have requested to know your username/change password.</p>
    <p>Your username is: <b>${username}</b></p>
    <p>In case you need to change your password, use the this link : <a href="${resetURL}" target="_blank">Reset Password</a></p><br>
    <p>If you did not request this, please ignore this email, and your password will remain unchanged.</p>
    <p>Best regards,<br>The Quizify Team 🌟</p>`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Quizify - Forgot Password/Username',
        html: message
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.json({ success: false, message: 'Invalid email' });

        } else {
            return res.json({ success: true, message: 'Your Username & Password reset link has been sent to your mail' });
        }
    });
})

router.get('/verify-reset-token', isAuth, (req, res) => {
    let { id, token } = req.query;
    try {
        const check = jwt.verify(token, process.env.JWTSECRET)
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: "Link has expired" });
    }
})
router.post('/resetpassword', isAuth, async (req, res) => {
    const { password } = req.body;
    const user = await User.findOne({ _id: req.query.id });
    if (user) {
        await user.setPassword(password);
        await user.save()
        return res.json({ success: true, message: "Password has been reset successfully" });
    }
})

// router.get("/setpwd") removed

router.get("/viewquizzes/:id", isLoggedIn, async (req, res) => {
    try {
        const Quiz = await UserQuiz.find({ author: req.params.id });
        if (!(req.user._id.toString() === req.params.id.toString())) {
            return res.status(403).json({ error: "Restricted" });
        }
        res.json({ quizzes: Quiz });
    }
    catch (e) {
        return res.status(500).json({ error: "Not found" });
    }
})


router.get("/viewquiz/:id", isLoggedIn, async (req, res) => {
    try {
        const Quiz = await UserQuiz.find({ _id: req.params.id });
        if (!(req.user._id.toString() === Quiz[0].author.toString())) {
            return res.status(403).json({ error: "Restricted" });
        }
        const usernames = [], scores = [], logouts = [];
        for (const a of Quiz[0].userAttempts) {
            scores.push(a.score);
            const la = Quiz[0].logoutAttempts.find(k => k.user && k.user.toString() === a.user.toString());
            if (la) {
                logouts.push(la.times);
            }
            else {
                logouts.push(0);
            }
            const us = await User.findById(a.user);
            usernames.push(us.username);
        }
        res.json({ quizzes: Quiz, usernames, scores, logouts });
    }
    catch (e) {
        return res.status(500).json({ error: "Not found" });
    }
})
router.get("/updatequiz/:id", isLoggedIn, async (req, res) => {
    try {
        const Quiz = await UserQuiz.find({ _id: req.params.id });
        if (!(req.user._id.toString() === Quiz[0].author.toString())) {
            return res.status(403).json({ error: "Restricted" });
        }
        res.json({ quizzes: Quiz });
    }
    catch (e) {
        return res.status(500).json({ error: "Not found" });
    }
})
router.put("/viewquiz/:id", isLoggedIn, async (req, res) => {
    try {
        const quiz = await UserQuiz.findById(req.params.id);
        if (!quiz || req.user._id.toString() !== quiz.author.toString()) {
            return res.redirect("/restricted");
        }

        if (req.body.questions) {
            quiz.questions = req.body.questions;
        }

        await quiz.save();
        return res.json({ success: true, message: "Quiz updated successfully" });
    } catch (e) {
        console.error("Error updating quiz:", e);
        res.status(500).json({ error: "Error updating quiz" });
    }
});

router.delete("/viewquiz/:id", isLoggedIn, async (req, res) => {
    try {
        const Quiz = await UserQuiz.find({ _id: req.params.id });
        if (!(req.user._id.toString() === Quiz[0].author.toString())) {
            return res.redirect("/restricted");
        }
        await UserQuiz.deleteOne({ _id: req.params.id });
        return res.json({ success: true });
    }
    catch (e) {
        return res.status(500).json({ success: false });
    }
})

router.get("/warning", (req, res) => {
    if (app.locals.tabswitch === true) {
        app.locals.tabswitch = false;
        return res.json({ warning: true });
    }
    else {
        return res.json({ warning: false });
    }
})

//Chatbot
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_CHATBOT });
router.post("/chat", isLoggedIn, async (req, res) => {
    const userMessage = req.body.messages;
    try {
        const response = await groq.chat.completions.create({
            model: process.env.MODEL2,
            messages: [
                {
                    role: "system",
                    content: process.env.BOTPROMPT,
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        });

        const reply = response.choices?.[0]?.message?.content || "Sorry, no response.";
        res.json({ reply });
    } catch (error) {
        console.error("Groq error:", error);
        res.status(500).json({ reply: "Error talking to Groq." });
    }
});

//Challenge 1v1
/*async function generateQuiz(topic, count) {
    try {
        const response = await axios.post(`${process.env.SEND_REQUEST_CHALLENGE}`,
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
}*/
const groq1 = new Groq({ apiKey: process.env.GROQ_API_KEY_1v1 });
async function generateQuiz(topic, count) {
    try {
        const response = await groq1.chat.completions.create({
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
        const questions = JSON.parse(jsonString).slice(0, count);

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

router.get("/challenge", isLoggedIn, async (req, res) => {
    const c = await Challenge.find({ $or: [{ from: req.user._id }, { to: req.user._id }], userAttempts: { $not: { $elemMatch: { user: req.user._id } } } }).populate('from to', 'username profilePicture').sort({ _id: -1 });
    res.json({ count: c.length });
})

router.post("/challenge", isLoggedIn, async (req, res) => {
    const { username, topic } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const question = await generateQuiz(topic, 5);
        if (!question || question === "error") return res.json({ success: false, message: "Generation failed" });
        const challenge = new Challenge({ author: req.user._id, from: req.user._id, to: user._id, questions: question, topic });
        await challenge.save();
        return res.json({ success: true, message: "Challenge Created" });
    } catch (e) {
        console.error("[POST /challenge] EXCEPTION:", e);
        return res.status(500).json({ success: false, error: "Server Exception: " + e.message });
    }
})

router.post("/create-challenge", isLoggedIn, async (req, res) => {
    const opponent = req.session.opponent;
    const challenge_topic = req.session.challenge_topic;
    delete req.session.opponent;
    delete req.session.challenge_topic;
    try {
        const user = await User.findOne({ username: opponent });
        if (!user) {
            return res.json({ success: false });
        }
        const question = await generateQuiz(challenge_topic, 5);
        if (!question) {
            return res.redirect("/challenge");
        }
        const challenge = new Challenge({ author: req.user._id, from: req.user._id, to: user._id, questions: question, topic: challenge_topic });
        await challenge.save();
        return res.json({ success: true });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to generate quiz" });
    }

})

router.get("/challenges", isLoggedIn, async (req, res) => {
    const challenges1 = await Challenge.find({ $or: [{ from: req.user._id }, { to: req.user._id }], userAttempts: { $not: { $elemMatch: { user: req.user._id } } } }, {"questions.correctoption" : 0 } ).populate('from to', 'username profilePicture xp').sort({ _id: 1 });
    const challenges2 = await Challenge.find({ $and: [{ $or: [{ from: req.user._id }, { to: req.user._id }] }, { "userAttempts.user": req.user._id }] }, {"questions.correctoption" : 0 } ).populate('from to', 'username profilePicture xp').populate('userAttempts.user', 'username').sort({ _id: -1 });
    return res.json({ challenges1, challenges2, user: req.user._id, userr: req.user.username });
})

router.get("/playchallenge/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Challenge.findOne({ _id: id }, {"questions.correctoption" : 0 });
        const attempt = data.userAttempts.find(a => a.user.toString() === req.user._id.toString());
        if (attempt) {
            return res.json({ redirect: "/challenges" });
        }
        return res.json({ data, user: req.user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch challenge" });
    }
})

router.post("/playchallenge/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const data = await Challenge.findOne({ _id: id });
    const attempt = data.userAttempts.find(a => a.user.toString() === req.user._id.toString());

    if (attempt) {
        return res.redirect("/challenges");
    }
    const useranswers = req.body;
    let score = 0;
    data.questions.forEach((question, index) => {
        const useranswer = useranswers[`question_${index}`];
        if (useranswer !== undefined && parseInt(useranswer) === question.correctoption) {
            score++;
        }
    });
    data.userAttempts.push({ user: req.user._id, score: score });
    await data.save();

    if (data.userAttempts.length === 2) {
        const [a1, a2] = data.userAttempts;
        const user1 = await User.findById(a1.user._id);
        const user2 = await User.findById(a2.user._id);

        if (a1.score > a2.score) {
            user1.xp += 5;
            user1.won += 1;
            user1.recentform.push(1);
            if (user1.recentform.length > 5) {
                user1.recentform.shift();
            }
            user2.xp -= 2;
            user2.lost += 1;
            user2.recentform.push(-1);
            if (user2.recentform.length > 5) {
                user2.recentform.shift();
            }
        }
        else if (a2.score > a1.score) {
            user2.xp += 5;
            user2.won += 1;
            user2.recentform.push(1);
            if (user2.recentform.length > 5) {
                user2.recentform.shift();
            }
            user1.xp -= 2;
            user1.lost += 1;
            user1.recentform.push(-1);
            if (user1.recentform.length > 5) {
                user1.recentform.shift();
            }
        }
        else {
            user1.draw += 1;
            user1.recentform.push(0);
            if (user1.recentform.length > 5) {
                user1.recentform.shift();
            }
            user2.draw += 1;
            user2.recentform.push(0);
            if (user2.recentform.length > 5) {
                user2.recentform.shift();
            }
        }
        await user1.save();
        await user2.save();
    }
    await data.save();
    res.json({ success: true, redirect: "/challenges" });
})

router.get("/search-users", isLoggedIn, async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp("^" + escapeRegex(q), "i");

    const users = await User.find({
        username: { $regex: regex },
        _id: { $ne: req.user._id }
    }).select("username").limit(5);

    res.json(users);
});

router.get("/1v1stats/:username", async (req, res) => {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.json({ won: user.won, lost: user.lost, draw: user.draw, username, recentform: user.recentform });
})

router.get("/sudoku", isLoggedIn, async (req, res) => {
    const today = new Date().toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).split("/").reverse().join("-");
    const sudoku = await Sudoku.findOne({ date: today });
    const user = await User.findById(req.user._id);
    const attemptexist = user.sudokuAttempts.find(attempt => attempt.date === today);
    if (attemptexist) {
        return res.json({ solved: true, caption: "You've completed today's sudoku challenge. Stay sharp for tomorrow!" });
    }
    return res.json({
        puzzle: sudoku?.puzzle,
        solution: sudoku?.solution,
        solved: false
    });
});

router.post("/sudoku", isLoggedIn, async (req, res) => {
    const today = new Date().toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).split("/").reverse().join("-");
    const user = await User.findById(req.user._id);
    const attemptexist = user.sudokuAttempts.find(attempt => attempt.date === today);
    if (attemptexist) {
        return res.json({ solved: true, caption: "You already solved today's sudoku!" });
    }
    user.sudokuAttempts.push({ date: today, score: 10 });
    user.totalScore += 10;
    user.xp += 5;
    await user.save();
    return res.json({ solved: true, caption: "You solved today's sudoku!" });
})

router.get("/dailychallenge", isLoggedIn, async (req, res) => {
    res.json({ redirect: "/dailychallenge" });
})

router.get("/checkusername", async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.json({ exists: true, message: "Empty Username" });
    }
    const exist = await User.findOne({ username });
    if (exist) {
        return res.json({ exists: true, message: "Username already taken" });
    }
    return res.json({ exists: false, message: "Username available" });
})

router.get("/checkemail", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.json({ exists: true, message: "Empty Email" });
    }
    const exist = await User.findOne({ email });
    if (exist) {
        return res.json({ exists: true, message: "Email already registered" });
    }
    return res.json({ exists: false, message: "Email available" });
})

module.exports = router;