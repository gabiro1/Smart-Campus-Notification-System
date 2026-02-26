export default function Profile() {
  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-xl glass p-8 rounded-[40px] border border-white/5">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full mb-4 p-1">
            <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
          </div>
          <h2 className="text-2xl font-bold">GABIRO Jovial</h2>
          <p className="text-neutral-500">Student of Information Technology</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
              University Placement
            </label>
            <div className="flex gap-2">
              <span className="bg-white/5 px-4 py-2 rounded-xl text-sm">
                School of ICT
              </span>
              <span className="bg-white/5 px-4 py-2 rounded-xl text-sm">
                Level 4
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
              AI Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {["#AI", "#Cybersecurity", "#IT"].map((tag) => (
                <span
                  key={tag}
                  className="border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
