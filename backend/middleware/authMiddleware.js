import jwt from 'jsonwebtoken';
import User from '../modules/user/model/User.js';


// --- UR REGISTRATION NUMBER GENERATOR ---
export const generateURStudentID = async () => {
  let isUnique = false;
  let newID = "";

  while (!isUnique) {
    // 1. Get current year's last 2 digits (e.g., "26" for 2026)
    const year = new Date().getFullYear().toString().slice(-2);
    
    // 2. Generate a random 6-digit number (e.g., "001232")
    const randomSequence = Math.floor(Math.random() * 1000000).toString().padStart(3, '0');
    
    // 3. Combine them: Year + 2 + Sequence (e.g., "262001232")
    newID = `${year}2${randomSequence}`;

    // 4. Double-check the database to guarantee no duplicates
    const existingUser = await User.findOne({ studentID: newID });
    if (!existingUser) {
      isUnique = true; 
    }
  }
  
  return newID;
};
// 1. Verify if the user is logged in

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

   if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

// 2. Verify the User's Role (Targeting System Security)
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to perform this action` 
            });
        }
        next();
    };
};