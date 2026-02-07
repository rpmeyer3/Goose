import { motion, AnimatePresence } from "framer-motion";

export default function LoadingOverlay({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-wizard/80 backdrop-blur-sm"
        >
          {/* Your PNG with a floating/scaling animation */}
          <motion.img
            src="/public/byteAbout.webp" // Try bytehacks11.png if it doesnt work
            alt="Loading..."
            className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(212,168,67,0.4)]"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 font-display text-xl text-wizard-gold tracking-widest animate-pulse"
          >
            CONSULTING THE GOBLINS...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}