const express = require("express")
const router = express.Router();
const {isLoggedIn} = require("../middleware");

router.get("/", isLoggedIn, (req, res) => {
    res.render("quizpages/buildquiz");
})
module.exports=router;