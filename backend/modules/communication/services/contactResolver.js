import User from "../../user/model/User.js";
import Class from "../../class/model/Class.js";
import Department from "../../department/model/Department.js";
import School from "../../school/model/School.js";
import College from "../../college/model/College.js";
import Office from "../model/Office.js";
import OfficeStaff from "../model/OfficeStaff.js";
import ContactRelationship from "../model/ContactRelationship.js";

const CACHE_TTL_DAYS = 7;

export const resolveReachableContacts = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const cached = await ContactRelationship.find({ user: userId, isActive: true });
  const hasFreshCache = cached.length > 0 && cached.some(c => c.expiresAt && c.expiresAt > new Date());
  if (hasFreshCache) {
    const contactIds = cached.map(c => c.contact);
    const contactUsers = await User.find({ _id: { $in: contactIds } })
      .select("name role department profilePicture registrationNumber");
    const userMap = Object.fromEntries(contactUsers.map(u => [u._id.toString(), u]));
    return cached.map(c => ({
      _id: c.contact,
      relationshipType: c.relationshipType,
      contextSource: c.contextSource,
      contextId: c.contextId,
      contextName: c.contextName,
      priority: c.priority,
      ...(userMap[c.contact.toString()] ? {
        name: userMap[c.contact.toString()].name,
        role: userMap[c.contact.toString()].role,
        department: userMap[c.contact.toString()].department,
        profilePicture: userMap[c.contact.toString()].profilePicture
      } : {})
    })).filter(c => c.name);
  }

  let contacts = [];

  if (user.role === "student" || user.role === "class_rep") {
    const classes = await Class.find({ students: user.id }).populate("lecturers");
    for (const cls of classes) {
      for (const lecturer of cls.lecturers || []) {
        contacts.push({
          contact: lecturer._id,
          relationshipType: "course_lecturer",
          contextSource: "course",
          contextId: cls._id,
          contextName: cls.name,
          priority: 3
        });
      }
    }

    const myClass = classes[0];
    if (myClass) {
      const students = await User.find({ classId: myClass._id, _id: { $ne: user.id } });
      for (const s of students) {
        contacts.push({
          contact: s._id,
          relationshipType: "classmate",
          contextSource: "class",
          contextId: myClass._id,
          contextName: myClass.name,
          priority: 2
        });
      }
    }

    if (user.department) {
      const classReps = await User.find({
        role: "class_rep",
        representedDepartment: user.department,
        representedLevel: user.level
      });
      for (const rep of classReps) {
        contacts.push({
          contact: rep._id,
          relationshipType: "class_rep",
          contextSource: "class",
          contextId: user.classId,
          contextName: "Class Representative",
          priority: 4
        });
      }

      const dept = await Department.findById(user.department).populate("hod");
      if (dept?.hod) {
        contacts.push({
          contact: dept.hod._id,
          relationshipType: "hod",
          contextSource: "department",
          contextId: dept._id,
          contextName: dept.name,
          priority: 5
        });
      }
    }

    const accessibleOffices = await Office.find({
      $or: [
        ...(user.department ? [{ department: user.department }] : []),
        { type: { $in: ["technical", "financial", "student_affairs", "registrar", "accommodation"] } }
      ],
      isActive: true
    });
    const officeStaff = await OfficeStaff.find({
      office: { $in: accessibleOffices.map(o => o._id) },
      isActive: true
    }).populate("user");
    for (const os of officeStaff) {
      contacts.push({
        contact: os.user._id,
        relationshipType: "office_staff",
        contextSource: "office",
        contextId: os.office,
        contextName: "Office Staff",
        priority: 3
      });
    }
  }

  else if (user.role === "lecturer") {
    const classes = await Class.find({ lecturers: user.id }).populate("students");
    for (const cls of classes) {
      for (const student of cls.students || []) {
        contacts.push({
          contact: student._id,
          relationshipType: "course_student",
          contextSource: "course",
          contextId: cls._id,
          contextName: cls.name,
          priority: 3
        });
      }
    }

    if (user.department) {
      const dept = await Department.findById(user.department).populate("hod");
      if (dept?.hod) {
        contacts.push({
          contact: dept.hod._id,
          relationshipType: "hod",
          contextSource: "department",
          contextId: dept._id,
          contextName: dept.name,
          priority: 5
        });
      }
      const colleagues = await User.find({
        department: user.department,
        role: "lecturer",
        _id: { $ne: user.id }
      });
      for (const col of colleagues) {
        contacts.push({
          contact: col._id,
          relationshipType: "department_member",
          contextSource: "department",
          contextId: dept._id,
          contextName: dept.name,
          priority: 2
        });
      }

      const school = await School.findById(dept.school).populate("dean");
      if (school?.dean) {
        contacts.push({
          contact: school.dean._id,
          relationshipType: "dean",
          contextSource: "school",
          contextId: school._id,
          contextName: school.name,
          priority: 4
        });
      }
    }

    const offices = await Office.find({ isActive: true });
    const officeStaff = await OfficeStaff.find({
      office: { $in: offices.map(o => o._id) },
      isActive: true
    }).populate("user");
    for (const os of officeStaff) {
      contacts.push({
        contact: os.user._id,
        relationshipType: "office_staff",
        contextSource: "office",
        contextId: os.office,
        contextName: "Office Staff",
        priority: 3
      });
    }
  }

  else if (user.role === "hod") {
    const dept = await Department.findById(user.department);
    const deptUsers = await User.find({ department: user.department, _id: { $ne: user.id } });
    for (const u of deptUsers) {
      contacts.push({
        contact: u._id,
        relationshipType: u.role === "lecturer" ? "department_member" : "department_member",
        contextSource: "department",
        contextId: dept?._id,
        contextName: dept?.name,
        priority: 3
      });
    }
    if (dept) {
      const school = await School.findById(dept.school).populate("dean");
      if (school?.dean) {
        contacts.push({
          contact: school.dean._id,
          relationshipType: "dean",
          contextSource: "school",
          contextId: school._id,
          contextName: school.name,
          priority: 4
        });
      }
      const college = await College.findById(school?.college).populate("principal");
      if (college?.principal) {
        contacts.push({
          contact: college.principal._id,
          relationshipType: "principal",
          contextSource: "college",
          contextId: college._id,
          contextName: college.name,
          priority: 3
        });
      }
    }
    const offices = await Office.find({ isActive: true });
    const officeStaff = await OfficeStaff.find({
      office: { $in: offices.map(o => o._id) },
      isActive: true
    }).populate("user");
    for (const os of officeStaff) {
      contacts.push({
        contact: os.user._id,
        relationshipType: "office_staff",
        contextSource: "office",
        contextId: os.office,
        contextName: "Office Staff",
        priority: 2
      });
    }
  }

  else if (user.role === "dean") {
    const school = await School.findOne({ dean: user.id });
    if (school) {
      const depts = await Department.find({ school: school._id });
      const deptUsers = await User.find({
        department: { $in: depts.map(d => d._id) },
        role: { $in: ["hod", "lecturer"] },
        _id: { $ne: user.id }
      });
      for (const u of deptUsers) {
        contacts.push({
          contact: u._id,
          relationshipType: "department_member",
          contextSource: "school",
          contextId: school._id,
          contextName: school.name,
          priority: 3
        });
      }
      const college = await College.findById(school.college).populate("principal");
      if (college?.principal) {
        contacts.push({
          contact: college.principal._id,
          relationshipType: "principal",
          contextSource: "college",
          contextId: college._id,
          contextName: college.name,
          priority: 4
        });
      }
    }
  }

  else if (user.role === "principal") {
    const college = await College.findOne({ principal: user.id });
    if (college) {
      const schools = await School.find({ college: college._id });
      const depts = await Department.find({ school: { $in: schools.map(s => s._id) } });
      const users = await User.find({
        department: { $in: depts.map(d => d._id) },
        role: { $in: ["dean", "hod"] },
        _id: { $ne: user.id }
      });
      for (const u of users) {
        contacts.push({
          contact: u._id,
          relationshipType: "department_member",
          contextSource: "college",
          contextId: college._id,
          contextName: college.name,
          priority: 3
        });
      }
    }
  }

  else if (user.role === "admin") {
    const allUsers = await User.find({ _id: { $ne: user.id } }).select("_id role");
    for (const u of allUsers) {
      contacts.push({
        contact: u._id,
        relationshipType: "admin",
        contextSource: "general",
        priority: 1
      });
    }
  }

  const uniqueMap = new Map();
  for (const c of contacts) {
    const key = `${c.contact.toString()}-${c.relationshipType}`;
    if (!uniqueMap.has(key) || c.priority > uniqueMap.get(key).priority) {
      uniqueMap.set(key, c);
    }
  }
  const uniqueContacts = Array.from(uniqueMap.values());

  const bulkOps = uniqueContacts.map(c => ({
    updateOne: {
      filter: { user: userId, contact: c.contact, relationshipType: c.relationshipType },
      update: {
        $set: {
          ...c,
          expiresAt: new Date(Date.now() + CACHE_TTL_DAYS * 86400000)
        }
      },
      upsert: true
    }
  }));
  if (bulkOps.length > 0) {
    await ContactRelationship.bulkWrite(bulkOps);
  }

  const contactIds = uniqueContacts.map(c => c.contact);
  const contactUsers = await User.find({ _id: { $in: contactIds } })
    .select("name role department profilePicture registrationNumber");
  const userMap = Object.fromEntries(contactUsers.map(u => [u._id.toString(), u]));

  return uniqueContacts
    .map(c => ({
      _id: c.contact,
      relationshipType: c.relationshipType,
      contextSource: c.contextSource,
      contextId: c.contextId,
      contextName: c.contextName,
      priority: c.priority,
      ...(userMap[c.contact.toString()] ? {
        name: userMap[c.contact.toString()].name,
        role: userMap[c.contact.toString()].role,
        department: userMap[c.contact.toString()].department,
        profilePicture: userMap[c.contact.toString()].profilePicture
      } : {})
    }))
    .filter(c => c.name);
};

export const getReachableOffices = async (user) => {
  let query = { isActive: true };

  if (user.role === "student" || user.role === "class_rep") {
    query = {
      ...query,
      $or: [
        ...(user.department ? [{ department: user.department }] : []),
        { type: { $in: ["technical", "financial", "student_affairs", "registrar", "accommodation"] } }
      ]
    };
  } else if (user.role === "lecturer" || user.role === "hod") {
    query = { ...query };
  } else {
    query = { ...query };
  }

  return Office.find(query).sort({ type: 1, name: 1 });
};
