import Event from '../model/Event.js';

export async function detectConflicts(eventData, excludeEventId = null) {
  const conflicts = [];
  const { venue, startDate, endDate, startTime, endTime, title, targetAudience } = eventData;

  const startDateTime = combineDateAndTime(startDate, startTime);
  const endDateTime = combineDateAndTime(endDate || startDate, endTime || startTime);

  const queryFilter = {
    status: { $in: ['APPROVED', 'PUBLISHED', 'SCHEDULED', 'PENDING_REVIEW', 'UNDER_REVIEW'] },
    venue: venue,
    $or: [
      {
        startDate: { $lte: new Date(endDate || startDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  };

  if (excludeEventId) {
    queryFilter._id = { $ne: excludeEventId };
  }

  const venueEvents = await Event.find(queryFilter).select('title startDate endDate startTime endTime venue status');

  const venueOverlaps = venueEvents.filter(e => {
    const eStart = combineDateAndTime(e.startDate, e.startTime);
    const eEnd = combineDateAndTime(e.endDate || e.startDate, e.endTime || e.startTime);
    return startDateTime < eEnd && endDateTime > eStart;
  });

  if (venueOverlaps.length > 0) {
    conflicts.push({
      type: 'VENUE_CONFLICT',
      severity: 'high',
      message: `Venue "${venue}" already booked`,
      conflictingEvents: venueOverlaps.map(e => ({
        id: e._id,
        title: e.title,
        date: e.startDate,
        time: e.startTime,
        status: e.status
      }))
    });
  }

  const timeOverlapQuery = {
    status: { $in: ['APPROVED', 'PUBLISHED', 'SCHEDULED'] },
    _id: { $ne: excludeEventId || null },
    $or: [
      { startDate: { $lte: new Date(endDate || startDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  };

  const sameTimeEvents = await Event.find(timeOverlapQuery).select('title startDate startTime endDate endTime status category');

  if (sameTimeEvents.length > 0) {
    const excessiveCount = await Event.countDocuments({
      status: { $in: ['APPROVED', 'PUBLISHED', 'SCHEDULED'] },
      startDate: {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(startDate).setHours(23, 59, 59, 999))
      }
    });

    if (excessiveCount > 5) {
      conflicts.push({
        type: 'EXCESSIVE_EVENTS',
        severity: 'medium',
        message: `${excessiveCount} events already scheduled on this day - possible audience fatigue`,
        count: excessiveCount
      });
    }
  }

  const duplicateQuery = {
    _id: { $ne: excludeEventId || null },
    status: { $in: ['APPROVED', 'PUBLISHED', 'SCHEDULED', 'PENDING_REVIEW'] },
    title: { $regex: `^${escapeRegex(title?.substring(0, 30) || '')}`, $options: 'i' },
    startDate: {
      $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(startDate).setHours(23, 59, 59, 999))
    }
  };

  const duplicateEvents = await Event.find(duplicateQuery).select('title startDate startTime venue status');

  if (duplicateEvents.length > 0) {
    conflicts.push({
      type: 'DUPLICATE_EVENT',
      severity: 'low',
      message: 'Similar event already exists on this date',
      conflictingEvents: duplicateEvents.map(e => ({
        id: e._id,
        title: e.title,
        date: e.startDate,
        time: e.startTime,
        status: e.status
      }))
    });
  }

  if (targetAudience && targetAudience.length > 0 && !targetAudience.includes('whole_university')) {
    const specificEventsCount = await Event.countDocuments({
      status: { $in: ['APPROVED', 'PUBLISHED', 'SCHEDULED'] },
      targetAudience: { $in: targetAudience },
      startDate: {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(startDate).setHours(23, 59, 59, 999))
      },
      _id: { $ne: excludeEventId || null }
    });

    if (specificEventsCount > 3) {
      conflicts.push({
        type: 'AUDIENCE_OVERLAP',
        severity: 'low',
        message: `Target audience already has ${specificEventsCount} events on this date`,
        count: specificEventsCount
      });
    }
  }

  return conflicts;
}

function combineDateAndTime(date, time) {
  const d = new Date(date);
  if (time) {
    const parts = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (parts) {
      let h = parseInt(parts[1], 10);
      const m = parseInt(parts[2], 10);
      if (parts[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
      if (parts[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
    } else {
      const [h, m] = time.split(':').map(Number);
      d.setHours(h || 0, m || 0, 0, 0);
    }
  }
  return d;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
