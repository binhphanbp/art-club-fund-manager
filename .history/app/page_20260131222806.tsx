"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mic2, Music, Disc3, Guitar, Sparkles, ArrowRight, Crown, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { useState, useEffect, useRef } from "react";

// Departments data
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

// Leadership team
const executives = [
  {
    name: "Nguyễn Văn A",
    role: "Chủ Nhiệm CLB",
    image: "/avatars/president.jpg",
    description: "Điều hành và phát triển CLB",
    badge: "President",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
  },
  {
    name: "Trần Thị B",
    role: "Phó Chủ Nhiệm",
    image: "/avatars/vice-president.jpg",
    description: "Hỗ trợ điều hành & đối ngoại",
    badge: "Vice President",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
  },
  {
    name: "Lê Văn C",
    role: "Cố Vấn CLB",
    image: "/avatars/advisor.jpg",
    description: "Định hướng & tư vấn chiến lược",
    badge: "Advisor",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
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
  },
  {
    name: "Hoàng Văn E",
    role: "Leader Team Dance",
    team: "Dance",
    image: "/avatars/dance-leader.jpg",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    name: "Vũ Thị F",
    role: "Leader Team Rap",
    team: "Rap",
    image: "/avatars/rap-leader.jpg",
    gradient: "from-amber-500 to-orange-500",
  },
];

// Club members
const members = [
  { name: "Thành viên 1", department: "Singing", image: "/avatars/member1.jpg" },
  { name: "Thành viên 2", department: "Dance", image: "/avatars/member2.jpg" },
  { name: "Thành viên 3", department: "Rap", image: "/avatars/member3.jpg" },
  { name: "Thành viên 4", department: "Instruments", image: "/avatars/member4.jpg" },
  { name: "Thành viên 5", department: "Singing", image: "/avatars/member5.jpg" },
  { name: "Thành viên 6", department: "Dance", image: "/avatars/member6.jpg" },
  { name: "Thành viên 7", department: "Rap", image: "/avatars/member7.jpg" },
  { name: "Thành viên 8", department: "Instruments", image: "/avatars/member8.jpg" },
  { name: "Thành viên 9", department: "Singing", image: "/avatars/member9.jpg" },
  { name: "Thành viên 10", department: "Dance", image: "/avatars/member10.jpg" },
];

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

// Member Slider Component
function MemberSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const itemsPerView = 5;
  const maxIndex = Math.max(0, members.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlay, maxIndex]);

  const next = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -currentIndex * (140 + 16) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {members.map((member, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 w-[140px] group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border mb-3">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-pink-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-medium truncate">{member.name}</p>
                  <p className="text-purple-300 text-[10px]">{member.department}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Navigation buttons */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen mesh-gradient overflow-hidden">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-16">
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * -100 - 50],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: Math.random() * 2,
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
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
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
                  className="group bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
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
        <section id="departments" className="py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
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
                <div className={`absolute inset-0 bg-linear-to-br ${dept.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${dept.gradient} flex items-center justify-center mb-4 shadow-lg`}>
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
                <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-linear-to-br ${dept.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-30 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Leadership Section */}
        <section id="leadership" className="py-20 px-4 sm:px-6 lg:px-8 relative">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-300">Ban Chủ Nhiệm</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Đội Ngũ Lãnh Đạo
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Những người dẫn dắt và truyền cảm hứng cho CLB
              </p>
            </motion.div>

            {/* Executive Team - 3 người nổi bật */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            >
              {executives.map((exec, index) => (
                <motion.div
                  key={exec.name}
                  variants={cardVariants}
                  whileHover={{ y: -10 }}
                  className={`relative group ${index === 0 ? 'md:col-span-1' : ''}`}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${exec.gradient} rounded-3xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden">
                    {/* Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-linear-to-r ${exec.gradient} text-white text-xs font-semibold`}>
                      {exec.badge}
                    </div>
                    
                    {/* Avatar */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className={`absolute inset-0 bg-linear-to-br ${exec.gradient} rounded-full animate-pulse`} />
                      <div className="absolute inset-1 bg-card rounded-full flex items-center justify-center">
                        <div className={`w-28 h-28 rounded-full bg-linear-to-br ${exec.gradient} flex items-center justify-center text-white font-bold text-4xl`}>
                          {exec.name.charAt(0)}
                        </div>
                      </div>
                      {/* Crown for president */}
                      {index === 0 && (
                        <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-1">{exec.name}</h3>
                      <p className={`text-transparent bg-linear-to-r ${exec.gradient} bg-clip-text font-semibold mb-2`}>
                        {exec.role}
                      </p>
                      <p className="text-gray-400 text-sm">{exec.description}</p>
                    </div>

                    {/* Decorative elements */}
                    <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-linear-to-br ${exec.gradient} opacity-10 rounded-full blur-2xl`} />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Team Leaders Section */}
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

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {teamLeaders.map((leader) => (
                <motion.div
                  key={leader.name}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03 }}
                  className="group relative"
                >
                  <div className="bg-card border border-border rounded-2xl p-6 overflow-hidden">
                    {/* Team badge */}
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full bg-linear-to-r ${leader.gradient} text-white text-xs font-medium`}>
                      {leader.team}
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${leader.gradient} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0`}>
                        {leader.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{leader.name}</h4>
                        <p className="text-gray-400 text-sm">{leader.role}</p>
                      </div>
                    </div>

                    {/* Hover effect */}
                    <div className={`absolute inset-0 bg-linear-to-br ${leader.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Members Section */}
        <section id="members" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Thành Viên CLB
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Đại gia đình nghệ thuật của chúng tôi
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="px-8"
            >
              <MemberSlider />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {[
                { number: "50+", label: "Thành viên" },
                { number: "4", label: "Ban nhạc" },
                { number: "20+", label: "Sự kiện/năm" },
                { number: "3+", label: "Năm hoạt động" },
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-card/50 rounded-2xl border border-border">
                  <div className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative bg-linear-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-12 border border-purple-500/20 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Sẵn sàng tham gia?
                </h2>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                  Đăng nhập để quản lý quỹ CLB, theo dõi đóng góp và kết nối với các thành viên khác.
                </p>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full font-semibold"
                  >
                    Đăng Nhập Ngay
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">Art Club Fund Manager</span>
              </div>
              <p className="text-gray-500 text-sm">
                © 2026 Art Club. Made with 💜 for artists.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
