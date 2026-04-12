import { motion } from "motion/react";
import { Clock, AlertCircle, Footprints, CreditCard } from "lucide-react";

const policies = [
  {
    icon: Clock,
    text: "5-minute grace period; after that, a $10 late fee applies",
  },
  {
    icon: AlertCircle,
    text: "No-shows or cancellations without 3 hours notice will result in refusal of future bookings",
  },
  {
    icon: Footprints,
    text: "Clients must remove shoes upon entering the space",
  },
  {
    icon: CreditCard,
    text: "Payments accepted via e-transfer, but cash is preferred",
  },
];

export default function PolicySection() {
  return (
    <section id="policies" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">POLICIES</h2>
          <div className="h-1 w-24 bg-red-600 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {policies.map((policy, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-6 p-8 bg-zinc-950 border border-white/5 hover:border-red-600/30 transition-colors"
            >
              <div className="p-3 bg-red-600/10 rounded-full">
                <policy.icon className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                {policy.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
