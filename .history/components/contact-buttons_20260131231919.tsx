"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Mail, Send } from "lucide-react";

// Social icons components
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const ZaloIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" fill="currentColor">
    <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm10.5 28h-2.4c-.4 0-.7-.3-.7-.7v-8.4l-3.8 8.6c-.2.4-.6.5-.9.5h-.4c-.4 0-.7-.2-.9-.5l-3.8-8.6v8.4c0 .4-.3.7-.7.7h-2.4c-.4 0-.7-.3-.7-.7V16.7c0-.4.3-.7.7-.7h2.4c.4 0 .7.2.9.5l4.5 10.2 4.5-10.2c.2-.3.5-.5.9-.5h2.4c.4 0 .7.3.7.7v14.6c0 .4-.3.7-.3.7z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.04.57.61.94 1.13.71l1.98-.87c.17-.08.36-.1.55-.06.91.25 1.87.38 2.88.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.89 7.55l-2.91 4.63c-.46.74-1.46.93-2.16.4l-2.32-1.74a.6.6 0 00-.72 0l-3.13 2.38c-.42.32-.97-.18-.69-.63l2.91-4.63c.46-.74 1.46-.93 2.16-.4l2.32 1.74a.6.6 0 00.72 0l3.13-2.38c.42-.32.97.18.69.63z" />
  </svg>
);

interface ContactItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  hoverColor: string;
}

const contactItems: ContactItem[] = [
  {
    name: "Messenger",
    icon: <MessengerIcon />,
    href: "https://m.me/yourpage",
    color: "bg-gradient-to-br from-blue-500 to-purple-600",
    hoverColor: "hover:shadow-blue-500/40",
  },
  {
    name: "Zalo",
    icon: <ZaloIcon />,
    href: "https://zalo.me/0123456789",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    hoverColor: "hover:shadow-blue-400/40",
  },
  {
    name: "Facebook",
    icon: <FacebookIcon />,
    href: "https://facebook.com/yourpage",
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    hoverColor: "hover:shadow-blue-600/40",
  },
  {
    name: "TikTok",
    icon: <TikTokIcon />,
    href: "https://tiktok.com/@yourpage",
    color: "bg-gradient-to-br from-gray-900 to-gray-800",
    hoverColor: "hover:shadow-gray-500/40",
  },
  {
    name: "Email",
    icon: <Mail className="w-5 h-5" />,
    href: "mailto:contact@artclub.com",
    color: "bg-gradient-to-br from-red-500 to-pink-500",
    hoverColor: "hover:shadow-red-500/40",
  },
  {
    name: "Hotline",
    icon: <Phone className="w-5 h-5" />,
    href: "tel:0123456789",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    hoverColor: "hover:shadow-green-500/40",
  },
];

export function ContactButtons() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Contact items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-0 flex flex-col gap-3"
          >
            {contactItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  scale: 0.8,
                  transition: { delay: (contactItems.length - index) * 0.03 }
                }}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`group flex items-center gap-3 ${item.color} ${item.hoverColor} text-white rounded-full shadow-lg transition-shadow`}
              >
                {/* Icon */}
                <div className="w-11 h-11 flex items-center justify-center">
                  {item.icon}
                </div>
                
                {/* Label - shows on hover */}
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  whileHover={{ opacity: 1, width: "auto" }}
                  className="pr-4 text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </motion.span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 ${
          isOpen 
            ? "bg-gray-700 shadow-gray-500/30" 
            : "bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:shadow-emerald-500/50"
        }`}
        aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">!</span>
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
