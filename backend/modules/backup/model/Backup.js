import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['database', 'media', 'full_system', 'settings'],
    default: 'database'
  },
  fileName: String,
  filePath: String,
  size: {
    type: String,
    default: '0 KB'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'completed'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  },
  notes: String
}, {
  timestamps: true
});

const Backup = mongoose.model('Backup', backupSchema);

export default Backup;