const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const axios = require("axios");
const flash = require("connect-flash");
const { transporter } = require("./mailconfig");
const multer = require("multer");
const { storage } = require("./cloudinary");
const upload = multer({ storage });
const MongoStore = require("connect-mongo").default || require("connect-mongo");

//Schemas
const User = require("./models/user");
const Quiz = require("./models/quiz");
const UserQuiz = require("./models/userquiz");

//Backend routes
const authroutes = require("./routes/authroutes");
const showroutes = require("./routes/showroutes");
const leaderboardroutes = require("./routes/leaderboard");
const attendquizroutes = require("./routes/attendquiz");
const generatequizroutes = require("./routes/generatequiz");
const attendingroutes = require("./routes/attending");
const usergeneratedroutes = require("./routes/usergenerate");
const followroutes = require("./routes/follow");
const profileroutes = require("./routes/profile");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { isLoggedIn, isAuth } = require("./middleware");

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection errror :"));
db.once("open", async () => {
    console.log("Database Connected");
})

const cors = require("cors");
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.set('trust proxy', 1);

const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        touchAfter: 24 * 3600
    }),
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 1 //One day
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/auth/google/callback` : "http://localhost:3000/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                user.googleId = profile.id;
                await user.save();
            } else {
                let username;
                let unique = false;
                while (!unique) {
                    const random = Math.floor(Math.random() * 10000);//Random number between 0-9999
                    const tusername = `quizzer${random}`;
                    const check = await User.findOne({ username: tusername });
                    if (!check) {
                        username = tusername;
                        unique = true;
                    }
                }
                user = new User({
                    username: username,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                });
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: "🎉 Welcome to Quizify - Let the Quizzing Begin!",
                    text: `
Hi ${user.username},
        Welcome to Quizify! 🎯 We're thrilled to have you on board. Get ready to explore, create, and challenge yourself with exciting quizzes!
         🔥 Here's what you can do:
                ✅ Play quizzes on various topics 📚
                ✅ Challenge friends 1v1 with a timer and earn XPs! ⚔️⏱️
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
                        return res.redirect("/register")
                    }
                });
                await user.save();
            }
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    app.locals.tabswitch = false;//tab switch for site wide
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get("/api/health", (req, res) => {
    res.json({ message: "Server is healthy" });
})

app.get("/auth/google", passport.authenticate("google", {
    access_type: "offline",
    scope: ["profile", "email"]
}));

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
        failureFlash: true
    }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/?login=success`);
    }
);

app.use("/api/profile", profileroutes);
app.use("/api/show", showroutes);
app.use("/api/leaderboard", leaderboardroutes);
app.use("/api/attendquiz", attendquizroutes);
app.use("/api/generate-quiz", generatequizroutes)
app.use("/api/attending", attendingroutes);
app.use("/api/generatequiz", usergeneratedroutes);
app.use("/api/follow", followroutes);
app.use("/api", authroutes);


app.put("/api/editprofile", isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.username) {
            user.username = req.body.username;
        }
        if (req.file) {
            user.profilePicture = req.file.path;
        }
        await user.save();
        req.login(user, (err) => {
            if (err) {
                return res.json({ success: false, error: "Login error after update" });
            }
            return res.json({ success: true, user: user });
        });
    }
    catch (e) {
        console.log(e);
        return res.json({ success: false, error: "Username already exists" });
    }
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    })
}

module.exports = app;
