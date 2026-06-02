import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Department from '../modules/department/model/Department.js';
import School from '../modules/school/model/School.js';
import User from '../modules/user/model/User.js';

const backfillHodSchoolCollege = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const departments = await Department.find({ hod: { $ne: null } }).populate('hod');

  let updated = 0;
  let skipped = 0;

  for (const dept of departments) {
    const hodUser = dept.hod;
    if (!hodUser) { skipped++; continue; }

    const needsUpdate = !hodUser.school || !hodUser.college || !hodUser.department;
    if (!needsUpdate) { skipped++; continue; }

    const schoolDoc = await School.findById(dept.school).select('college').lean();
    if (!schoolDoc) { skipped++; continue; }

    hodUser.department = dept._id;
    hodUser.school = dept.school;
    hodUser.college = schoolDoc.college || null;
    hodUser.role = 'hod';
    await hodUser.save();
    updated++;

    console.log(`✓ ${hodUser.name}: dept=${dept._id}, school=${dept.school}, college=${schoolDoc.college}`);
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
  process.exit(0);
};

backfillHodSchoolCollege().catch(err => { console.error(err); process.exit(1); });
