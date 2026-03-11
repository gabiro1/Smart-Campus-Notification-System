import mongoose from 'mongoose';

// 1. College Schema (Top Level)
const collegeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    }
}, { timestamps: true });

// 2. School Schema (Middle Level)
const schoolSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    college: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'College', 
        required: true 
    }
}, { timestamps: true });

// 3. Department Schema (Bottom Level)
const departmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    school: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true 
    }
}, { timestamps: true });

// Export all three models from this single file
export const College = mongoose.model('College', collegeSchema);
export const School = mongoose.model('School', schoolSchema);
export const Department = mongoose.model('Department', departmentSchema);