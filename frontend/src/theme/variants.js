export const buttonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
  emergencyPulse: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5 },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export const countUp = (to) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
});

export const cardHover = {
  rest: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: {
    y: -2,
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};