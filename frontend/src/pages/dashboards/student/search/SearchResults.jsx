/**
 * @page SearchResults
 * @description Global search results for announcements, files, and departments.
 */
import { Search, FileText, Calendar } from "lucide-react";

export default function SearchResults() {
  const results = [
    {
      id: 1,
      title: "Final Exam Schedule",
      type: "Document",
      date: "Feb 10",
      match: "Matches 'Exam'",
    },
    {
      id: 2,
      title: "IT Dept: Exam Venue Change",
      type: "Alert",
      date: "Feb 12",
      match: "Matches 'Exam'",
    },
  ];

  return (
    <div className="pt-24 px-6 pb-20 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4 glass p-4 rounded-2xl border border-white/10">
        <Search className="text-neutral-500" size={20} />
        <input
          className="bg-transparent w-full outline-none text-white"
          defaultValue="Exam"
        />
      </div>

      <div className="space-y-4">
        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
          Found {results.length} Results
        </p>

        {results.map((item) => (
          <div
            key={item.id}
            className="glass p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 rounded-2xl text-neutral-400 group-hover:text-blue-500 transition-colors">
                  {item.type === "Document" ? (
                    <FileText size={20} />
                  ) : (
                    <Calendar size={20} />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-bold">{item.title}</h4>
                  <p className="text-xs text-blue-400 mt-1 italic">
                    {item.match}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-neutral-600 font-bold">
                {item.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
