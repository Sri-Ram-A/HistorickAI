"use client";
// Your imports and component code
import { motion } from "framer-motion";
import { Instagram, Mail, Linkedin } from "lucide-react";
import { teamMembers, testimonials } from "@/data";
import '../globals.css';

const About = () => {
  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="zap-grad" x1="0" x2="24" y1="0" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f472b6" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <path d="M7 12L17 2V10H21L11 22V14H7V12Z" stroke="url(#zap-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Lightning Fast",
      description: "Generate professional videos in seconds, not hours"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="star-grad" x1="0" x2="24" y1="0" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a78bfa" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <path d="M12 2L15 8.5L22 9.2L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.2L9 8.5L12 2Z" stroke="url(#star-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Premium Quality",
      description: "AI-powered technology ensures broadcast-quality output"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="target-grad" x1="0" x2="24" y1="0" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10" stroke="url(#target-grad)" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="url(#target-grad)" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" stroke="url(#target-grad)" strokeWidth="2" />
        </svg>
      ),
      title: "Precision Targeting",
      description: "Customize content for specific audiences and platforms"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="users-grad" x1="0" x2="24" y1="0" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818cf8" />
              <stop offset="1" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <path d="M7 21V19C7 17.8954 7.89543 17 9 17H15C16.1046 17 17 17.8954 17 19V21" stroke="url(#users-grad)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="11" r="4" stroke="url(#users-grad)" strokeWidth="2" />
        </svg>
      ),
      title: "Team Collaboration",
      description: "Seamless workflow for teams of any size"
    }
  ];

  return (
    <div className="min-h-screen bg-space-dark text-white overflow-hidden relative">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0">
          {/* Gradient BG, deep space theme */}
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-rose-400/30 via-fuchsia-500/30 to-indigo-500/40" />
          {/* Decorative gradient orbs */}
          <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
          <motion.div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
        </div>
        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 space-y-8">
          {/* Main Heading with Glow */}
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-8xl font-bold bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl transition-colors">
              Dream Video Factory
              <span className="absolute ml-2 -top-2 text-yellow-300 text-4xl animate-pulse">✨</span>
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 via-fuchsia-500/30 to-indigo-500/30 blur-2xl rounded-full -z-10"></div>
          </div>
          {/* Subheading w/ border blur and gradient text */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/80 to-blue-500/70 rounded-xl blur-md opacity-60 -z-10"></div>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-inner shadow-cyan-500/10">
              Pioneering the future of content creation with <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-semibold">cutting-edge AI</span> that transforms ideas into stunning visual experiences
            </p>
          </div>
        </div>

        {/* Animated scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-8 h-14 rounded-full border-2 border-space-cyan/50 flex justify-center p-1 bg-gradient-to-r from-fuchsia-500/20 to-blue-400/20">
            <motion.div
              className="w-2 h-2 bg-space-cyan rounded-full"
              animate={{ y: [0, 10] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </section>
      {/* FEATURES */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Glowing border, using hero gradient! */}
              <div className="absolute inset-0 pointer-events-none rounded-xl opacity-80 blur-sm bg-gradient-to-br from-rose-400/40 via-fuchsia-500/40 to-indigo-500/40 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-space-dark/80 backdrop-blur-lg border border-white/10 rounded-xl p-9 h-full z-10 group-hover:shadow-xl group-hover:border-cyan-400/40 transition-all duration-300">
                <div className="mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white tracking-wide">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* TEAM */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent mb-3">Meet Our Visionaries</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our diverse team of innovators, creators, and technologists are united by a shared passion for pushing the boundaries of what's possible in video technology.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* RADIAL OUTLINE */}
              <div className="absolute inset-0 opacity-70 blur-2xl z-0 rounded-xl bg-gradient-to-br from-fuchsia-400/25 via-purple-900/5 to-amber-400/15 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-space-dark/90 border border-space-cyan/30 rounded-xl p-7 text-center h-full group-hover:shadow-xl group-hover:border-space-orange/70 transition-all duration-300 z-10 overflow-hidden">
                {/* Avatar with thick gradient border */}
                <div className="relative mb-6 mx-auto w-28 h-28">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 rounded-full p-[3px] animate-spin-slow [animation-duration:9s] group-hover:[animation-duration:4s] shadow-2xl"></div>
                  <div className="relative w-full h-full rounded-full bg-space-dark overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-1 text-white">{member.name}</h3>
                <p className="text-space-orange font-medium mb-3">{member.role}</p>
                {/* Social Icons */}
                <div className="flex justify-center space-x-3 mt-6">
                  {[
                    { icon: Instagram, href: member.instagram },
                    { icon: Linkedin, href: member.linkedin },
                    { icon: Mail, href: `mailto:${member.mail}` } // Added mailto: for email links
                  ].map(({ icon: Icon, href }, i) =>
                    <a
                      key={i}
                      href={href}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-orange-300 hover:text-white hover:border-orange-300 transition-all duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* TESTIMONIALS */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-cyan-400 to-fuchsia-500 bg-clip-text text-transparent mb-3">
            Voices of Innovation
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how industry leaders are transforming their content creation with Dream Video Factory
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative`}
            >
              {/* Outer Glow & Border using bg-gradient */}
              <div className="absolute inset-0 pointer-events-none rounded-xl opacity-60 blur-sm bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/30 to-orange-200/30 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-space-dark/80 shadow-lg backdrop-blur-md border border-white/10 rounded-xl p-10 h-full z-10 group-hover:shadow-cyan-500/10 group-hover:border-cyan-400/40 transition-all duration-300 overflow-hidden">
                {/* Decorative super-quote */}
                <div className="absolute -top-2 right-6 text-7xl text-indigo-500/15 font-serif leading-none select-none pointer-events-none z-0">"</div>
                <blockquote className="text-gray-300 mb-6 leading-relaxed italic relative z-10">
                  {testimonial.quote}
                </blockquote>
                <div className="flex items-center gap-4 mt-8">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 p-0.5 shadow-lg">
                      <img
                        src={testimonial.src}
                        alt={testimonial.name}
                        className="w-full h-full rounded-full object-cover bg-space-dark"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-space-orange text-sm">{testimonial.designation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* FOOTER */}
      <footer className="relative bg-space-dark py-16 px-4 border-t border-white/10 overflow-hidden z-20">
        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-br from-cyan-400 via-fuchsia-400 to-orange-200 rounded-full"
              style={{ top: `${Math.random() * 99}%`, left: `${Math.random() * 99}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0], scale: [1, 1.7, 1] }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
            />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo section */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-400 mr-3 shadow-xl"></div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                  Dream Video Factory
                </h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                Transforming the landscape of digital content creation through innovative AI technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-space-orange">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-space-cyan transition-colors duration-300">Home</a></li>
                <li><a href="/about" className="hover:text-space-cyan transition-colors duration-300">About</a></li>
                <li><a href="/video_generator" className="hover:text-space-cyan transition-colors duration-300">Create Video</a></li>
                <li><a href="/contact" className="hover:text-space-cyan transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-space-orange">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-space-cyan transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-space-cyan transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-space-cyan transition-colors duration-300">API Reference</a></li>
                <li><a href="#" className="hover:text-space-cyan transition-colors duration-300">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Dream Video Factory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <style>
        {`
          .animate-spin-slow {
            animation: spin 9s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
};

export default About;

