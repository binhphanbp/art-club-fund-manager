"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mic2, Music, Disc3, Guitar, Sparkles, ArrowRight, Crown, Star, ChevronLeft, ChevronRight, Users, Calendar, Trophy, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";

// Departments data
const departments = [
  {
    name: "Singing",
    icon: Mic2,
    description: "Express your voice and captivate the audience with powerful vocals",
    gradient: "from-pink-500 to-rose-500",
    color: "pink",
  },
  {
    name: "Dance",
    icon: Music,
    description: "Move your body to the rhythm and tell stories through motion",
    gradient: "from-purple-500 to-violet-500",
    color: "purple",
  },
  {
    name: "Rap",
    icon: Disc3,
    description: "Flow with words and beats to create powerful lyrical art",
    gradient: "from-amber-500 to-orange-500",
    color: "amber",
  },
  {
    name: "Instruments",
    icon: Guitar,
    description: "Master your instrument and create beautiful melodies",
    gradient: "from-cyan-500 to-blue-500",
    color: "cyan",
  },
];

// Leadership team
const executives = [
  {
    name: "Nguyễn Văn A",
    role: "Chủ Nhiệm CLB",
    image: "/avatars/president.jpg",
    description: "Điều hành và phát triển CLB",
    badge: "President",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    emoji: "👑",
  },
  {
    name: "Trần Thị B",
    role: "Phó Chủ Nhiệm",
    image: "/avatars/vice-president.jpg",
    description: "Hỗ trợ điều hành & đối ngoại",
    badge: "Vice President",
    gradient: "from-purple-400 via-violet-500 to-indigo-500",
    emoji: "⭐",
  },
  {
    name: "Lê Văn C",
    role: "Cố Vấn CLB",
    image: "/avatars/advisor.jpg",
    description: "Định hướng & tư vấn chiến lược",
    badge: "Advisor",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    emoji: "🎯",
  },
];

// Team leaders
const teamLeaders = [
  {
    name: "Phạm Thị D",
    role: "Leader Team Hát",
    team: "Singing",
    image: "/avatars/singing-leader.jpg",
    gradient: "from-pink-500 to-rose-500",
    icon: Mic2,
    quote: "Giọng hát là linh hồn của âm nhạc",
  },
  {
    name: "Hoàng Văn E",
    role: "Leader Team Dance",
    team: "Dance",
    image: "/avatars/dance-leader.jpg",
    gradient: "from-purple-500 to-violet-500",
    icon: Music,
    quote: "Mỗi bước nhảy là một câu chuyện",
  },
  {
    name: "Vũ Thị F",
    role: "Leader Team Rap",
    team: "Rap",
    image: "/avatars/rap-leader.jpg",
    gradient: "from-amber-500 to-orange-500",
    icon: Disc3,
    quote: "Flow là ngôn ngữ của đường phố",
  },
];

// Club members - expanded
const members = [
  { name: "Minh Anh", department: "Singing", initial: "MA" },
  { name: "Hải Đăng", department: "Dance", initial: "HĐ" },
  { name: "Thu Hà", department: "Rap", initial: "TH" },
  { name: "Quốc Bảo", department: "Instruments", initial: "QB" },
  { name: "Lan Anh", department: "Singing", initial: "LA" },
  { name: "Đức Anh", department: "Dance", initial: "ĐA" },
  { name: "Phương Linh", department: "Rap", initial: "PL" },
  { name: "Tuấn Kiệt", department: "Instruments", initial: "TK" },
  { name: "Ngọc Mai", department: "Singing", initial: "NM" },
  { name: "Hoàng Nam", department: "Dance", initial: "HN" },
  { name: "Thùy Linh", department: "Singing", initial: "TL" },
  { name: "Văn Hùng", department: "Rap", initial: "VH" },
];

const departmentColors: { [key: string]: string } = {
  Singing: "from-pink-500 to-rose-500",
  Dance: "from-purple-500 to-violet-500",
  Rap: "from-amber-500 to-orange-500",
  Instruments: "from-cyan-500 to-blue-500",
};

// Animation variants
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

// Infinite Member Carousel Component
function MemberCarousel() {
  const duplicatedMembers = [...members, ...members, ...members];
  
  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-6"
        animate={{
          x: [0, -100 * members.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {duplicatedMembers.map((member, index) => (
          <motion.div
            key={`${member.name}-${index}`}
            className="shrink-0"
            whileHover={{ scale: 1.1, y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative group cursor-pointer">
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-linear-to-br ${departmentColors[member.department]} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300 rounded-full`} />
              
              {/* Avatar */}
              <div className={`relative w-20 h-20 rounded-full bg-linear-to-br ${departmentColors[member.department]} p-[2px]`}>
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-foreground font-bold text-lg">{member.initial}</span>
                </div>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-center shadow-lg">
                  <p className="text-foreground text-xs font-medium">{member.name}</p>
                  <p className="text-muted-foreground text-[10px]">{member.department}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const [activeLeader, setActiveLeader] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLeader((prev) => (prev + 1) % teamLeaders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen mesh-gradient overflow-hidden">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-16">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          {/* Floating music notes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {["🎵", "🎶", "🎤", "🎸", "🎹", "🥁"].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl opacity-20"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 10, -10, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              >
                {emoji}
              </motion.div>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Where Art Meets Passion</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
            >
              <motion.span 
                className="inline-block bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent text-glow"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Art Club
              </motion.span>
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

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="group bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                >
                  Enter the Stage
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#departments">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-full"
                >
                  Khám Phá
                </Button>
              </a>
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
        <section id="departments" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
            >
              <Music className="w-8 h-8 text-purple-400" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
            {departments.map((dept, index) => (
              <motion.div
                key={dept.name}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="card-glow group relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-sm border border-border p-8 cursor-pointer"
              >
                {/* Animated gradient background */}
                <motion.div 
                  className={`absolute inset-0 bg-linear-to-br ${dept.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
                  animate={{
                    background: [
                      `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                      `linear-gradient(225deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                      `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Icon with glow */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-linear-to-br ${dept.gradient} blur-xl opacity-50 group-hover:opacity-80 transition-opacity`} />
                  <div className={`relative w-16 h-16 rounded-2xl bg-linear-to-br ${dept.gradient} flex items-center justify-center shadow-2xl`}>
                    <dept.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all">
                  {dept.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {dept.description}
                </p>

                {/* Number indicator */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                  0{index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Leadership Section */}
        <section id="leadership" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-linear-to-b from-yellow-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-yellow-500/25"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Ban Chủ Nhiệm
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Những người dẫn dắt và truyền cảm hứng cho CLB
              </p>
            </motion.div>

            {/* Executive Team - Premium Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
            >
              {executives.map((exec, index) => (
                <motion.div
                  key={exec.name}
                  variants={cardVariants}
                  whileHover={{ y: -15, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className={`absolute -inset-1 bg-linear-to-br ${exec.gradient} rounded-[2rem] opacity-30 blur-xl group-hover:opacity-60 transition-opacity duration-500`} />
                  
                  <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 overflow-hidden h-full">
                    {/* Decorative gradient line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${exec.gradient}`} />
                    
                    {/* Emoji badge */}
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-6 right-6 text-4xl"
                    >
                      {exec.emoji}
                    </motion.div>
                    
                    {/* Avatar */}
                    <div className="relative w-28 h-28 mx-auto mb-6">
                      <motion.div 
                        className={`absolute inset-0 bg-linear-to-br ${exec.gradient} rounded-full`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-1 bg-card rounded-full" />
                      <div className={`absolute inset-2 bg-linear-to-br ${exec.gradient} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-3xl">{exec.name.charAt(0)}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <div className={`inline-block px-3 py-1 rounded-full bg-linear-to-r ${exec.gradient} text-white text-xs font-semibold mb-3`}>
                        {exec.badge}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{exec.name}</h3>
                      <p className={`text-transparent bg-linear-to-r ${exec.gradient} bg-clip-text font-semibold text-lg mb-2`}>
                        {exec.role}
                      </p>
                      <p className="text-gray-400 text-sm">{exec.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Team Leaders Section - Creative Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Team Leaders</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Các Trưởng Nhóm
              </h3>
            </motion.div>

            {/* Interactive Leader Showcase */}
            <div className="relative max-w-4xl mx-auto">
              {/* Leader Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamLeaders.map((leader, index) => (
                  <motion.div
                    key={leader.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -10 }}
                    onClick={() => setActiveLeader(index)}
                    className={`relative cursor-pointer group ${activeLeader === index ? 'z-10' : 'z-0'}`}
                  >
                    {/* Active glow */}
                    <AnimatePresence>
                      {activeLeader === index && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute -inset-2 bg-linear-to-br ${leader.gradient} rounded-3xl opacity-30 blur-xl`}
                        />
                      )}
                    </AnimatePresence>
                    
                    <div className={`relative bg-card/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
                      activeLeader === index 
                        ? 'border-white/30 bg-card' 
                        : 'border-border hover:border-white/20'
                    }`}>
                      {/* Team badge */}
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r ${leader.gradient} text-white text-xs font-bold shadow-lg`}>
                        {leader.team}
                      </div>

                      {/* Icon & Avatar */}
                      <div className="flex flex-col items-center mt-4">
                        <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${leader.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <leader.icon className="w-10 h-10 text-white" />
                        </div>
                        
                        <h4 className="text-xl font-bold text-white mb-1">{leader.name}</h4>
                        <p className="text-gray-400 text-sm mb-3">{leader.role}</p>
                        
                        {/* Quote - shown when active */}
                        <AnimatePresence>
                          {activeLeader === index && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-gray-300 text-sm italic text-center border-t border-border pt-3 mt-2"
                            >
                              "{leader.quote}"
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-8">
                {teamLeaders.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveLeader(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeLeader === index 
                        ? 'w-8 bg-purple-500' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Members Section */}
        <section id="members" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
              >
                <Users className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Đại Gia Đình Nghệ Thuật
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Những tâm hồn đam mê nghệ thuật, cùng nhau tỏa sáng
              </p>
            </motion.div>

            {/* Infinite Carousel */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <MemberCarousel />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            >
              {[
                { number: "20+", label: "Thành viên", icon: Users, color: "from-purple-500 to-violet-500" },
                { number: "4", label: "Ban nghệ thuật", icon: Music, color: "from-pink-500 to-rose-500" },
                { number: "20+", label: "Sự kiện/năm", icon: Calendar, color: "from-amber-500 to-orange-500" },
                { number: "5+", label: "Năm hoạt động", icon: Trophy, color: "from-emerald-500 to-teal-500" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300`} />
                  <div className="relative text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border group-hover:border-white/20 transition-colors">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-4xl sm:text-5xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative overflow-hidden">
              {/* Animated border */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 rounded-[2rem]"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative m-[2px] bg-[#0a0a0a] rounded-[calc(2rem-2px)] p-12">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-6"
                  >
                    <Heart className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                    Sẵn sàng tham gia?
                  </h2>
                  <p className="text-gray-300 mb-8 max-w-xl mx-auto text-lg">
                    Đăng nhập để quản lý quỹ CLB, theo dõi đóng góp và kết nối với các thành viên khác.
                  </p>
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-white text-purple-900 hover:bg-gray-100 px-10 py-7 text-xl rounded-full font-bold shadow-2xl shadow-white/20 hover:shadow-white/40 transition-all"
                    >
                      Đăng Nhập Ngay
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-purple-500/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Art Club Fund Manager</span>
              </div>
              <div className="flex items-center gap-6">
                {["Facebook", "Instagram", "TikTok"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                © 2026 Art Club. Made with 💜 for Bình Phan Dev
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
