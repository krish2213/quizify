const express = require("express")
const router = express.Router();
const User = require("../models/user");

router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } });
        var followersList = [];
        if (user) {
            for (const u of user.followers) {
                const us = await User.findById(u);
                if (us) {
                    followersList.push({ username: us.username, profilePicture: us.profilePicture });
                }
            }
        }
        if (user) {
            const rank = user.rank;
            if (!req.isAuthenticated()) {
                res.json({ user, rank, check: false, followersList });
            } else {
                const check = user.followers.some(followerId => followerId.toString() === req.user._id.toString());
                res.json({ user, rank, check, followersList });
            }
        } else {
            return res.status(404).json({ error: "Profile not found" });
        }
    } catch (e) {
        console.error("[PROFILE ERROR]", e);
        res.status(500).json({ error: "Server Error" });
    }
})

module.exports = router;