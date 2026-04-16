import { motion } from "framer-motion";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-6 pt-32 pb-20"
      >
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
          Our Story
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
          About <span className="text-primary">UniNotify AI</span>
        </h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            UniNotify AI was born from a simple observation: university
            communication is often inefficient. Important events are lost in
            crowded social media groups or missed due to lack of data bundles.
          </p>
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-foreground font-bold mb-2">The Mission</h3>
            <p>
              To eliminate the "Broken Telephone" effect using targeted metadata
              and machine learning recommendations.
            </p>
          </div>
          <p>
            Developed by <strong className="text-foreground">GABIRO Jovial Fleuron</strong> as a Final Year
            Project at the University of Rwanda, School of ICT.
          </p>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
