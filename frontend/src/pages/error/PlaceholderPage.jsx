import { motion } from "framer-motion";
import { ArrowLeft, Home, Zap, ShieldCheck, Cpu, Database, Network } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import Logo from "../../components/ui/Logo";

export default function PlaceholderPage({ title = "Section" }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-3xl w-full flex flex-col items-center">
          
          {/* Abstract Tech Visual */}
          <div className="relative w-64 h-64 mb-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-blue-500/10 border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-purple-500/10 border-dashed"
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-20"
              >
                <div className="bg-card/50 backdrop-blur-2xl p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Logo size="lg" />
                </div>
              </motion.div>

              {/* Orbital Nodes */}
              {[
                { Icon: Database, color: "text-blue-500", delay: 0 },
                { Icon: ShieldCheck, color: "text-purple-500", delay: 1.5 },
                { Icon: Cpu, color: "text-emerald-500", delay: 3 },
                { Icon: Network, color: "text-amber-500", delay: 4.5 },
              ].map((node, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: 360,
                    x: [Math.cos(i * 1.5) * 120, Math.cos(i * 1.5 + 6.28) * 120],
                    y: [Math.sin(i * 1.5) * 120, Math.sin(i * 1.5 + 6.28) * 120],
                  }}
                  transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
                  className="absolute"
                >
                  <div className={`p-2.5 bg-card/80 backdrop-blur-md rounded-xl border border-white/5 shadow-lg ${node.color}`}>
                    <node.Icon size={18} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clean Typography */}
          <div className="text-center space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Coming <span className="text-muted-foreground font-light">Soon.</span>
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed">
              We are currently setting up the <span className="text-foreground font-medium underline decoration-blue-500/30 decoration-2 underline-offset-4">{title}</span> section. It will be available in our next update!
            </p>
          </div>

          {/* Professional Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all text-sm"
            >
              <Home size={18} />
              Home
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground  rounded-xl font-bold hover:bg-accent transition-all text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
