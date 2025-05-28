const User = require('../db/models/user.js');

module.exports = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(403).json({
                success: false,
                message: "User ID not found in request"
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. Please contact support."
            });
        }

        next();
    } catch (error) {
        console.error("Error in checkBanned middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while checking user status"
        });
    }
};
