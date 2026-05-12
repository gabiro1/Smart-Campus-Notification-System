import mongoose from "mongoose";

const requestTemplateSchema = new mongoose.Schema({
  requestType: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  targetOffice: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  targetRole: { type: String },
  formFields: [{
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: [
      'text', 'textarea', 'email', 'phone', 'number',
      'select', 'multiselect', 'checkbox', 'radio',
      'date', 'file', 'student_id', 'department', 'level'
    ], required: true },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    helpText: { type: String },
    options: [{
      label: { type: String },
      value: { type: String }
    }],
    validation: {
      minLength: { type: Number },
      maxLength: { type: Number },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String }
    },
    conditionalOn: {
      fieldId: { type: String },
      value: { type: mongoose.Schema.Types.Mixed }
    },
    order: { type: Number }
  }],
  approvalRequired: { type: Boolean, default: false },
  approvalRole: { type: String },
  autoResponse: {
    enabled: { type: Boolean, default: false },
    subject: { type: String },
    message: { type: String }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("RequestTemplate", requestTemplateSchema);
