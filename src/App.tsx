import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServiceHighlight from "./components/ServiceHighlight";
import Services from "./components/Services";
import Booking from "./components/Booking";
import Policies from "./components/Policies";
import About from "./components/About";
import Contact from "./components/Contact";
import AdminView from "./components/AdminView";
import BackToTop from "./components/BackToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { auth } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { LogIn, LogOut } from "lucide-react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Simple routing logic based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === "#admin");
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.hash = "";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const content = isAdmin ? (
    <div className="bg-black min-h-screen text-white selection:bg-red-600 selection:text-white">
      <Navbar />
      {user ? (
        <AdminView />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-zinc-950 border border-white/10 p-12">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">Admin Access</h2>
            <p className="text-gray-400 mb-8">Please sign in with an authorized account to manage bookings.</p>
            <button 
              onClick={handleLogin}
              className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-3 mx-auto"
            >
              <LogIn className="w-5 h-5" /> Sign In with Google
            </button>
          </div>
        </div>
      )}
      <div className="fixed bottom-6 right-6 z-50 flex gap-4">
        {user && (
          <button 
            onClick={handleLogout}
            className="bg-zinc-900 text-white px-6 py-2 font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        )}
        <button 
          onClick={() => window.location.hash = ""}
          className="bg-white text-black px-6 py-2 font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl"
        >
          Exit Admin
        </button>
      </div>
    </div>
  ) : (
    <div className="bg-black min-h-screen text-white selection:bg-red-600 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <ServiceHighlight />
        <Services />
        <Booking />
        <Policies />
        <About />
        <Contact />
      </main>
      
      <BackToTop />

      {/* Hidden Admin Access */}
      <div className="fixed bottom-4 left-4 opacity-0 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => window.location.hash = "admin"}
          className="text-[10px] text-zinc-800 uppercase tracking-widest font-black"
        >
          Admin Access
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
  );
}
