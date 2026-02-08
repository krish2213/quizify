const express = require("express")
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

router.post("/:id", isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const check = user.followers.includes(req.user._id);
        if (check) {
            user.followers.pull(req.user._id);
            await user.save();
            return res.json({ check: false, followers: user.followers.length });
        }
        else {
            user.followers.push(req.user._id);
            await user.save();
            return res.json({ check: true, followers: user.followers.length });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;