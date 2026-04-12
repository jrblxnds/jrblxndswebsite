import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const services = [
  "tapers",
  "fades",
  "designs",
  "beards",
  "goatee",
  "moustache",
  "eyebrows",
  "slits"
];

export default function ServiceHighlights() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % services.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-black py-32 overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="text-red-600 font-black uppercase tracking-[0.5em] text-sm mb-8">
            Expertise in
          </span>
          <div className="relative h-[120px] md:h-[200px] flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.h2
                key={services[index]}
                initial={{ 
                  opacity: 0, 
                  scale: 0.8,
                  filter: "blur(20px)",
                  letterSpacing: "0.5em"
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  filter: "blur(0px)",
                  letterSpacing: "-0.05em"
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.2,
                  filter: "blur(20px)",
                  letterSpacing: "0.5em"
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.23, 1, 0.32, 1] 
                }}
                className="text-7xl md:text-[10rem] font-black text-white uppercase tracking-tighter absolute inset-0 flex items-center justify-center"
              >
                {services[index]}
              </motion.h2>
            </AnimatePresence>
          </div>
          <div className="mt-12 w-24 h-1 bg-red-600 mx-auto" />
        </div>
      </div>
    </section>
  );
}
