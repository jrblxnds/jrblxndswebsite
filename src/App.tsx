/**
 * JRBLXNDZ | Premium Barber Website
 * Build Version: 1.0.1 - Netlify Build Fix
 */
import { useState, useEffect } from "react";
import MainNavbar from "./components/MainNavbar";
import MainHero from "./components/MainHero";
import ServiceHighlights from "./components/ServiceHighlights";
import ServiceList from "./components/ServiceList";
import BookingSection from "./components/BookingSection";
import PolicySection from "./components/PolicySection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import AdminDashboard from "./components/AdminDashboard";
import ScrollToTop from "./components/ScrollToTop";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { auth } from "./firebase-config";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { LogIn, LogOut, ShieldAlert } from "lucide-react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const ADMIN_EMAIL = "jrblxndz@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.email);
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
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    // Force account selection to avoid automatic login with wrong account
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Login success:", result.user.email);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore user cancellation
      } else {
        setLoginError(error.message || "Failed to sign in. Please try again.");
      }
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
      <MainNavbar />
      {user ? (
        user.email === ADMIN_EMAIL ? (
          <AdminDashboard />
        ) : (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center max-w-md bg-zinc-950 border border-red-600/30 p-12">
              <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter text-red-600">Access Denied</h2>
              <p className="text-gray-400 mb-8">
                The account <span className="text-white font-bold">{user.email}</span> is not authorized to access the admin dashboard.
              </p>
              <button 
                onClick={handleLogout}
                className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-3 mx-auto"
              >
                <LogOut className="w-5 h-5" /> Sign Out & Try Again
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-zinc-950 border border-white/10 p-12">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">Admin Access</h2>
            <p className="text-gray-400 mb-8">Please sign in with your authorized barber account to manage bookings.</p>
            
            {loginError && (
              <div className="mb-6 p-4 bg-red-600/10 border border-red-600/30 text-red-500 text-sm font-bold">
                {loginError}
              </div>
            )}

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
      <MainNavbar />
      <main>
        <MainHero />
        <ServiceHighlights />
        <ServiceList />
        <BookingSection />
        <PolicySection />
        <AboutSection />
        <ContactSection />
      </main>
      
      <ScrollToTop />

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
    <AppErrorBoundary>
      {content}
    </AppErrorBoundary>
  );
}
