import mongoose from 'mongoose';
import Announcement from '../../announcement/model/Announcement.js'; // Path to your model
import User from '../../user/model/User.js'; 

// ✅ THE FIX: Dashboard Controller
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    // 1. FLOW CONTROL: Check the correct field 'classId'
    if (!student || !student.classId) {
       console.log("User has no class assigned.");
       // Return a clean, empty dashboard to prevent UI crashes
       return res.status(200).json({
         success: true,
         stats: { attendanceRate: 0, aiMatchAvg: 0, savedCount: 0, campusPulse: 0 },
         schedule: [],
         messages: []
       });
    }

    // 2. QUERY: Match Announcement's targetClass to the Student's classId
    const announcements = await Announcement.find({
      targetClass: student.classId 
    })
    .populate('lecturer', 'name') 
    .sort({ createdAt: -1 });

    console.log(`Matched ${announcements.length} announcements for Class ${student.classId}`);

    // 3. MAP RESPONSE
    res.status(200).json({
      success: true,
      stats: {
        // WARNING: student.attendanceRate and student.savedEvents do NOT exist 
        // in your current User schema. They will return undefined.
        attendanceRate: student.attendanceRate || 0,
        aiMatchAvg: 85,
        savedCount: student.savedEvents?.length || 0,
        campusPulse: announcements.length 
      },
      schedule: [], 
      messages: announcements.map(m => ({
        sender: m.lecturer?.name || "Lecturer", 
        role: "Faculty",
        title: m.title,   
        text: m.content,  
        attachments: m.attachments,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching class-specific feed." });
  }
};