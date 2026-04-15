import { motion } from "motion/react";

export default function MainHero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.15),transparent_70%)]" />
      
      <div className="relative z-10 text-center px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4"
        >
          JRBLXNDZ
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-red-600 font-medium tracking-[0.3em] uppercase mb-12"
        >
          Toronto • Precision • Detail
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black px-10 py-4 text-lg font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Book Appointment
        </motion.button>
      </div>
      
      {/* Decorative vertical lines */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-white/5 hidden lg:block" />
      <div className="absolute right-10 top-0 bottom-0 w-px bg-white/5 hidden lg:block" />
    </section>
  );
}
