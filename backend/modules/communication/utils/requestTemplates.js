export const REQUEST_TEMPLATES = {
  missing_marks: {
    name: 'Missing Marks Report',
    description: 'Report missing or incorrect examination marks',
    targetOfficeCode: 'EXM-OFF',
    targetRole: 'lecturer',
    approvalRequired: true,
    approvalRole: 'hod',
    autoResponse: {
      enabled: true,
      subject: 'Missing Marks Report Received',
      message: 'Your marks inquiry has been forwarded to the relevant department for review.'
    },
    formFields: [
      { fieldId: 'course_code', label: 'Course Code', type: 'text', required: true },
      { fieldId: 'course_name', label: 'Course Name', type: 'text', required: true },
      { fieldId: 'academic_year', label: 'Academic Year', type: 'text', required: true },
      { fieldId: 'semester', label: 'Semester', type: 'select', required: true,
        options: [{ label: 'Semester 1', value: 'S1' }, { label: 'Semester 2', value: 'S2' }] },
      { fieldId: 'expected_marks', label: 'Expected Marks', type: 'number', required: true },
      { fieldId: 'current_marks', label: 'Marks Currently Showing', type: 'number', required: true },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'evidence', label: 'Supporting Evidence', type: 'file' }
    ]
  },
  hostel_issue: {
    name: 'Hostel Issue Report',
    description: 'Report maintenance, billing, or accommodation issues',
    targetOfficeCode: 'ACC-OFF',
    formFields: [
      { fieldId: 'hostel_name', label: 'Hostel Name', type: 'text', required: true },
      { fieldId: 'room_number', label: 'Room Number', type: 'text', required: true },
      { fieldId: 'issue_category', label: 'Issue Category', type: 'select', required: true,
        options: [
          { label: 'Maintenance', value: 'maintenance' },
          { label: 'Electrical', value: 'electrical' },
          { label: 'Plumbing', value: 'plumbing' },
          { label: 'Billing', value: 'billing' },
          { label: 'Security', value: 'security' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'urgency', label: 'Urgency', type: 'radio', required: true,
        options: [
          { label: 'Emergency (immediate danger)', value: 'emergency' },
          { label: 'Urgent (within 24hrs)', value: 'urgent' },
          { label: 'Normal (within a week)', value: 'normal' }
        ] },
      { fieldId: 'photos', label: 'Photos', type: 'file' }
    ]
  },
  technical_support: {
    name: 'IT Support Request',
    description: 'Report technical issues with campus systems',
    targetOfficeCode: 'ICT-DSK',
    formFields: [
      { fieldId: 'issue_type', label: 'Issue Type', type: 'select', required: true,
        options: [
          { label: 'Network/Internet', value: 'network' },
          { label: 'Portal Login', value: 'login' },
          { label: 'Email', value: 'email' },
          { label: 'Learning Management System', value: 'lms' },
          { label: 'Hardware', value: 'hardware' },
          { label: 'Software', value: 'software' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'steps_to_reproduce', label: 'Steps to Reproduce', type: 'textarea' },
      { fieldId: 'screenshot', label: 'Screenshot/Error Message', type: 'file' },
      { fieldId: 'device_info', label: 'Device Information', type: 'text', placeholder: 'e.g., Laptop model, OS version' }
    ]
  },
  clearance: {
    name: 'Clearance Request',
    description: 'Request departmental/school clearance',
    targetOfficeCode: 'REG-OFF',
    approvalRequired: true,
    approvalRole: 'hod',
    formFields: [
      { fieldId: 'reason', label: 'Reason for Clearance', type: 'select', required: true,
        options: [
          { label: 'Graduation', value: 'graduation' },
          { label: 'Transfer', value: 'transfer' },
          { label: 'Withdrawal', value: 'withdrawal' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'academic_year', label: 'Academic Year', type: 'text', required: true },
      { fieldId: 'details', label: 'Additional Details', type: 'textarea' }
    ]
  },
  recommendation_letter: {
    name: 'Recommendation Letter Request',
    description: 'Request a recommendation letter from a lecturer or HOD',
    targetRole: 'lecturer',
    approvalRequired: false,
    formFields: [
      { fieldId: 'purpose', label: 'Purpose', type: 'select', required: true,
        options: [
          { label: 'Further Studies', value: 'further_studies' },
          { label: 'Internship', value: 'internship' },
          { label: 'Job Application', value: 'job' },
          { label: 'Scholarship', value: 'scholarship' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'institution_name', label: 'Institution/Organization Name', type: 'text',
        helpText: 'Name of the university or company requesting the letter' },
      { fieldId: 'deadline', label: 'Deadline', type: 'date', required: true },
      { fieldId: 'extra_info', label: 'Additional Information', type: 'textarea',
        helpText: 'Any specific points the letter should address' },
      { fieldId: 'transcripts', label: 'Academic Transcripts (optional)', type: 'file' }
    ]
  },
  course_registration: {
    name: 'Course Registration Issue',
    description: 'Report problems with course registration',
    targetOfficeCode: 'REG-OFF',
    formFields: [
      { fieldId: 'issue_type', label: 'Issue Type', type: 'select', required: true,
        options: [
          { label: 'Cannot register for course', value: 'cannot_register' },
          { label: 'Prerequisite issue', value: 'prerequisite' },
          { label: 'Time conflict', value: 'conflict' },
          { label: 'Course full', value: 'full' },
          { label: 'Wrong course assigned', value: 'wrong_course' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'course_codes', label: 'Course Code(s)', type: 'text', required: true,
        placeholder: 'e.g., CS401, CS402' },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'screenshot', label: 'Screenshot', type: 'file' }
    ]
  },
  transcript_request: {
    name: 'Transcript Request',
    description: 'Request official academic transcripts',
    targetOfficeCode: 'REG-OFF',
    approvalRequired: true,
    approvalRole: 'dean',
    formFields: [
      { fieldId: 'purpose', label: 'Purpose', type: 'select', required: true,
        options: [
          { label: 'Further Studies', value: 'further_studies' },
          { label: 'Employment', value: 'employment' },
          { label: 'Personal Records', value: 'personal' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'copies', label: 'Number of Copies', type: 'number', required: true },
      { fieldId: 'delivery_method', label: 'Delivery Method', type: 'radio', required: true,
        options: [
          { label: 'E-Transcript (email)', value: 'email' },
          { label: 'Physical Copy', value: 'physical' }
        ] },
      { fieldId: 'delivery_address', label: 'Delivery Address (if physical)', type: 'textarea' },
      { fieldId: 'payment_proof', label: 'Payment Proof', type: 'file' }
    ]
  }
};

export const getTemplate = (requestType) => REQUEST_TEMPLATES[requestType] || null;
