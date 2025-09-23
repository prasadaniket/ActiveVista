/*
  src/App.jsx
  Purpose: App root; sets up routing, auth gate, Navbar/Footer, and routes to Dashboard/Workouts/Profile.
  Behavior: Reads token from storage to toggle authenticated UI.
*/
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "../pages/Authentication";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "../pages/Dashboard";
import Workouts from "../pages/Workout";
import Profile from "../pages/Profile";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fittrack-app-token");
    if (token) {
      // You can add token validation here
      setCurrentUser({ name: "User", email: "user@example.com" });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {currentUser ? (
          <div className="flex flex-col min-h-screen">
            <Navbar currentUser={currentUser} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        ) : (
          <Authentication />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;