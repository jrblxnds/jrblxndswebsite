import { motion } from "motion/react";
import { Scissors } from "lucide-react";

export default function MainNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Scissors className="w-8 h-8 text-red-600" />
          <span className="text-2xl font-black tracking-tighter text-white">JRBLXNDZ</span>
        </motion.div>
        
        <div className="hidden md:flex items-center gap-8">
          {["Services", "Booking", "Policies", "About", "Contact"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              {item}
            </motion.a>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-600 text-white px-6 py-2 rounded-none font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Book Now
        </motion.button>
      </div>
    </nav>
  );
}
