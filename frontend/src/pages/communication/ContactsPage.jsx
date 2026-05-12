import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, GraduationCap, Building2, LifeBuoy, MessageSquare, ChevronRight } from 'lucide-react';
import communicationService from '../../services/communication/communicationService';

const ROLE_ICONS = {
  lecturer: { icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  hod: { icon: Building2, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  dean: { icon: Building2, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  principal: { icon: Building2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  admin: { icon: Building2, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' },
  class_rep: { icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  office_staff: { icon: LifeBuoy, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

function getRoleConfig(role) {
  return ROLE_ICONS[role] || { icon: Users, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' };
}

function getRelationshipLabel(type) {
  const labels = {
    course_lecturer: 'Course Lecturer',
    course_student: 'Student',
    classmate: 'Classmate',
    department_member: 'Department Colleague',
    class_rep: 'Class Representative',
    hod: 'Head of Department',
    dean: 'Dean',
    principal: 'Principal',
    office_staff: 'Office Staff',
    admin: 'Administrator',
    guild_representative: 'Guild Representative',
  };
  return labels[type] || type?.replace(/_/g, ' ');
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await communicationService.getContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const relationshipTypes = ['all', ...new Set(contacts.map(c => c.relationshipType))];

  const filtered = contacts.filter(c => {
    const matchSearch = !search || 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      getRelationshipLabel(c.relationshipType)?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.relationshipType === typeFilter;
    return matchSearch && matchType;
  });

  const grouped = filtered.reduce((acc, c) => {
    const key = getRelationshipLabel(c.relationshipType);
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const handleMessage = (contact) => {
    navigate(`/student/communication/inbox`, { state: { newChat: { contact } } });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Users size={20} className="text-primary" />
          <h1 className="text-lg font-semibold text-foreground">My Contacts</h1>
          <span className="text-xs text-muted-foreground">{contacts.length} contacts</span>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or relationship..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex gap-1 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto">
        {relationshipTypes.slice(0, 6).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              typeFilter === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {type === 'all' ? 'All' : getRelationshipLabel(type)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Users size={40} className="mb-2 opacity-40" />
            <p className="text-sm">No contacts found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([groupName, groupContacts]) => (
            <div key={groupName}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
                {groupName}
              </div>
              {groupContacts.map((contact, idx) => {
                const config = getRoleConfig(contact.role);
                const Icon = config.icon;
                return (
                  <div
                    key={`${contact._id}-${idx}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} shrink-0`}>
                      {contact.profilePicture ? (
                        <img src={contact.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Icon size={18} className={config.color} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{contact.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{contact.role?.replace(/_/g, ' ')}</p>
                      {contact.contextName && (
                        <p className="text-xs text-muted-foreground/70">{contact.contextName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleMessage(contact)}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                      title="Send message"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
