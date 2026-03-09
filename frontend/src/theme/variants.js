/**
 * @variants ButtonVariants
 * @description Shared Framer Motion animations for a premium feel.
 */

export const buttonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    transition: { duration: 0.2 } 
  },
  tap: { 
    scale: 0.95 
  },
  // Specifically for the "Emergency" pulse effect
  emergencyPulse: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5 }
  }
};