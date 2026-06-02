import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Clock, Users, Ticket, ChevronRight } from 'lucide-react';
import communicationService from '../services/communicationService';

const OFFICE_TYPE_LABELS = {
  technical: 'Technical Support',
  financial: 'Financial Services',
  academic: 'Academic Services',
  administrative: 'Administration',
  student_affairs: 'Student Affairs',
  accommodation: 'Accommodation',
  registrar: 'Registrar',
  library: 'Library',
};

const OFFICE_COLORS = {
  technical: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  financial: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  academic: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  administrative: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  student_affairs: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  accommodation: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
  registrar: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  library: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
};

export default function OfficeDirectory() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [queueStatuses, setQueueStatuses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const data = await communicationService.getOffices();
        setOffices(data);
        data.forEach(async (office) => {
          try {
            const status = await communicationService.getQueueStatus(office._id);
            setQueueStatuses(prev => ({ ...prev, [office._id]: status }));
          } catch { /* ignore */ }
        });
      } catch (err) {
        console.error('Failed to load offices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffices();
  }, []);

  const filtered = offices.filter(o =>
    !search || o.name?.toLowerCase().includes(search.toLowerCase()) ||
    OFFICE_TYPE_LABELS[o.type]?.toLowerCase().includes(search.toLowerCase()) ||
    o.description?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, o) => {
    const key = OFFICE_TYPE_LABELS[o.type] || o.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={20} className="text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Campus Offices</h1>
          <span className="text-xs text-muted-foreground">{offices.length} offices</span>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search offices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Building2 size={40} className="mb-2 opacity-40" />
            <p className="text-sm">No offices found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([groupName, groupOffices]) => (
            <div key={groupName}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
                {groupName}
              </div>
              {groupOffices.map((office) => {
                const colors = OFFICE_COLORS[office.type] || { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-600 dark:text-gray-400' };
                const status = queueStatuses[office._id];
                return (
                  <div
                    key={office._id}
                    onClick={() => navigate(`/student/communication/offices/${office._id}`)}
                    className="flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} shrink-0`}>
                      <Building2 size={18} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">{office.name}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {office.code}
                        </span>
                      </div>
                      {office.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{office.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {status && (
                          <>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Ticket size={10} />
                              {status.openTickets} waiting
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock size={10} />
                              SLA: {office.slaHours}h
                            </span>
                          </>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Users size={10} />
                          Office
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground mt-2 shrink-0" />
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
