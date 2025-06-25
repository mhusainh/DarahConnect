import React, { useState, useEffect } from 'react';
import { HeartIcon, UsersIcon, CalendarIcon, TrendingUpIcon, StarIcon, MapPinIcon } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, CountUp, Typewriter, Floating } from './ui/AnimatedComponents';
import { MagneticButton, ParticleBackground, MorphingShape, GradientBackground } from './ui/AdvancedAnimations';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const [currentHeroMessage, setCurrentHeroMessage] = useState(0);

  const heroMessages = [
    "Selamatkan Nyawa dengan Setetes Darah Anda",
    "Bergabunglah dengan 10,000+ Hero Donor Darah",
    "Satu Donasi = Tiga Nyawa yang Terselamatkan"
  ];

  useEffect(() => {
    // Cycle through hero messages
    const messageInterval = setInterval(() => {
      setCurrentHeroMessage(prev => (prev + 1) % heroMessages.length);
    }, 4000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  const stats = [
    { icon: <UsersIcon className="w-6 h-6" />, value: 15420, label: 'Donor Terdaftar', color: 'from-blue-500 to-blue-600' },
    { icon: <HeartIcon className="w-6 h-6" />, value: 8945, label: 'Donasi Berhasil', color: 'from-red-500 to-red-600' },
    { icon: <TrendingUpIcon className="w-6 h-6" />, value: 26835, label: 'Nyawa Diselamatkan', color: 'from-green-500 to-green-600' },
    { icon: <CalendarIcon className="w-6 h-6" />, value: 156, label: 'Event Bulan Ini', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <section className="relative min-h-screen bg-transparent backdrop-blur-sm flex items-center justify-center overflow-hidden pt-20">
      {/* Beautiful red gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900"></div>
      
      {/* Particle System */}
      <ParticleBackground particleCount={30} className="absolute inset-0 opacity-20" />

      {/* Floating Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20">
          <Floating intensity={8} duration={6}>
            <MorphingShape size={80} color="rgba(255, 255, 255, 0.1)" />
          </Floating>
        </div>
        <div className="absolute top-40 right-32">
          <Floating intensity={12} duration={8}>
            <MorphingShape size={60} color="rgba(255, 255, 255, 0.08)" />
          </Floating>
        </div>
        <div className="absolute bottom-32 left-40">
          <Floating intensity={10} duration={7}>
            <MorphingShape size={100} color="rgba(255, 255, 255, 0.06)" />
          </Floating>
        </div>
      </div>

      {/* Pulse Circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute border border-white border-opacity-20 rounded-full"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-16">
        {/* Main Hero Text */}
        <FadeIn direction="up" delay={0.2}>
          <div className="mb-12">
            <motion.div
              key={currentHeroMessage}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
                {heroMessages[currentHeroMessage]}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Bergabunglah dengan komunitas donor darah terbesar di Indonesia. Setiap donasi Anda adalah harapan baru bagi mereka yang membutuhkan.
              </p>
            </motion.div>
          </div>
        </FadeIn>

        {/* CTA Buttons */}
        <FadeIn direction="up" delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <MagneticButton 
              className="bg-white text-red-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-50 transition-all duration-300 shadow-2xl transform hover:scale-105"
              strength={0.4}
            >
              <div className="flex items-center space-x-3">
                <HeartIcon className="w-6 h-6 fill-current" />
                <span>Donasi Sekarang</span>
              </div>
            </MagneticButton>

            <MagneticButton 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-red-700 transition-all duration-300 backdrop-blur-sm"
              strength={0.3}
            >
              <div className="flex items-center space-x-3">
                <UsersIcon className="w-6 h-6" />
                <span>Bergabung Sekarang</span>
              </div>
            </MagneticButton>
          </div>
        </FadeIn>

        {/* Animated Icons */}
        <FadeIn direction="up" delay={0.8}>
          <div className="flex justify-center space-x-8 mb-16">
            {[HeartIcon, UsersIcon, StarIcon, MapPinIcon].map((Icon, index) => (
              <Floating key={index} intensity={5} duration={3 + index}>
                <motion.div
                  className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm"
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
              </Floating>
            ))}
          </div>
        </FadeIn>

        {/* Enhanced Statistics */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto" staggerDelay={0.15}>
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-center border border-white border-opacity-20"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg mb-4 shadow-lg`}
                >
                  {stat.icon}
                </motion.div>
                
                <div className="text-3xl font-bold mb-2 text-white">
                  <CountUp 
                    end={stat.value} 
                    duration={3} 
                    delay={1 + index * 0.2}
                  />
                </div>
                
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Call to Action Message */}
        <FadeIn direction="up" delay={1.2}>
          <div className="mt-16">
            <motion.p
              className="text-lg text-white/90 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ Mulai perjalanan heroik Anda hari ini ✨
            </motion.p>
          </div>
        </FadeIn>
      </div>

      {/* Scroll Indicator */}
      <FadeIn direction="up" delay={1.5}>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white bg-opacity-75 rounded-full mt-2"
            />
          </motion.div>
        </div>
      </FadeIn>
    </section>
  );
};

export default HeroSection; 