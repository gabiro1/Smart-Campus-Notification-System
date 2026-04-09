import mongoose from 'mongoose';
import Announcement from '../../announcement/model/Announcement.js'; // Path to your model
import User from '../../user/model/User.js'; 
import Timetable from '../../timetable/model/Timetable.js';

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

    // 3. Fetch today's timetable
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const timetableEntries = await Timetable.find({ classId: student.classId })
      .populate('lecturerId', 'name')
      .sort({ startTime: 1 });

    // Map timetable to schedule format
    const schedule = timetableEntries.map(entry => ({
      time: entry.startTime,
      subject: entry.topic || 'Class',
      room: entry.venue || 'TBA',
      dayOfWeek: entry.dayOfWeek
    }));

    // 4. MAP RESPONSE
    res.status(200).json({
      success: true,
      stats: {
        // ✅ Now using the actual fields from User schema
        attendanceRate: student.attendanceRate || 0,
        aiMatchAvg: 85,
        savedCount: student.savedEvents?.length || 0,
        campusPulse: announcements.length 
      },
      schedule: schedule, 
      messages: announcements.slice(0, 10).map(m => ({
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

// Student Timetable Controller - fetches timetable for logged-in student's class
export const getStudentTimetable = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    if (!student || !student.classId) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No class assigned to student"
      });
    }

    const { dayOfWeek } = req.query;
    const filter = { classId: student.classId };
    
    if (dayOfWeek) {
      filter.dayOfWeek = dayOfWeek;
    }

    const timetableEntries = await Timetable.find(filter)
      .populate('lecturerId', 'name email')
      .populate('classId', 'code name')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: timetableEntries
    });
  } catch (error) {
    console.error("Timetable Error:", error);
    res.status(500).json({ message: "Error fetching timetable." });
  }
};