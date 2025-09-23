import React, { useState } from "react";
import SignIn from "../src/components/SignIn";
import SignUp from "../src/components/SignUp";
import { Activity } from "lucide-react";

const Authentication = () => {
  const [login, setLogin] = useState(false);
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Hero Section */}
      <div 
        className="hidden md:flex flex-1 relative bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/bg/bgmain.jpg')"
        }}
      >
        
        <div className="absolute top-10 left-10 z-10">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">ActiveVista</span>
          </div>
        </div>
        <div className="flex items-center justify-center w-full relative z-10">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Track Your Fitness Journey</h1>
            <p className="text-xl opacity-90">
              Monitor your workouts, track progress, and achieve your fitness goals with ActiveVista.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          {!login ? (
            <>
              <SignIn />
              <p className="text-center text-gray-600 mt-6 text-sm md:text-base">
                Don't have an account?{" "}
                <button
                  onClick={() => setLogin(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <SignUp />
              <p className="text-center text-gray-600 mt-6 text-sm md:text-base">
                Already have an account?{" "}
                <button
                  onClick={() => setLogin(false)}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Authentication;