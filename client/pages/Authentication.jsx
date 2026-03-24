/*
  pages/Authentication.jsx — Dark futuristic auth page
*/
import React, { useState } from "react";
import SignIn from "../src/components/SignIn";
import SignUp from "../src/components/SignUp";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../src/components/PageTransition";

const Authentication = () => {
  const [login, setLogin] = useState(false);
  
  return (
    <PageTransition>
    <div className="min-h-screen flex bg-void overflow-hidden">
      {/* Left: Hero visual */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-void">
        
        {/* Dynamic Image Pan & Zoom */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          initial={false}
          animate={{ 
            backgroundPosition: !login ? "20% center" : "80% center", // 20% for feminine side, 80% for masculine side
            scale: 1.03
          }}
          transition={{ 
            duration: 1.6, 
            ease: [0.22, 1, 0.36, 1] // Apple-like smooth spring
          }}
          style={{ backgroundImage: "url('/auth_image.jpg')" }}
        />
        
        {/* Seamless Blend into Page / Dissolve */}
        {/* from-transparent via-transparent to-void perfectly merges the image into the right container */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-void/50 to-void" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80" />

        {/* Dynamic Atmospheric Glow based on side */}
        <motion.div 
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          initial={false}
          animate={{
            background: !login 
              ? "radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.25) 0%, transparent 60%)" 
              : "radial-gradient(circle at 70% 50%, rgba(244, 63, 94, 0.25) 0%, transparent 60%)",
          }}
          transition={{ duration: 1.6 }}
        />
        
        {/* Animated Atmospheric rings */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/[0.04] rounded-full pointer-events-none"
          animate={{ rotate: 360, scale: [1, 1.02, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-primary/[0.08] rounded-full pointer-events-none"
          animate={{ rotate: -360, scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Brand */}
        <div className="absolute top-10 left-10 z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-void font-display font-black text-lg tracking-tighter glow-blue">
              AV
            </div>
            <span className="text-lg font-display font-bold text-white tracking-widest uppercase">
              ACTIVE<span className="text-primary">VISTA</span>
            </span>
          </Link>
        </div>
        
        {/* Hero text */}
        <div className="flex items-center justify-center w-full relative z-10 px-12 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div 
              key={login ? "signup" : "signin"}
              initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center text-white max-w-md"
            >
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient-hero">Track Your Fitness Journey</h1>
            <p className="text-lg text-muted leading-relaxed">
              Monitor your workouts, track progress, and achieve your fitness goals with ActiveVista.
            </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Auth forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-void relative">
        {/* Background subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            {!login ? (
              <motion.div
                key="signin-form"
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SignIn />
                <p className="text-center text-muted mt-6 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setLogin(true)}
                    className="text-primary hover:text-primary-light font-semibold transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SignUp />
                <p className="text-center text-muted mt-6 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setLogin(false)}
                    className="text-primary hover:text-primary-light font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Authentication;