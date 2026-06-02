import mongoose from 'mongoose';
import Announcement from '../../announcement/model/Announcement.js'; // Path to your model
import User from '../../user/model/User.js'; 
import Timetable from '../../timetable/model/Timetable.js';
import Bookmark from '../../event/model/Bookmark.js';

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

    // 4. Count actual bookmarks from Bookmark collection
    const bookmarkCount = await Bookmark.countDocuments({ userId: student._id });

    // 5. MAP RESPONSE
    res.status(200).json({
      success: true,
      stats: {
        attendanceRate: student.attendanceRate || 0,
        aiMatchAvg: 85,
        savedCount: bookmarkCount,
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

export const getStudentStats = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('classId', 'name');

    const unreadNotifications = await mongoose.model('NotificationLog').countDocuments({ recipientId: req.user.id, status: 'unread' });
    const upcomingEvents = await mongoose.model('Event').countDocuments({ startDate: { $gte: new Date() } });
    const recentAnnouncements = await mongoose.model('GovernanceAnnouncement').countDocuments({ status: 'published', createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } });
    const activeReminders = await mongoose.model('Reminder').countDocuments({ studentId: req.user.id, status: 'pending' });

    res.json({
      success: true,
      data: {
        messages: unreadNotifications,
        attendance: student?.attendanceRate || 0,
        announcements: recentAnnouncements,
        deadlines: activeReminders,
        events: upcomingEvents,
      }
    });
  } catch (error) {
    console.error("getStudentStats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};