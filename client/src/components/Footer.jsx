/*
  Footer.jsx — Futuristic dark-themed footer
  Updated: Added About Us and Gallery links
*/
import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Github, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-void pt-28 pb-12 border-t border-white/5 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-primary/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-accent/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-20">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-void font-display font-black text-lg tracking-tighter shadow-[0_0_25px_rgba(18,97,160,0.4)]">
                AV
              </div>
              <span className="text-lg font-display font-bold text-white tracking-widest uppercase">
                ACTIVE<span className="text-primary">VISTA</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs hover:text-white/60 transition-colors duration-500">
              The intelligent fitness platform that transforms raw training data into measurable evolution.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Github, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <motion.a
                  key={i}
                  whileHover={{ y: -3 }}
                  href={href}
                  className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn 
            title="SYSTEM MODULES" 
            links={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Workouts", href: "/workouts" },
              { label: "Profile", href: "/profile" },
              { label: "Analytics", href: "/dashboard" },
            ]} 
          />
          <FooterColumn 
            title="EXPLORE" 
            links={[
              { label: "About Us", href: "/about" },
              { label: "Gallery", href: "/gallery" },
              { label: "Getting Started", href: "/auth" },
              { label: "System Status", href: "#" },
            ]} 
          />

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-white uppercase opacity-40">STAY UPDATED</h4>
            <p className="text-xs text-muted">Subscribe for updates and intelligence briefings.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="your@email.com"
                className="input-dark w-full pr-20 text-xs"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary/10 text-primary text-[9px] font-bold tracking-widest uppercase rounded-lg flex items-center gap-1 hover:bg-primary/20 transition-all duration-300">
                INIT <Mail className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-bold tracking-[0.3em] text-muted uppercase">
            © 2026 ACTIVEVISTA CORE SYSTEM // <span className="text-primary">OPTIMAL FORM MAINTAINED</span>
          </p>
          <div className="flex gap-8 text-[9px] font-bold tracking-[0.3em] text-muted uppercase">
            <a href="#" className="hover:text-primary transition-colors duration-300">PRIVACY</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">TERMS</a>
            <a href="#" className="flex items-center gap-1 text-primary">
              <Shield className="w-3 h-3" /> ENCRYPTED
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, links }) => (
  <div className="space-y-6">
    <h4 className="text-[10px] font-bold tracking-[0.4em] text-white uppercase opacity-40">{title}</h4>
    <ul className="space-y-3.5">
      {links.map((link, i) => (
        <li key={i}>
          <Link 
            to={link.href}
            className="text-[11px] font-bold tracking-widest text-muted uppercase hover:text-primary hover:translate-x-1 inline-block transition-all duration-300"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
