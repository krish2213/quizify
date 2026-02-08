module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized: Please log in" });
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(403).json({ error: "Already authenticated" });
    }
    next();
}