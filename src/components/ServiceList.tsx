import { motion } from "motion/react";

const services = [
  { name: "Tapers", price: "$30" },
  { name: "Fades", price: "$30" },
  { name: "Designs", price: "+$5" },
  { name: "Beards", price: "+$15" },
  { name: "Goatee", price: "+$10" },
  { name: "Moustache", price: "+$5" },
  { name: "Eyebrows", price: "+$10" },
  { name: "Hair Slits", price: "+$5" },
];

export default function ServiceList() {
  return (
    <section id="services" className="py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">SERVICES</h2>
            <div className="h-1 w-24 bg-red-600" />
          </div>
          <p className="text-gray-400 max-w-md text-lg">
            Premium grooming services tailored to your style. Every cut is a masterpiece of precision and detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-black p-10 group hover:bg-zinc-900 transition-colors duration-500"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                {service.name}
              </h3>
              <p className="text-3xl font-black text-red-600">{service.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
