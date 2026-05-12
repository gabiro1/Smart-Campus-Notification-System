import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  Inbox, Building2, Users, AlertTriangle, Bot,
  Archive, FileText, ChevronLeft, ChevronRight,
  MessageSquare, TicketCheck
} from 'lucide-react';
import communicationService from '../../services/communication/communicationService';

const SIDEBAR_ITEMS = [
  { icon: Inbox, label: 'Inbox', path: '/student/communication/inbox', countKey: 'total' },
  { icon: FileText, label: 'Requests', path: '/student/communication/requests', countKey: 'requests' },
  { icon: Building2, label: 'Offices', path: '/student/communication/offices' },
  { icon: Users, label: 'Contacts', path: '/student/communication/contacts' },
  { icon: AlertTriangle, label: 'Escalations', path: '/student/communication/escalations', countKey: 'escalations' },
  { icon: Bot, label: 'AI Assistant', path: '/student/communication/ai' },
  { icon: Archive, label: 'Archived', path: '/student/communication/archived' },
];

export default function CommunicationHub() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadSummary, setUnreadSummary] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/student/communication' || location.pathname === '/student/communication/') {
      navigate('/student/communication/inbox');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const summary = await communicationService.getUnreadSummary();
        setUnreadSummary(summary);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCount = (item) => {
    if (!unreadSummary || !item.countKey) return null;
    if (item.countKey === 'total') return unreadSummary.total > 0 ? unreadSummary.total : null;
    return unreadSummary[item.countKey] > 0 ? unreadSummary[item.countKey] : null;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <aside className={`${collapsed ? 'w-16' : 'w-64'} border-r border-border bg-card flex flex-col transition-all duration-200 shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && <h2 className="text-lg font-semibold text-foreground">Communication</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const count = getCount(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon size={collapsed ? 20 : 18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {count !== null && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <button
              onClick={() => navigate('/student/communication/inbox')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <MessageSquare size={16} />
              <span>View all messages</span>
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
