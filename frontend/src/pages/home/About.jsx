// import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-white max-w-2xl mx-auto pb-32">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-6">About UniNotify AI</h1>
        <div className="space-y-6 text-neutral-400 leading-relaxed">
          <p>
            UniNotify AI was born from a simple observation: university
            communication is often inefficient. Important events are lost in
            crowded social media groups or missed due to lack of data bundles.
          </p>
          <div className="glass p-6 rounded-3xl border border-white/5 bg-blue-600/5">
            <h3 className="text-white font-bold mb-2">The Mission</h3>
            <p>
              To eliminate the "Broken Telephone" effect using targeted metadata
              and machine learning recommendations.
            </p>
          </div>
          <p>
            Developed by <strong>GABIRO Jovial Fleuron</strong> as a Final Year
            Project at the University of Rwanda, School of ICT.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
