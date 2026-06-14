import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Technical Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      </div>

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-4xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Left: Visual */}
            <div className="relative order-2 lg:order-1 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                {/* Abstract Glitch Frame */}
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    x: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-[40px] border-2 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                />
                
                <div className="absolute inset-4 rounded-[32px] bg-card/40 backdrop-blur-3xl border border-white/5 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                   <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="mb-6 p-4 rounded-2xl bg-red-500/10 text-red-500"
                   >
                     <Search size={48} strokeWidth={1.5} />
                   </motion.div>
                   
                   <div className="space-y-2">
                     <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-red-500/50"
                       />
                     </div>
                     <div className="h-1.5 w-24 bg-white/5 rounded-full mx-auto" />
                   </div>

                   {/* Background technical text */}
                   <div className="absolute bottom-4 left-4 right-4 opacity-[0.05] text-[10px] font-mono text-left leading-tight pointer-events-none select-none">
                     GET /unmapped_node HTTP/1.1<br/>
                     Host: campus.network<br/>
                     Error: NODE_NOT_FOUND<br/>
                     Ref: 0x88404AF
                   </div>
                </div>

                {/* Decorative dots/markers */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/30" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/30" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="text-center lg:text-left order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.9]">
                  404.<br/>
                  <span className="text-muted-foreground font-light italic">Not Found.</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                  We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl font-bold transition-all hover:opacity-90 shadow-xl shadow-black/5"
                >
                  <Home size={20} />
                  Go Home
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all"
                >
                  <ArrowLeft size={20} />
                  Go Back
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
