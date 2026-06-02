import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: {
    canCreate: { type: Boolean, default: false },
    canApprove: { type: Boolean, default: false },
    dashboard: { type: String, default: 'read-only' },
    emergencyOverride: { type: Boolean, default: false }
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

roleSchema.index({ level: 1 });

const SYSTEM_ROLES = [
  { name: 'student', displayName: 'Student', level: 0, description: 'Regular student with read-only access', permissions: { canCreate: false, canApprove: false, dashboard: 'read-only' }, isSystem: true },
  { name: 'class_rep', displayName: 'Class Representative', level: 1, description: 'Class representative with limited read access', permissions: { canCreate: false, canApprove: false, dashboard: 'read-only' }, isSystem: true },
  { name: 'lecturer', displayName: 'Lecturer', level: 2, description: 'Can create announcements and academic content', permissions: { canCreate: true, canApprove: false, dashboard: 'academic' }, isSystem: true },
  { name: 'guild_president', displayName: 'Guild President', level: 3, description: 'Student guild leader with creation rights', permissions: { canCreate: true, canApprove: false, dashboard: 'guild' }, isSystem: true },
  { name: 'registrar', displayName: 'Registrar', level: 4, description: 'Registrar with academic record management', permissions: { canCreate: true, canApprove: false, dashboard: 'registrar' }, isSystem: true },
  { name: 'hod', displayName: 'Head of Department', level: 5, description: 'Department head with approval authority', permissions: { canCreate: true, canApprove: true, dashboard: 'hod' }, isSystem: true },
  { name: 'dean', displayName: 'Dean', level: 6, description: 'School dean with approval authority', permissions: { canCreate: true, canApprove: true, dashboard: 'dean' }, isSystem: true },
  { name: 'hr', displayName: 'HR', level: 7, description: 'Human resources management', permissions: { canCreate: true, canApprove: false, dashboard: 'hr' }, isSystem: true },
  { name: 'principal', displayName: 'Principal', level: 8, description: 'College principal with full academic authority', permissions: { canCreate: true, canApprove: true, dashboard: 'principal' }, isSystem: true },
  { name: 'admin', displayName: 'Administrator', level: 9, description: 'System administrator with full access', permissions: { canCreate: true, canApprove: true, dashboard: 'admin', emergencyOverride: true }, isSystem: true }
];

roleSchema.statics.seedSystemRoles = async function () {
  for (const roleData of SYSTEM_ROLES) {
    await this.findOneAndUpdate(
      { name: roleData.name },
      { $setOnInsert: roleData },
      { upsert: true, new: true }
    );
  }
};

roleSchema.statics.getSystemRolesData = function () {
  return SYSTEM_ROLES;
};

export default mongoose.model('Role', roleSchema);
