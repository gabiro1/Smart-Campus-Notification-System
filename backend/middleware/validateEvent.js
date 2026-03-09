// middleware/validateEvent.js

export const validateEvent = (req, res, next) => {
    const { title, date } = req.body;
    
    // Only require title and date; targetDept and targetSchool are now optional
    if (!title || !date) {
        return res.status(400).json({ 
            message: "Please provide a title and date." 
        });
    }

    // Optional: normalize empty strings to null
    if (req.body.targetDept === "") req.body.targetDept = null;
    if (req.body.targetSchool === "") req.body.targetSchool = null;
    if (req.body.targetLevel === "") req.body.targetLevel = 0;

    next();
};