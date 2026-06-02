import EventAttachment from '../model/EventAttachment.js';
import Event from '../model/Event.js';
import path from 'path';
import fs from 'fs';

export const uploadPoster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const eventId = req.params.id || req.body.eventId;
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      if (event.createdBy.toString() !== req.user.id && !['guild_president', 'principal', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const attachment = await EventAttachment.create({
      event: eventId || null,
      uploadedBy: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: `/uploads/posters/${req.file.filename}`,
      isPoster: true
    });

    if (eventId) {
      await Event.findByIdAndUpdate(eventId, { posterUrl: `/uploads/posters/${req.file.filename}` });
    }

    res.json({
      success: true,
      message: 'Poster uploaded',
      attachment,
      posterUrl: `/uploads/posters/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload Poster Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const eventId = req.params.id;
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const attachment = await EventAttachment.create({
      event: eventId || null,
      uploadedBy: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: `/uploads/posters/${req.file.filename}`,
      isPoster: false
    });

    res.json({
      success: true,
      message: 'Attachment uploaded',
      attachment
    });
  } catch (error) {
    console.error('Upload Attachment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttachments = async (req, res) => {
  try {
    const attachments = await EventAttachment.find({ event: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, attachments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const attachment = await EventAttachment.findById(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ success: false, message: 'Attachment not found' });

    const event = await Event.findById(attachment.event);
    if (event && event.createdBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filePath = path.join(process.cwd(), attachment.filePath);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}

    await EventAttachment.findByIdAndDelete(req.params.attachmentId);

    if (attachment.isPoster && event) {
      await Event.findByIdAndUpdate(attachment.event, { posterUrl: '' });
    }

    res.json({ success: true, message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
