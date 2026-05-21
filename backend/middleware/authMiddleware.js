import jwt from 'jsonwebtoken';
import User from '../modules/user/model/User.js';

export const ROLE_HIERARCHY = {
  student: 0,
  class_rep: 1,
  lecturer: 2,
  guild_president: 3,
  hod: 4,
  dean: 5,
  principal: 6,
  admin: 7,
};

export const generateURStudentID = async () => {
  let isUnique = false;
  let newID = "";

  while (!isUnique) {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomSequence = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    newID = `${year}2${randomSequence}`;
    const existingUser = await User.findOne({ studentID: newID });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return newID;
};

export const protect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ message: "Token expired" });
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

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

export const authorizeHierarchy = (...roles) => {
  return (req, res, next) => {
    const userLevel = ROLE_HIERARCHY[req.user.role];
    const hasAccess = roles.some(role => userLevel >= ROLE_HIERARCHY[role]);
    if (!hasAccess) {
      return res.status(403).json({
        message: `Insufficient privileges. Required: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

export const requireRankAbove = (targetRole) => {
  return (req, res, next) => {
    const promoterLevel = ROLE_HIERARCHY[req.user.role];
    const targetLevel = ROLE_HIERARCHY[targetRole];
    if (targetLevel === undefined) {
      return res.status(400).json({ message: "Invalid target role" });
    }
    if (targetLevel >= promoterLevel) {
      return res.status(403).json({
        message: `Cannot modify user with equal or higher rank`
      });
    }
    next();
  };
};
