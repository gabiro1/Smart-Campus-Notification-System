import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "Synchronizing dashboard data...",
  "Optimizing analytics engine...",
  "Preparing secure session...",
  "Loading personalized workspace...",
  "Calibrating notification channels...",
  "Indexing campus resources...",
  "Establishing secure gateway...",
  "Warming up AI modules...",
];

function Particle({ index, total }) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 90 + Math.sin(index * 1.5) * 20;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const size = 2 + Math.sin(index * 2.5) * 1.5;
  const delay = index * 0.15;
  const hue = 200 + index * 8;
  const orbitDuration = 4 + Math.sin(index) * 1.5;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${hue}, 100%, 70%)`,
        boxShadow: `0 0 ${size * 5}px hsl(${hue}, 100%, 70% / 0.7)`,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={{
        x,
        y,
        opacity: [0.4, 1, 0.4],
        scale: [1, 1.4, 1],
      }}
      transition={{
        x: {
          duration: orbitDuration,
          repeat: Infinity,
          ease: "linear",
          delay: delay % orbitDuration,
        },
        y: {
          duration: orbitDuration,
          repeat: Infinity,
          ease: "linear",
          delay: delay % orbitDuration,
        },
        opacity: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.3,
        },
        scale: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.2,
        },
      }}
    />
  );
}

function OrbitingParticles() {
  const total = 18;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <Particle key={i} index={i} total={total} />
      ))}
    </div>
  );
}

function CentralOrb() {
  const [morph, setMorph] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMorph((p) => (p + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const paths = [
    // Circle
    "M0,-40 C22,-40 40,-22 40,0 C40,22 22,40 0,40 C-22,40 -40,22 -40,0 C-40,-22 -22,-40 0,-40",
    // Hexagon
    "M0,-40 L34.6,-20 L34.6,20 L0,40 L-34.6,20 L-34.6,-20 Z",
    // Wave/blob form
    "M0,-40 C18,-38 36,-24 38,-8 C40,8 32,28 18,36 C4,44 -16,38 -28,24 C-40,10 -38,-12 -28,-26 C-18,-40 -12,-42 0,-40",
  ];

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(139,92,246,0.15)",
            "0 0 50px rgba(59,130,246,0.5), 0 0 100px rgba(139,92,246,0.3)",
            "0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(139,92,246,0.15)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="-50 -50 100 100" className="w-full h-full relative z-10">
        <motion.path
          d={paths[morph]}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: paths,
            stroke: [
              "rgba(59,130,246,0.9)",
              "rgba(139,92,246,0.9)",
              "rgba(6,182,212,0.9)",
            ],
          }}
          transition={{
            d: { duration: 2.5, ease: [0.34, 1.56, 0.64, 1] },
            stroke: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ filter: "url(#glow)" }}
        />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function ScanLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)",
        }}
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)",
        }}
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
      />
    </div>
  );
}

function GridBackground() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

function GlowCorners() {
  return (
    <>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-blue-600/8 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
    </>
  );
}

function LoadingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((p) => (p + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-sm text-muted-foreground tracking-wide"
        >
          {LOADING_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function ProgressDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: `hsl(${210 + i * 30}, 80%, 60%)` }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function NeuralFlowLoader({
  fullPage = true,
  message,
}) {
  const wrapperClass = fullPage
    ? "fixed inset-0 z-[100] flex items-center justify-center"
    : "flex items-center justify-center min-h-[400px] w-full";
  const bgStyle = { background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d24 50%, #0a0a1a 100%)" };

  return (
    <div className={wrapperClass} style={bgStyle}>
      <GridBackground />
      <GlowCorners />
      <ScanLines />

      <div className="relative flex flex-col items-center gap-8">
        {/* Glassmorphism panel */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <div className="relative p-12 flex flex-col items-center gap-8">
            <OrbitingParticles />
            <CentralOrb />
          </div>
        </div>

        {/* Message + Progress */}
        <div className="flex flex-col items-center gap-3">
          {message ? (
            <p className="text-sm text-muted-foreground tracking-wide">{message}</p>
          ) : (
            <LoadingMessage />
          )}
          <ProgressDots />
        </div>
      </div>
    </div>
  );
}
