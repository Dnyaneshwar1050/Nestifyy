import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Home, Instagram, Facebook, MessageCircle } from 'lucide-react'; // Updated to include Instagram and WhatsApp icons

const Footer = () => {
  const { trackInteraction } = useContext(AppContext);
  const navigate = useNavigate();

  // Function to handle internal navigation and tracking
  const handleNavigation = (path, elementId) => {
    trackInteraction('click', elementId);
    navigate(path);
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6 rounded-t-xl shadow-inner mt-12 md:px-12">
      <div className="grid grid-cols-1 gap-10 max-w-screen-xl mx-auto md:grid-cols-4">
        {/* Nestify Brand Info */}
        <div className="md:col-span-1">
          <div className="flex items-center mb-4">
            <Home className="text-blue-400 mr-2" size={32} strokeWidth={2.5} />
            <h3 className="text-white font-extrabold text-2xl">Nestify</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your ultimate platform for finding perfect rooms and roommates, simplifying your housing journey.
          </p>
          <div className="flex space-x-4 mt-6">
            <a
              href="https://www.facebook.com/nestify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-200 hover:text-blue-400"
              onClick={() => trackInteraction('click', 'footer_social_facebook')}
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://www.instagram.com/nestify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-200 hover:text-blue-400"
              onClick={() => trackInteraction('click', 'footer_social_instagram')}
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-200 hover:text-blue-400"
              onClick={() => trackInteraction('click', 'footer_social_whatsapp')}
              aria-label="WhatsApp"
            >
              <MessageCircle size={24} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-lg mb-5 border-b border-gray-700 pb-2">Quick Links</h4>
          <ul className="list-none p-0 m-0 flex flex-col space-y-3 text-sm">
            <li>
              <button
                onClick={() => handleNavigation('/about', 'footer_about_us')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/how-it-works', 'footer_how_it_works')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/faq', 'footer_faq')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                FAQ
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/terms', 'footer_terms_conditions')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/privacy', 'footer_privacy_policy')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-white font-bold text-lg mb-5 border-b border-gray-700 pb-2">Explore</h4>
          <ul className="list-none p-0 m-0 flex flex-col space-y-3 text-sm">
            <li>
              <button
                onClick={() => handleNavigation('/find-room', 'footer_find_room_link')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                Find Room
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/find-roommate', 'footer_find_roommate_link')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                Find Roommate
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/list-property', 'footer_list_property_link')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                List Property
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/support', 'footer_support_link')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                Support
              </button>
            </li>
            {/* <li>
              <button
                onClick={() => handleNavigation('/cities', 'footer_cities_link')}
                className="text-gray-400 no-underline transition-colors duration-200 hover:text-white bg-none border-none cursor-pointer"
              >
                Cities
              </button>
            </li> */}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-white font-bold text-lg mb-5 border-b border-gray-700 pb-2">Contact Us</h4>
          <address className="not-italic text-gray-400 text-sm flex flex-col space-y-3">
            <p className="flex items-start leading-tight">
              <MapPin size={18} className="text-blue-400 mr-2 flex-shrink-0 mt-px" />
              123 Nestify Towers, Tech City,<br /> Pune, Maharashtra, India
            </p>
            <p className="flex items-start leading-tight">
              <PhoneCall size={18} className="text-blue-400 mr-2 flex-shrink-0 mt-px" />
              +91 98765 43210
            </p>
            <p className="flex items-start leading-tight">
              <Mail size={18} className="text-blue-400 mr-2 flex-shrink-0 mt-px" />
              support@nestify.com
            </p>
          </address>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Nestify. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;