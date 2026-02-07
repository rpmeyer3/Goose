import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Scroll-triggered fade-in section (like your personal site)
export function FadeInSection({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered children animation
export function StaggerContainer({ children, className = "", stagger = 0.1 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Typewriter effect (like your hero text)
export function TypeWriter({ words, className = "" }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(current.substring(0, text.length + 1));
          if (text.length === current.length) {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          setText(current.substring(0, text.length - 1));
          if (text.length === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className={className}>
      {text}
      <span className="typewriter-cursor" />
    </span>
  );
}

// Floating magical particles
export function MagicParticles({ count = 20 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(212,168,67,0.8) 0%, transparent 70%)`,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated counter for numbers
export function AnimatedNumber({ value, duration = 1.5, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = 0;
    const end = value;
    const startTime = performance.now();

    function update(now) {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplay(end);
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(start + (end - start) * eased);
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      {suffix}
    </span>
  );
}

// Hover-tilt card effect
export function TiltCard({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.03,
        rotateX: -2,
        rotateY: 3,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

// Magical loading spinner
export function MagicSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="w-12 h-12 border-2 border-wizard-gold/30 border-t-wizard-gold rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="text-wizard-gold/60 font-serif italic text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        The enchantment is weaving...
      </motion.p>
    </div>
  );
}
