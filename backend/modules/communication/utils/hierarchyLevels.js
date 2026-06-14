export const HIERARCHY_LEVELS = {
  student: 1,
  class_rep: 2,
  lecturer: 3,
  hod: 4,
  dean: 5,
  principal: 6,
  admin: 7
};

export const COMMUNICATION_DIRECTION = {
  student: {
    student:      { requires: 'class_membership',    mode: 'direct' },
    lecturer:     { requires: null,  mode: 'direct' },
    class_rep:    { requires: 'class_membership',    mode: 'direct' },
    hod:          { requires: 'escalation',          mode: 'escalation_only' },
    dean:         { requires: 'escalation',          mode: 'escalation_only' },
    principal:    { requires: 'escalation',          mode: 'escalation_only' },
    admin:        { requires: 'admin_override',      mode: 'ticket_only' },
    office:       { requires: 'office_assignment',   mode: 'ticket_only' }
  },
  class_rep: {
    student:      { requires: 'class_membership',    mode: 'direct' },
    lecturer:     { requires: 'course_enrollment',   mode: 'direct' },
    hod:          { requires: 'department',          mode: 'request_only' },
    dean:         { requires: 'escalation',          mode: 'escalation_only' },
    office:       { requires: 'office_assignment',   mode: 'ticket_only' }
  },
  lecturer: {
    student:      { requires: null,   mode: 'direct' },
    class_rep:    { requires: 'course_enrollment',   mode: 'direct' },
    hod:          { requires: 'department',          mode: 'direct' },
    dean:         { requires: 'school',             mode: 'direct' },
    principal:    { requires: 'escalation',          mode: 'escalation_only' },
    admin:        { requires: 'admin_override',      mode: 'direct' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  hod: {
    lecturer:     { requires: 'department',          mode: 'direct' },
    student:      { requires: 'escalation',          mode: 'escalation_only' },
    class_rep:    { requires: 'department',          mode: 'request_only' },
    dean:         { requires: 'school',             mode: 'direct' },
    principal:    { requires: 'escalation',          mode: 'escalation_only' },
    admin:        { requires: 'admin_override',      mode: 'direct' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  dean: {
    hod:          { requires: 'school',             mode: 'direct' },
    lecturer:     { requires: 'school',             mode: 'direct' },
    principal:    { requires: 'college',            mode: 'direct' },
    student:      { requires: 'escalation',          mode: 'escalation_only' },
    admin:        { requires: 'admin_override',      mode: 'direct' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  principal: {
    dean:         { requires: 'college',            mode: 'direct' },
    hod:          { requires: 'college',            mode: 'direct' },
    admin:        { requires: 'system',             mode: 'direct' },
    student:      { requires: 'escalation',          mode: 'escalation_only' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  admin: {
    student:      { requires: null,                  mode: 'direct' },
    lecturer:     { requires: null,                  mode: 'direct' },
    hod:          { requires: null,                  mode: 'direct' },
    dean:         { requires: null,                  mode: 'direct' },
    principal:    { requires: null,                  mode: 'direct' },
    office:       { requires: null,                  mode: 'direct' }
  }
};
