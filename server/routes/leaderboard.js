const express = require("express")
const router = express.Router();
const { dailyleaderboard, leaderboard, updatedAt } = require("../cronjob");

router.get("/", async (req, res) => {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const perpage = 10;
    let data = [];
    let total = 0;
    let updated = updatedAt();

    if (type === "alltime") {
        const allData = leaderboard();
        total = allData.length;
        data = allData.slice((page - 1) * perpage, page * perpage);
        res.json({
            data,
            updatedAt: updated,
            currentPage: page,
            totalPages: Math.ceil(total / perpage),
            limit: perpage
        });
    }
    else if (type === "daily") {
        const allData = dailyleaderboard();
        total = allData.length;
        data = allData.slice((page - 1) * perpage, page * perpage);
        res.json({
            data,
            updatedAt: updated,
            currentPage: page,
            totalPages: Math.ceil(total / perpage),
            limit: perpage
        });
    }
    else {
        return res.status(404).json({ error: "Not found" });
    }
})

module.exports = router;