"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Mic2, Music, Disc3, Guitar, Sparkles, ArrowRight, 
  Menu, X, Crown, Star, Users, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

// Leadership data
const leadership = [
  {
    name: "Nguyễn Văn A",
    role: "Chủ nhiệm CLB",
    image: "/avatars/president.jpg",
    description: "Người sáng lập và dẫn dắt CLB từ những ngày đầu tiên",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    icon: Crown,
  },
  {
    name: "Trần Thị B",
    role: "Phó Chủ nhiệm",
    image: "/avatars/vice-president.jpg",
    description: "Điều phối hoạt động và phát triển thành viên",
    gradient: "from-purple-400 via-pink-500 to-rose-500",
    icon: Star,
  },
  {
    name: "Lê Văn C",
    role: "Trưởng ban Tổ chức",
    image: "/avatars/leader.jpg",
    description: "Tổ chức các sự kiện và hoạt động của CLB",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    icon: Users,
  },
];

// Department Leaders
const departmentLeaders = [
  {
    name: "Phạm Minh D",
    role: "Leader Singing",
    department: "SINGING",
    image: "/avatars/singing-leader.jpg",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Hoàng Thị E",
    role: "Leader Dance",
    department: "DANCE",
    image: "/avatars/dance-leader.jpg",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    name: "Võ Văn F",
    role: "Leader Rap",
    department: "RAP",
    image: "/avatars/rap-leader.jpg",
    gradient: "from-amber-500 to-orange-500",
  },
];

// Club Members
const members = [
  { name: "Thành viên 1", department: "SINGING", image: "/avatars/member1.jpg" },
  { name: "Thành viên 2", department: "DANCE", image: "/avatars/member2.jpg" },
  { name: "Thành viên 3", department: "RAP", image: "/avatars/member3.jpg" },
  { name: "Thành viên 4", department: "INSTRUMENT", image: "/avatars/member4.jpg" },
  { name: "Thành viên 5", department: "SINGING", image: "/avatars/member5.jpg" },
  { name: "Thành viên 6", department: "DANCE", image: "/avatars/member6.jpg" },
  { name: "Thành viên 7", department: "RAP", image: "/avatars/member7.jpg" },
  { name: "Thành viên 8", department: "INSTRUMENT", image: "/avatars/member8.jpg" },
];

const departments = [
  {
    name: "Singing",
    icon: Mic2,
    description: "Express your voice and captivate the audience with powerful vocals",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Dance",
    icon: Music,
    description: "Move your body to the rhythm and tell stories through motion",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    name: "Rap",
    icon: Disc3,
    description: "Flow with words and beats to create powerful lyrical art",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Instruments",
    icon: Guitar,
    description: "Master your instrument and create beautiful melodies",
    gradient: "from-cyan-500 to-blue-500",
  },
];

// Pre-generated particle positions to avoid hydration mismatch
const particles = [
  { left: 10, top: 20, duration: 4, delay: 0.5, yOffset: -80 },
  { left: 25, top: 40, duration: 3.5, delay: 1, yOffset: -60 },
  { left: 45, top: 15, duration: 5, delay: 0.2, yOffset: -100 },
  { left: 60, top: 55, duration: 4.5, delay: 1.5, yOffset: -70 },
  { left: 75, top: 30, duration: 3, delay: 0.8, yOffset: -90 },
  { left: 85, top: 65, duration: 4, delay: 2, yOffset: -50 },
  { left: 15, top: 70, duration: 5.5, delay: 0.3, yOffset: -85 },
  { left: 35, top: 80, duration: 3.5, delay: 1.2, yOffset: -75 },
  { left: 55, top: 25, duration: 4.2, delay: 0.7, yOffset: -95 },
  { left: 90, top: 45, duration: 3.8, delay: 1.8, yOffset: -65 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Header Component
function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              Art Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              Giới thiệu
            </a>
            <a href="#departments" className="text-gray-300 hover:text-white transition-colors">
              Bộ môn
            </a>
            <a href="#leadership" className="text-gray-300 hover:text-white transition-colors">
              Ban chủ nhiệm
            </a>
            <a href="#members" className="text-gray-300 hover:text-white transition-colors">
              Thành viên
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full px-6">
                Đăng nhập
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="flex flex-col gap-4">
              <a href="#about" className="text-gray-300 hover:text-white transition-colors py-2">
                Giới thiệu
              </a>
              <a href="#departments" className="text-gray-300 hover:text-white transition-colors py-2">
                Bộ môn
              </a>
              <a href="#leadership" className="text-gray-300 hover:text-white transition-colors py-2">
                Ban chủ nhiệm
              </a>
              <a href="#members" className="text-gray-300 hover:text-white transition-colors py-2">
                Thành viên
              </a>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}

// Members Slider Component
function MembersSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= members.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? members.length - itemsPerView : prev - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: `-${currentIndex * (100 / itemsPerView)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {members.map((member, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2"
            >
              <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-purple-500/50 transition-all">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-2 border-purple-500/30">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="font-medium text-white">{member.name}</h4>
                <p className="text-sm text-purple-400">{member.department}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen mesh-gradient overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-20">
        {/* Floating particles effect - Fixed positions */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, particle.yOffset],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                repeatType: "reverse",
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center z-10"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Where Art Meets Passion</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-glow"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Art Club
            </span>
            <br />
            <span className="text-white">Fund Manager</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 px-4"
          >
            Unite your passion for performing arts. Track contributions, manage funds, 
            and keep the creativity flowing across all departments.
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Link href="/login">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                Enter the Stage
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-purple-500/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Departments Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Our Departments
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Four pillars of artistic expression, united under one roof
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {departments.map((dept) => (
            <motion.div
              key={dept.name}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="card-glow group relative overflow-hidden rounded-2xl bg-card border border-border p-6 cursor-pointer"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dept.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <dept.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {dept.name}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {dept.description}
              </p>

              {/* Decorative corner */}
              <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${dept.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-30 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="text-center text-gray-500 text-sm">
          <p>© 2026 Art Club Fund Manager. Made with 💜 for artists.</p>
        </div>
      </footer>
    </main>
  );
}
