import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';

import { auth } from "./firebase/config";
import Auth from "./components/Auth";
import ScreenRecorder from "./components/ScreenRecorder";
import { User, Shield, Sparkles, ArrowRight } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Landing from "./pages/Landing";

// Separate landing UI into a component
// function Landing({ user }) {
//   return (
//     <div className="min-h-screen w-full flex px-6 py-12 overflow-y-auto items-center justify-center">
//       {/* ... keep your original landing page code here unchanged ... */}
//       {/* Just replace Auth usage with <Auth user={user} /> */}
//       <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 mt-16 shadow-2xl max-w-xl w-full text-center">
//         <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
//         <p className="text-gray-400 mb-6">Sign in to start recording your screen</p>
//         <Auth user={user} />
//       </div>
//     </div>
//   );
// }

// This is the actual dashboard route
function DashboardPage({ user }) {
  if (!user) return <Navigate to="/" />;
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-base sm:text-lg truncate max-w-[200px] sm:max-w-none">
                  {user.displayName || "User"}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm break-all">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="text-sm sm:text-base shrink-0">
              <Auth user={user} />
            </div>
          </div>
        </div>
      </div>

      <ScreenRecorder user={user} />
      <Dashboard user={user} />
    </div>
  );
}


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        navigate("/dashboard");
      }
    });
    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl animate-pulse flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl animate-ping opacity-20"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing user={user}/>} />
      <Route path="/dashboard" element={<DashboardPage user={user} />} />
    </Routes>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
       <Analytics />
    </Router>
  );
}
