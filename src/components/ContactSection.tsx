import { motion } from "motion/react";
import { Phone, Mail, Instagram, Scissors } from "lucide-react";

export default function ContactSection() {
  return (
    <footer id="contact" className="py-20 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Scissors className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-black tracking-tighter text-white">JRBLXNDZ</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Elevating the standard of grooming through precision and dedication.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Contact</h4>
            <div className="space-y-4">
              <a href="tel:+16477834264" className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors">
                <Phone className="w-5 h-5" />
                <span>647 783 4264</span>
              </a>
              <a href="mailto:jrblxndz@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors">
                <Mail className="w-5 h-5" />
                <span>jrblxndz@gmail.com</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Social</h4>
            <a 
              href="https://instagram.com/jrblxndz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span>@jrblxndz</span>
            </a>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} JRBLXNDZ. All rights reserved.
          </p>
          <div className="flex gap-8 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
