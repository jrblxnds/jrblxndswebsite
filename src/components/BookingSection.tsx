/**
 * Booking Section Component
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  format, 
  addDays, 
  startOfToday, 
  eachDayOfInterval, 
  isSameDay, 
} from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, User, Mail, Phone, ChevronLeft, CheckCircle2, Info } from "lucide-react";
import { cn } from "./theme-utils";
import { db } from "../firebase-config";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const SERVICES = [
  "Tapers",
  "Fades",
  "Designs",
  "Beards",
  "Goatee",
  "Moustache",
  "Eyebrows",
  "Hair Slits"
];

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const FIXED_ADDRESS = "4854 Bathurst Street, Room 410";

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: FIXED_ADDRESS,
    service: SERVICES[0],
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

  const days = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 14)
  });

  // Fetch blocked slots when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      try {
        // Fetch blocked slots for this date (includes both manual blocks and booked slots)
        const blockedQuery = query(
          collection(db, "blocked_slots"),
          where("date", "==", dateStr)
        );
        const blockedSnap = await getDocs(blockedQuery);
        const blocked = blockedSnap.docs.map(doc => doc.data().time);
        setBlockedSlots(blocked);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };

    fetchAvailability();
    setSelectedTime(null);
  }, [selectedDate]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const path = 'bookings';
      const bookingRef = await addDoc(collection(db, path), {
        ...formData,
        address: FIXED_ADDRESS, // Ensure fixed address
        date: selectedDate.toISOString(),
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Also create a blocked slot entry to prevent double booking
      await addDoc(collection(db, "blocked_slots"), {
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        bookingId: bookingRef.id,
        type: 'booking'
      });

      // Send notification email
      try {
        await fetch("/api/bookings/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            address: FIXED_ADDRESS,
            date: format(selectedDate, "PPP"),
            time: selectedTime
          })
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }

      setIsSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="booking" className="py-32 bg-zinc-950 flex items-center justify-center min-h-[600px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6"
        >
          <CheckCircle2 className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">BOOKING CONFIRMED</h2>
          <p className="text-gray-400 text-lg mb-8">
            Thank you, {formData.name}. Your appointment for {formData.service} on {format(selectedDate, "PPP")} at {selectedTime} has been received.
          </p>
          <button 
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setSelectedTime(null);
            }}
            className="bg-red-600 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            Book Another
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-32 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">BOOKING</h2>
          <div className="h-1 w-24 bg-red-600 mx-auto" />
          <p className="text-gray-500 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" /> Services only at: {FIXED_ADDRESS}
          </p>
        </div>

        <div className="bg-black border border-white/10 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-zinc-900 w-full relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-red-600"
              animate={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <CalendarIcon className="text-red-600" /> Select Date
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {days.map((day) => (
                        <button
                          key={day.toString()}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "p-4 text-center border transition-all duration-300",
                            isSameDay(day, selectedDate)
                              ? "bg-red-600 border-red-600 text-white"
                              : "bg-zinc-950 border-white/5 text-gray-400 hover:border-red-600/50"
                          )}
                        >
                          <div className="text-xs uppercase tracking-tighter mb-1">{format(day, "EEE")}</div>
                          <div className="text-lg font-black">{format(day, "d")}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Clock className="text-red-600" /> Select Time
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {TIME_SLOTS.map((time) => {
                        const isUnavailable = blockedSlots.includes(time);

                        return (
                          <button
                            key={time}
                            disabled={isUnavailable}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "py-3 text-center border transition-all duration-300 font-bold relative",
                              selectedTime === time
                                ? "bg-red-600 border-red-600 text-white"
                                : isUnavailable
                                ? "bg-zinc-900 border-white/5 text-zinc-700 cursor-not-allowed"
                                : "bg-zinc-950 border-white/5 text-gray-400 hover:border-red-600/50"
                            )}
                          >
                            {time}
                            {isUnavailable && (
                              <span className="absolute inset-0 flex items-center justify-center opacity-20">
                                <span className="w-full h-[1px] bg-white rotate-12" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button
                      disabled={!selectedTime}
                      onClick={handleNext}
                      className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <User className="text-red-600" /> Your Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-zinc-950 border border-white/10 p-4 pl-12 text-white focus:border-red-600 outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-zinc-950 border border-white/10 p-4 pl-12 text-white focus:border-red-600 outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-zinc-950 border border-white/10 p-4 pl-12 text-white focus:border-red-600 outline-none transition-colors"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Service Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                          type="text"
                          readOnly
                          value={FIXED_ADDRESS}
                          className="w-full bg-zinc-900 border border-white/10 p-4 pl-12 text-gray-500 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Type of Haircut</label>
                    <select
                      value={formData.service}
                      onChange={e => setFormData({...formData, service: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-red-600 outline-none transition-colors appearance-none"
                    >
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="pt-8 flex justify-between">
                    <button
                      onClick={handleBack}
                      className="text-white px-8 py-4 font-bold uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      disabled={!formData.name || !formData.email || !formData.phone}
                      onClick={handleNext}
                      className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h3 className="text-2xl font-bold text-white mb-8">Confirm Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-950 p-8 border border-white/5">
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Service</div>
                        <div className="text-xl font-bold text-red-600">{formData.service}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Date & Time</div>
                        <div className="text-xl font-bold text-white">{format(selectedDate, "PPP")} at {selectedTime}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Location</div>
                        <div className="text-white">{FIXED_ADDRESS}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Client</div>
                        <div className="text-white font-bold">{formData.name}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Contact</div>
                        <div className="text-white">{formData.email}</div>
                        <div className="text-white">{formData.phone}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-red-600/10 border border-red-600/30 p-6">
                      <h4 className="text-red-600 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Info className="w-5 h-5" /> Arrival Instructions
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        To ensure a smooth and private experience, please call me directly when you arrive. 
                        We kindly ask that you do not use the buzzer or enter through the front lobby. 
                        I will come down to meet you!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Additional Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-red-600 outline-none transition-colors h-32 resize-none"
                        placeholder="Any special requests?"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex justify-between">
                    <button
                      onClick={handleBack}
                      className="text-white px-8 py-4 font-bold uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-red-600 text-white px-12 py-4 font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-3"
                    >
                      {isSubmitting ? "Processing..." : "Confirm Booking"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
