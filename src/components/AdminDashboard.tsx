import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format, startOfToday, addDays, eachDayOfInterval, isSameDay } from "date-fns";
import { Trash2, CheckCircle, Calendar, User, Phone, MapPin, Clock, ShieldAlert, Settings } from "lucide-react";
import { db } from "@/src/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, where, getDocs, deleteField } from "firebase/firestore";
import { cn } from "@/src/lib/utils";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "availability">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Availability state
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [blockingLoading, setBlockingLoading] = useState(false);

  const days = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 14)
  });

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date)
      }));
      setBookings(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "bookings");
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const q = query(collection(db, "blocked_slots"), where("date", "==", dateStr));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlockedSlots(docs);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      // Delete the booking
      await deleteDoc(doc(db, "bookings", id));
      
      // Find and delete the corresponding blocked slot
      const blockedQuery = query(
        collection(db, "blocked_slots"),
        where("bookingId", "==", id)
      );
      const blockedSnap = await getDocs(blockedQuery);
      for (const blockedDoc of blockedSnap.docs) {
        await deleteDoc(doc(db, "blocked_slots", blockedDoc.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
    }
  };

  const toggleSlot = async (time: string) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const existing = blockedSlots.find(s => s.time === time);
    
    setBlockingLoading(true);
    try {
      if (existing) {
        await deleteDoc(doc(db, "blocked_slots", existing.id));
      } else {
        await addDoc(collection(db, "blocked_slots"), {
          date: dateStr,
          time: time,
          type: 'manual'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "blocked_slots");
    } finally {
      setBlockingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2">ADMIN PANEL</h1>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setActiveTab("bookings")}
                className={cn(
                  "px-6 py-2 font-bold uppercase tracking-widest transition-all border",
                  activeTab === "bookings" ? "bg-red-600 border-red-600 text-white" : "bg-zinc-950 border-white/10 text-gray-500 hover:border-white/30"
                )}
              >
                Bookings
              </button>
              <button 
                onClick={() => setActiveTab("availability")}
                className={cn(
                  "px-6 py-2 font-bold uppercase tracking-widest transition-all border",
                  activeTab === "availability" ? "bg-red-600 border-red-600 text-white" : "bg-zinc-950 border-white/10 text-gray-500 hover:border-white/30"
                )}
              >
                Availability
              </button>
            </div>
          </div>
          
          {activeTab === "bookings" && (
            <div className="flex gap-4">
              <div className="bg-zinc-900 px-6 py-3 border border-white/5">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total</div>
                <div className="text-2xl font-black text-white">{bookings.length}</div>
              </div>
              <div className="bg-zinc-900 px-6 py-3 border border-white/5">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Pending</div>
                <div className="text-2xl font-black text-red-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "bookings" ? (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 gap-6"
            >
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  className="bg-zinc-950 border border-white/5 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-red-600/30 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Schedule</span>
                      </div>
                      <div className="text-xl font-bold text-white">{format(booking.date, "MMM d, yyyy")}</div>
                      <div className="text-gray-400 font-medium">{booking.time}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Client</span>
                      </div>
                      <div className="text-xl font-bold text-white">{booking.name}</div>
                      <div className="text-gray-400 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {booking.phone}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Service & Location</span>
                      </div>
                      <div className="text-xl font-bold text-white">{booking.service}</div>
                      <div className="text-gray-400 truncate max-w-[200px]">{booking.address}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">Status</div>
                      <div className={cn(
                        "inline-block px-3 py-1 text-xs font-black uppercase tracking-widest",
                        booking.status === 'confirmed' ? "bg-green-600/20 text-green-500" : "bg-red-600/20 text-red-500"
                      )}>
                        {booking.status}
                      </div>
                      {booking.notes && (
                        <div className="text-xs text-gray-500 italic mt-2">"{booking.notes}"</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="p-4 bg-zinc-900 text-gray-400 hover:bg-red-600 hover:text-white transition-all border border-white/5"
                      title="Delete Booking"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="p-4 bg-zinc-900 text-gray-400 hover:bg-green-600 hover:text-white transition-all border border-white/5"
                        title="Confirm Booking"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-zinc-950 border border-dashed border-white/10">
                  <p className="text-gray-500 font-bold uppercase tracking-widest">No bookings found</p>
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="availability"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-zinc-950 border border-white/5 p-8 md:p-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Calendar className="text-red-600" /> Select Date
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map((day) => (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "p-4 text-center border transition-all duration-300",
                          isSameDay(day, selectedDate)
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-zinc-900 border-white/5 text-gray-400 hover:border-red-600/50"
                        )}
                      >
                        <div className="text-[10px] uppercase tracking-tighter mb-1">{format(day, "EEE")}</div>
                        <div className="text-lg font-black">{format(day, "d")}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Clock className="text-red-600" /> Manage Time Slots
                  </h3>
                  <p className="text-gray-500 mb-8 text-sm uppercase tracking-widest font-bold">
                    Click a slot to block or unblock it for {format(selectedDate, "PPP")}.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIME_SLOTS.map((time) => {
                      const slotData = blockedSlots.find(s => s.time === time);
                      const isBlocked = slotData?.type === 'manual';
                      const isBooked = slotData?.type === 'booking';

                      return (
                        <button
                          key={time}
                          disabled={blockingLoading || isBooked}
                          onClick={() => toggleSlot(time)}
                          className={cn(
                            "py-4 text-center border transition-all duration-300 font-bold relative group",
                            isBlocked 
                              ? "bg-red-600/10 border-red-600 text-red-600" 
                              : isBooked
                              ? "bg-zinc-900 border-white/5 text-zinc-700 cursor-not-allowed"
                              : "bg-zinc-900 border-white/5 text-gray-400 hover:border-white/30"
                          )}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{time}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">
                              {isBooked ? "Booked" : isBlocked ? "Blocked" : "Available"}
                            </span>
                          </div>
                          {isBooked && (
                            <div className="absolute top-2 right-2">
                              <ShieldAlert className="w-3 h-3 text-red-600" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
