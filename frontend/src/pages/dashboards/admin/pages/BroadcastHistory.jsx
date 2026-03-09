/**
 * @page BroadcastHistory
 * @description Archive of all sent communications with performance data.
 */
import { Search, Eye, BarChart2, Trash2 } from "lucide-react";

export default function BroadcastHistory() {
  const history = [
    {
      id: 1,
      title: "Exam Rescheduled",
      date: "Feb 12",
      reach: "98%",
      status: "Delivered",
    },
    {
      id: 2,
      title: "Guild Sports Gala",
      date: "Feb 10",
      reach: "85%",
      status: "Archived",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
          Broadcast History
        </h1>
        <p className="text-neutral-500 text-sm">
          Manage and track past communications.
        </p>
      </div>

      <div className="glass rounded-[32px] border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
            <tr>
              <th className="p-5">Announcement</th>
              <th className="p-5">Date</th>
              <th className="p-5">Read Rate</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-5">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <span className="text-[10px] text-blue-500 uppercase">
                    {item.status}
                  </span>
                </td>
                <td className="p-5 text-sm text-neutral-400">{item.date}</td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: item.reach }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white">
                      {item.reach}
                    </span>
                  </div>
                </td>
                <td className="p-5">
                  <button className="p-2 text-neutral-500 hover:text-white">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-neutral-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
