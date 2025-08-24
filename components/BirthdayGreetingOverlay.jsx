import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from 'framer-motion';

// --- HELPER COMPONENTS ---

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

// --- DECORATIVE & UI COMPONENTS ---

const ParallaxImageCard = ({ src, index }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"]
    });
  
    const x = useTransform(scrollYProgress, [0.1, 0.9], ['0%', index % 2 === 0 ? '-100%' : '100%']);
    const scale = useTransform(scrollYProgress, [0.1, 0.9], [1, 0.8]);
    const opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]);
  
    return (
      <div ref={ref} className="w-full h-[60vh] flex justify-center items-center">
        <motion.div
          className="relative w-full max-w-2xl h-full rounded-xl shadow-2xl overflow-hidden sticky top-1/4"
          style={{ x, scale, opacity }}
        >
          <img
            src={src}
            alt={`Employee memory ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      </div>
    );
  };
  


// --- MAIN BIRTHDAY GREETING OVERLAY COMPONENT ---

const BirthdayGreetingOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(true);
  const [hasAudioBeenInitiated, setHasAudioBeenInitiated] = useState(false);
  const audioRef = useRef(null);

  // Constants for customization
  const employeeName = "Kavikkannan";
  const companyName = "SourceCorp";
  const personalizedMessage = `"Your dedication and strategic vision are the bedrock of our success. Wishing you a fantastic year ahead, filled with continued achievements."`;
  const ceoName = "The CEO";
  
  // Updated with direct-view links from Google Drive
  const employeePhotos = [
    '/images/memories1.jpg',
    '/images/memories2.jpg',

  ];

  useEffect(() => {
    document.body.style.overflow = isVisible ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isVisible]);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
      setIsMuted(currentIsMuted => {
          const newMutedState = !currentIsMuted;
          if (audioRef.current) {
              audioRef.current.muted = newMutedState;
              if (!hasAudioBeenInitiated) {
                  audioRef.current.play().catch(error => console.error("Audio play failed:", error));
                  setHasAudioBeenInitiated(true);
              }
          }
          return newMutedState;
      });
      if (showUnmutePrompt) {
          setShowUnmutePrompt(false);
      }
  }

  const headlineText = `Happy Birthday, ${employeeName}`;
  const galleryTitle = "A Look Back at a Great Year";
  
  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } },
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[9999] font-sans overflow-y-auto"
    >
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#233554]" />
      <audio ref={audioRef} src="./audio/Champagni.mp3" loop />

      {/* --- UI CONTROLS --- */}
      <motion.button onClick={() => setIsVisible(false)} className="fixed top-5 right-5 text-gray-400 rounded-full w-12 h-12 flex items-center justify-center bg-black/30 z-50 backdrop-blur-sm" whileHover={{ scale: 1.15, rotate: 90, color: '#fff', boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)' }} transition={{ type: 'spring', stiffness: 300 }}>
        <Icon path="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
      </motion.button>
      
      <div className="fixed top-5 left-5 z-50">
        <motion.button onClick={toggleMute} className="text-gray-400 rounded-full w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-sm" whileHover={{ scale: 1.15, color: '#fff', boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)' }} transition={{ type: 'spring', stiffness: 300 }}>
            {isMuted ? <Icon path="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z" /> : <Icon path="M3,9H7L12,4V20L7,15H3V9M14,11H22V13H14V11Z" />}
        </motion.button>
        <AnimatePresence>
        {showUnmutePrompt && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-max bg-black/50 text-white text-xs rounded-md px-2 py-1 backdrop-blur-sm">
                Tap to unmute
            </motion.div>
        )}
        </AnimatePresence>
      </div>
      
      <div className="relative text-white w-full">
        {/* --- HERO SECTION --- */}
        <section className="h-screen flex flex-col justify-center items-center text-center p-8 relative">
          <motion.div className="flex flex-col items-center" initial="hidden" animate="visible" transition={{ staggerChildren: 0.3, delayChildren: 0.5 }}>
            <motion.img src="https://placehold.co/200x200/d4af37/0a192f?text=K" alt={employeeName} className="w-48 h-48 rounded-full object-cover border-4 border-[#d4af37]" style={{ boxShadow: '0 0 40px #d4af37, 0 0 60px #d4af37' }} variants={wordVariants}/>
            
            <motion.h1 variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="text-5xl md:text-7xl font-extrabold mt-8 bg-gradient-to-r from-gray-100 via-white to-gray-300 text-transparent bg-clip-text" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))' }}>
              {headlineText.split(' ').map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block mr-4">{word}</motion.span>
              ))}
            </motion.h1>

            <motion.p variants={wordVariants} className="mt-4 text-xl md:text-2xl text-gray-300 max-w-2xl font-light">
              From the entire team at {companyName}
            </motion.p>
          </motion.div>
        </section>

        {/* --- PARALLAX GALLERY SECTION --- */}
        <section className="relative py-20 px-8 md:px-16 max-w-3xl mx-auto" style={{ height: `${employeePhotos.length * 75}vh` }}>
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
                <motion.h2 
                    className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    {galleryTitle.split(" ").map((word, index) => (
                        <motion.span key={index} variants={wordVariants} className="inline-block mr-3">{word}</motion.span>
                    ))}
                </motion.h2>
            </div>
            {employeePhotos.map((photo, index) => (
                <ParallaxImageCard key={index} src={photo} index={index} />
            ))}
        </section>

        {/* --- PERSONALIZED MESSAGE SECTION --- */}
        <section className="relative h-screen flex flex-col justify-center items-center py-32 px-8 text-center bg-black/20 overflow-hidden">
             <motion.div
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #d4af37, transparent 60%)',
                }}
                initial={{ scale: 0, y: "50%" }}
                whileInView={{ scale: 1.5, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                <p className="text-2xl md:text-4xl max-w-4xl mx-auto text-gray-300 italic leading-relaxed">{personalizedMessage}</p>
                <p className="mt-8 text-xl text-[#d4af37] font-semibold">- {ceoName}</p>
            </motion.div>
        </section>
      </div>
    </motion.div>
  );
};

export default BirthdayGreetingOverlay;
