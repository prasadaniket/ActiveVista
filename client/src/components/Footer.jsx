/*
  components/Footer.jsx
  Purpose: Site-wide footer with brand, quick links, features, and contact info.
  Notes: Pure presentational component, responsive grid.
*/
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/Logo/Logonav2.png" alt="ActiveVista" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate fitness companion. Track workouts, achieve goals, and transform your lifestyle with personalized workout plans.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/workouts" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Workouts
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2">
              <li>
                <a className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Personalized Workouts
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Progress Tracking
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Expert Recommendations
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span className="text-gray-400 text-sm">support@activevista.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span className="text-gray-400 text-sm">123 Fitness St, Health City, HC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 ActiveVista. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
