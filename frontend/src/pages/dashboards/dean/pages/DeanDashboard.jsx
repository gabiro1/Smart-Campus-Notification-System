import Navbar from "../../../../layouts/Navbar"; 
import Footer from "../../../../layouts/Footer"; 
// import ApprovalQueue from "../../shared/ApprovalQueue";

export default function DeanDashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-8 pt-32 max-w-6xl mx-auto w-full space-y-12">
        <header>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 tracking-widest mb-1 uppercase font-bold">
            <span>Faculty</span>
            <span>/</span>
            <span className="text-blue-500">School Dean Console</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Academic Oversight
          </h1>
          <p className="text-neutral-500 font-medium mt-2">
            Manage departmental pulses and ensure school-wide coordination.
          </p>
        </header>

        {/* The Review Engine we just built */}
        <section>
          <ApprovalQueue />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-[40px] border border-white/5">
            <h4 className="font-bold text-lg mb-2">School Statistics</h4>
            <p className="text-neutral-500 text-sm italic">
              Coming soon: Live analytics for your specific school.
            </p>
          </div>
          <div className="glass p-8 rounded-[40px] border border-white/5">
            <h4 className="font-bold text-lg mb-2">Departmental Health</h4>
            <p className="text-neutral-500 text-sm italic">
              Coming soon: Engagement tracking per department.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
