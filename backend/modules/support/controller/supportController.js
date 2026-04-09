import SupportTicket from '../model/SupportTicket.js';
import User from '../../user/model/User.js';

// ==========================================
// STUDENT: Submit a Support Ticket
// ==========================================
export const createTicket = async (req, res) => {
  try {
    const { category, subject, description, screenshot } = req.body;
    
    if (!category || !subject || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category, subject, and description are required' 
      });
    }

    // Get next ticket number
    const ticketNumber = await SupportTicket.getNextTicketNumber();

    const ticket = new SupportTicket({
      userId: req.user._id || req.user.id,
      ticketNumber,
      category,
      subject,
      description,
      screenshot: screenshot || null,
      status: 'open'
    });

    await ticket.save();
    
    // Populate user info
    await ticket.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Ticket submitted successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
};

// ==========================================
// STUDENT: Get My Tickets
// ==========================================
export const getMyTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { userId: req.user._id || req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SupportTicket.countDocuments(filter);

    // Get counts by status for the user
    const userId = req.user._id || req.user.id;
    const statusCounts = await SupportTicket.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      open: 0,
      in_review: 0,
      resolved: 0,
      closed: 0,
      total: total
    };
    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      },
      counts
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

// ==========================================
// ADMIN: Get All Tickets
// ==========================================
export const getAllTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    const tickets = await SupportTicket.find(filter)
      .populate('userId', 'name email role school department level classId')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SupportTicket.countDocuments(filter);

    // Get status counts
    const statusCounts = await SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = { open: 0, in_review: 0, resolved: 0, closed: 0 };
    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      },
      counts
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

// ==========================================
// ADMIN: Reply to Ticket
// ==========================================
export const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;

    if (!adminReply && !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply or status update required' 
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Update ticket
    if (adminReply) {
      ticket.adminReply = adminReply;
    }
    
    if (status) {
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedBy = req.user.id;
        ticket.resolvedAt = new Date();
      }
    }

    await ticket.save();
    await ticket.populate('userId', 'name email role school department');
    await ticket.populate('resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Reply to ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to reply to ticket' });
  }
};

// ==========================================
// ADMIN: Delete/Close Ticket
// ==========================================
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await SupportTicket.findByIdAndDelete(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ticket' });
  }
};

// ==========================================
// GET: Single Ticket Details
// ==========================================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'name email role school department level')
      .populate('resolvedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only allow ticket owner or admin to view
    if (ticket.userId._id.toString() !== req.user.id && !['admin', 'principal'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
};
