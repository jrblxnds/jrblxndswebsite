import { motion } from "motion/react";

export default function AboutSection() {
  return (
    <section id="about" className="py-32 bg-zinc-950 relative overflow-hidden">
      <div className="absolute right-0 top-0 text-[20rem] font-black text-white/5 leading-none select-none pointer-events-none">
        JR
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">
              THE <span className="text-red-600">CRAFT</span>
            </h2>
            <div className="space-y-6 text-xl text-gray-400 leading-relaxed">
              <p>
                JRBLXNDS isn't just a haircut; it's a statement of excellence. 
                With a relentless focus on precision, detail, and consistency, 
                I provide a premium grooming experience for those who demand the best.
              </p>
              <p>
                Every client who sits in my chair receives my full attention and 
                expertise. Whether it's a sharp fade, a clean taper, or intricate 
                designs, the goal is always the same: perfection.
              </p>
              <p className="text-white font-bold italic">
                "Precision is my passion. Consistency is my promise."
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-square bg-zinc-900 border border-white/10 flex items-center justify-center relative group"
          >
            <div className="absolute inset-4 border border-red-600/20 group-hover:border-red-600/50 transition-colors duration-500" />
            <div className="text-center">
              <span className="text-8xl font-black text-white">JR</span>
              <div className="text-red-600 font-bold tracking-[0.5em] mt-4">BLXNDS</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
