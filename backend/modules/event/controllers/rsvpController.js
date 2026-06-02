import EventRSVP from '../model/EventRSVP.js';
import Event from '../model/Event.js';
import User from '../../user/model/User.js';

export const rsvpEvent = async (req, res) => {
  try {
    const { eventId, status } = req.body;
    if (!eventId || !status) {
      return res.status(400).json({ success: false, message: 'eventId and status required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Cannot RSVP to unpublished event' });
    }

    const existing = await EventRSVP.findOne({ eventId, userId: req.user.id });
    if (existing) {
      existing.status = status;
      await existing.save();
      return res.json({ success: true, message: 'RSVP updated', rsvp: existing });
    }

    const rsvp = await EventRSVP.create({ eventId, userId: req.user.id, status });
    res.status(201).json({ success: true, message: 'RSVP recorded', rsvp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRSVP = async (req, res) => {
  try {
    const { eventId, status } = req.body;
    const rsvp = await EventRSVP.findOneAndUpdate(
      { eventId, userId: req.user.id },
      { status },
      { new: true }
    );
    if (!rsvp) return res.status(404).json({ success: false, message: 'RSVP not found' });
    res.json({ success: true, rsvp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRSVP = async (req, res) => {
  try {
    const { eventId } = req.body;
    await EventRSVP.findOneAndDelete({ eventId, userId: req.user.id });
    res.json({ success: true, message: 'RSVP removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserRSVP = async (req, res) => {
  try {
    const rsvp = await EventRSVP.findOne({ eventId: req.params.eventId, userId: req.user.id });
    res.json({ success: true, rsvp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendees = async (req, res) => {
  try {
    const attendees = await EventRSVP.find({ eventId: req.params.eventId, status: 'going' })
      .populate('userId', 'name email profilePicture role department')
      .sort({ createdAt: -1 });
    res.json({ success: true, attendees, count: attendees.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scanAttendance = async (req, res) => {
  try {
    const { studentId } = req.body;
    const { id: eventId } = req.params;

    const rsvp = await EventRSVP.findOne({ eventId, userId: studentId });
    if (!rsvp) return res.status(404).json({ success: false, message: 'RSVP not found for this student' });

    rsvp.attended = true;
    rsvp.scannedAt = new Date();
    await rsvp.save();

    const event = await Event.findById(eventId);
    if (event && !event.checkedInBy?.some(c => c.studentId?.toString() === studentId)) {
      event.checkedInBy.push({ studentId, studentIdentifier: studentId, checkedInAt: new Date() });
      await event.save();
    }

    res.json({ success: true, message: 'Attendance recorded', scannedAt: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
