import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Mail, Phone, Search, Building2, GraduationCap, Shield, LifeBuoy } from "lucide-react";

const CONTACTS = [
  {
    id: 1, name: "Dr. Mutoni Claire", role: "Lecturer", department: "Computer Science",
    email: "c.mutoni@campus.rp", phone: "+250 788 123 456", type: "faculty",
    initials: "MC", availability: "Available",
  },
  {
    id: 2, name: "Dr. Habimana Eric", role: "Lecturer", department: "Information Technology",
    email: "e.habimana@campus.rp", phone: "+250 788 234 567", type: "faculty",
    initials: "HE", availability: "In class",
  },
  {
    id: 3, name: "Dr. Uwimana Diane", role: "Senior Lecturer", department: "Software Engineering",
    email: "d.uwimana@campus.rp", phone: "+250 788 345 678", type: "faculty",
    initials: "UD", availability: "Available",
  },
  {
    id: 4, name: "Registrar Office", role: "Administration", department: "Academic Affairs",
    email: "registrar@campus.rp", phone: "+250 788 456 789", type: "admin",
    initials: "RO", availability: "Open 8AM-5PM",
  },
  {
    id: 5, name: "Student Affairs", role: "Administration", department: "Student Services",
    email: "student.affairs@campus.rp", phone: "+250 788 567 890", type: "admin",
    initials: "SA", availability: "Open 8AM-5PM",
  },
  {
    id: 6, name: "Finance Office", role: "Administration", department: "Fees & Billing",
    email: "finance@campus.rp", phone: "+250 788 678 901", type: "admin",
    initials: "FO", availability: "Open 8AM-4PM",
  },
  {
    id: 7, name: "ICT Helpdesk", role: "Support", department: "IT Services",
    email: "helpdesk@campus.rp", phone: "+250 788 789 012", type: "support",
    initials: "IT", availability: "Available",
  },
  {
    id: 8, name: "Library Services", role: "Support", department: "Learning Resources",
    email: "library@campus.rp", phone: "+250 788 890 123", type: "support",
    initials: "LS", availability: "Open 7AM-10PM",
  },
];

const typeConfig = {
  faculty: { icon: GraduationCap, bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", label: "Faculty" },
  admin: { icon: Building2, bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", label: "Administration" },
  support: { icon: LifeBuoy, bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", label: "Support" },
};

export default function Contacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = CONTACTS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reach out to faculty, administration, and support staff
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, department, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/25"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "faculty", "admin", "support"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">No contacts found</p>
            </div>
          ) : (
            filtered.map((contact) => {
              const config = typeConfig[contact.type];
              const Icon = config.icon;
              return (
                <div
                  key={contact.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">
                    {contact.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-foreground">{contact.name}</h3>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${config.bg}`}>
                        <Icon size={10} className="inline mr-0.5" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.role} — {contact.department}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail size={11} /> {contact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={11} /> {contact.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-[11px] text-muted-foreground">{contact.availability}</span>
                    <button
                      onClick={() => navigate("/student/messages")}
                      className="p-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Send message"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
