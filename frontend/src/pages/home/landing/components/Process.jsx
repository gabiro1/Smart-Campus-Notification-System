const STEPS = [
  {
    num: "01",
    title: "Targeted Input",
    desc: "Admins select specific schools and levels. No more spam for irrelevant departments.",
  },
  {
    num: "02",
    title: "AI Ranking",
    desc: "Our engine scores events based on your interest profile and urgency.",
  },
  {
    num: "03",
    title: "Smart Delivery",
    desc: "Receive alerts via Push or SMS fallback if you're offline. Never miss a beat.",
  },
];

export function Process() {
  return (
    <section className="py-24 px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl text-white font-bold text-center mb-30">
          The Intelligence Behind the Alert
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {STEPS.map((step) => (
            <div key={step.num} className="relative group">
              <span className="text-8xl font-black text-white/5 absolute -top-10 -left-4 group-hover:text-blue-600/10 transition-colors">
                {step.num}
              </span>
              <h3 className="text-xl text-white font-bold mb-4 relative z-10">
                {step.title}
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
