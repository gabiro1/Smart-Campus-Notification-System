import Class from "../../class/model/Class.js";
import Course from "../../course/model/Course.js";
import Announcement from "../../announcement/model/Announcement.js";
import Event from "../../event/model/Event.js";
import Ticket from "../model/Ticket.js";

export const resolveContext = async (sourceType, sourceId, user) => {
  switch (sourceType) {
    case "course": {
      const course = await Course.findById(sourceId).populate("lecturer");
      if (!course) return null;
      const cls = await Class.findById(course.class);
      const students = cls?.students || [];
      return {
        threadType: "course_discussion",
        category: "academic",
        context: {
          type: "course",
          id: course._id,
          name: `${course.code} - ${course.name}`,
          url: `/courses/${course._id}`
        },
        participantIds: [
          ...students.map(s => s.toString()),
          ...(course.lecturer ? [course.lecturer._id.toString()] : [])
        ]
      };
    }

    case "announcement": {
      const announcement = await Announcement.findById(sourceId);
      if (!announcement) return null;
      return {
        threadType: "announcement_reply",
        category: "academic",
        context: {
          type: "announcement",
          id: announcement._id,
          name: announcement.title,
          url: `/announcements/${announcement._id}`
        },
        participantIds: [announcement.lecturer?.toString(), user._id.toString()]
      };
    }

    case "event": {
      const event = await Event.findById(sourceId);
      if (!event) return null;
      return {
        threadType: "contextual",
        category: event.isEmergency ? "emergency" : "social",
        context: {
          type: "event",
          id: event._id,
          name: event.title,
          url: `/events/${event._id}`
        },
        participantIds: [event.createdBy?.toString(), user._id.toString()]
      };
    }

    case "ticket": {
      const ticket = await Ticket.findById(sourceId);
      if (!ticket) return null;
      return {
        threadType: "office_ticket",
        category: "support",
        context: {
          type: "ticket",
          id: ticket._id,
          name: ticket.subject,
          url: `/communication/tickets/${ticket._id}`
        },
        office: ticket.office,
        participantIds: [
          ticket.submittedBy?.toString(),
          ticket.assignedTo?.toString()
        ].filter(Boolean)
      };
    }

    default:
      return {
        threadType: "direct",
        category: "general",
        context: { type: "general" },
        participantIds: []
      };
  }
};
