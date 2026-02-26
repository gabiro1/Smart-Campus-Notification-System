export const validateEvent = (req, res, next) => {
    const { title, date, targetDept, targetSchool } = req.body;
    
    if (!title || !date || (!targetDept && !targetSchool)) {
        return res.status(400).json({ 
            message: "Please provide a title, date, and a target audience (Dept or School)." 
        });
    }
    next();
};