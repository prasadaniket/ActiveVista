/*
  src/App.jsx
  App root — Futuristic #1261A0 + Deep Black theme
  Updated: Added About Us, Gallery routes + ToastProvider
*/
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Authentication from "../pages/Authentication";
import Home from "../pages/Home";
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import Dashboard from "../pages/Dashboard";
import Workouts from "../pages/Workout";
import Profile from "../pages/Profile";
import AboutUs from "../pages/AboutUs";
import Gallery from "../pages/Gallery";
import { ToastProvider } from "../src/components/ui/Toast";

const ProtectedRoute = ({ children, user }) => {
  if (!user) return <Navigate to="/auth" />;
  return children;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fittrack-app-token");
    if (token) {
      // Fetch real user profile from backend
      import("./api/axiosInstance").then(({ default: axiosInstance }) => {
        axiosInstance.get("/user/profile")
          .then((res) => {
            const userData = res.data?.user;
            if (userData) {
              setCurrentUser({
                name: userData.name,
                email: userData.email,
                img: userData.img || null,
              });
            } else {
              // Invalid response — clear token
              localStorage.removeItem("fittrack-app-token");
            }
          })
          .catch(() => {
            // Token invalid/expired — clear it
            localStorage.removeItem("fittrack-app-token");
          })
          .finally(() => setLoading(false));
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 animate-pulse glow-blue" />
            <div className="absolute inset-0 w-14 h-14 rounded-2xl border border-primary/30 animate-ping opacity-30" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-display font-bold text-primary/80 tracking-widest text-xs uppercase">Loading</p>
            <p className="text-xs text-muted/40">Initializing ActiveVista...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/home" element={<Home currentUser={currentUser} />} />
            <Route path="/about" element={<AboutUs currentUser={currentUser} />} />
            <Route path="/gallery" element={<Gallery currentUser={currentUser} />} />
            
            {/* Auth */}
            <Route path="/auth" element={
              currentUser ? <Navigate to="/dashboard" /> : <Authentication />
            } />

            {/* Protected App Shell */}
            <Route path="/*" element={
              <ProtectedRoute user={currentUser}>
                <div className="flex flex-col min-h-screen bg-void">
                  <Navbar currentUser={currentUser} />
                  <main className="flex-1 pt-20">
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="workouts" element={<Workouts />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
