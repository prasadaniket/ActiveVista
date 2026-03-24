/*
  components/Navbar.jsx
  Futuristic glassmorphism navbar with intelligent sticky behavior
  Updated: Added About Us + Gallery navigation
*/
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LogOut, User, Menu, X, LayoutDashboard, Dumbbell, 
  Settings, ChevronDown, Hexagon, Home, Image, Users
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Navbar = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  const handleLogout = () => {
    localStorage.removeItem("fittrack-app-token");
    navigate("/");
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  // Intelligent hide/show on scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    // Prevent hiding navbar when mobile menu is open
    if (isMobileMenuOpen) {
      setHidden(false);
      return;
    }
    
    const direction = latest > lastScrollY.current ? "down" : "up";
    if (direction === "down" && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
    lastScrollY.current = latest;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // Changed breakpoint to lg
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic nav links based on auth state
  const navLinks = currentUser
    ? [
        { path: "/", label: "Home", icon: Home },
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/workouts", label: "Workouts", icon: Dumbbell },
        { path: "/about", label: "About Us", icon: Users },
        { path: "/gallery", label: "Gallery", icon: Image },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/about", label: "About Us", icon: Users },
        { path: "/gallery", label: "Gallery", icon: Image },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? "bg-void/80 backdrop-blur-2xl border-b border-primary/10 shadow-[0_4px_30px_rgba(18,97,160,0.08)]" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
              <Hexagon className="w-8 h-8 text-primary fill-primary/10" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-display font-bold text-primary">AV</span>
              </div>
            </motion.div>
            <span className="text-lg font-display font-bold tracking-wide text-text group-hover:text-primary transition-colors duration-300">
              ActiveVista
            </span>
          </Link>

          {/* Desktop Nav Links - Shifted to lg for better spacing */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    className={`
                      relative px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-300 flex items-center gap-2
                      ${active 
                        ? "text-primary bg-primary/10" 
                        : "text-muted hover:text-text hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Desktop User - Shifted to lg */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl border border-white/5 hover:border-primary/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
                >
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={currentUser?.img} className="rounded-full" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-display font-bold">
                      {currentUser?.name?.substring(0, 2).toUpperCase() || "AV"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-text max-w-[100px] truncate">
                    {currentUser?.name || "User"}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-56 glass-card p-1.5 shadow-2xl"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-muted hover:text-text hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <div className="h-px bg-white/5 mx-3 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all text-sm font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-futuristic text-white text-sm px-6 py-2.5 rounded-xl"
                >
                  Get Started
                </motion.div>
              </Link>
            )}
          </div>

          {/* Mobile Toggle - Active below lg */}
          <div className="lg:hidden">
            <motion.button
               whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted hover:text-text transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-abyss/95 backdrop-blur-3xl border-b border-primary/10 overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-none"
          >
            <div className="px-6 py-8 flex flex-col gap-3">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      isActive(item.path) 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted hover:text-text hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              
              <div className="h-px bg-white/5 my-4" />
              
              {currentUser ? (
                <div className="flex flex-col gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                  >
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-4 p-4 rounded-2xl text-muted hover:text-text hover:bg-white/[0.03]"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + 1) * 0.05 }}
                  >
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-4 p-4 rounded-2xl text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                >
                  <Link 
                    to="/auth" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold tracking-wide uppercase transition-all shadow-lg shadow-primary/20"
                  >
                    Get Started
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
