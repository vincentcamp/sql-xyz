"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RocketIcon, 
  GamepadIcon, 
  WrenchIcon, 
  GraduationCapIcon, 
  BookmarkIcon,
  SparklesIcon,
  TrophyIcon,
  LightbulbIcon,
  UsersIcon,
  CommandIcon,
  DatabaseIcon,
  CodeIcon,
  ZapIcon,
  SearchIcon,
  CheckIcon,
  KeyIcon,
  TrashIcon,
  HelpCircleIcon,
  ClockIcon
} from 'lucide-react';

// Daily SQL challenge data
const dailyChallenges = [
  {
    id: 1,
    title: "Find the Missing Orders",
    description: "Can you identify which orders disappeared during the server migration?",
    difficulty: "Easy",
    points: 100,
    icon: <SearchIcon className="h-5 w-5 text-yellow-400" />
  },
  {
    id: 2,
    title: "Calculate Customer Lifetime Value",
    description: "Write a query to find your most valuable customers based on order history.",
    difficulty: "Medium",
    points: 250,
    icon: <UsersIcon className="h-5 w-5 text-yellow-400" />
  },
  {
    id: 3,
    title: "Optimize the Monster Query",
    description: "This query takes 2 minutes to run. Can you make it run in under 5 seconds?",
    difficulty: "Hard",
    points: 500,
    icon: <ZapIcon className="h-5 w-5 text-yellow-400" />
  },
  {
    id: 4,
    title: "Find the Data Anomaly",
    description: "Something&apos;s wrong with the data. Use SQL to identify the corruption pattern.",
    difficulty: "Medium",
    points: 300,
    icon: <HelpCircleIcon className="h-5 w-5 text-yellow-400" />
  },
  {
    id: 5,
    title: "Database Cleanup",
    description: "The database is full of duplicate records. Write a query to identify and clean them.",
    difficulty: "Medium",
    points: 275,
    icon: <TrashIcon className="h-5 w-5 text-yellow-400" />
  }
];

// SQL code snippets for floating elements
const sqlSnippets = [
  "SELECT * FROM games WHERE fun_level > 9000;",
  "JOIN users ON users.curiosity = 'extreme';",
  "GROUP BY excitement HAVING COUNT(*) > 100;",
  "CREATE TABLE awesome_skills (id INT, name VARCHAR(255));",
  "UPDATE knowledge SET level = 'expert' WHERE practice = true;",
  "WHERE imagination IS NOT NULL;",
  "ORDER BY creativity DESC;",
  "ALTER TABLE skills ADD COLUMN sql_mastery INT;",
  "INSERT INTO brain (knowledge) VALUES ('SQL magic');",
  "DELETE FROM frustration WHERE sql_xyz = visited;",
  "SELECT fun, learning FROM sql_games;",
  "DROP TABLE boredom;"
];

// Cursor particle effect component
const CursorParticleEffect = () => {
  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    lifetime: number;
  }
  
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent): void => {
      // Add new particle on mouse move
      if (Math.random() > 0.7) { 
        const newParticle: Particle = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 20 + 10,
          color: ['#60A5FA', '#8B5CF6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 4)],
          lifetime: Math.random() * 1000 + 500 // Particle lifetime between 0.5-1.5 seconds
        };
        
        setParticles(prev => [...prev, newParticle]);
        
        // Remove particle after its lifetime
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, newParticle.lifetime);
      }
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-30"
          initial={{ 
            x: particle.x, 
            y: particle.y,
            opacity: 0.7,
            scale: 1 
          }}
          animate={{ 
            x: particle.x + (Math.random() * 100 - 50), 
            y: particle.y + (Math.random() * 100 - 50),
            opacity: 0,
            scale: 0 
          }}
          transition={{ 
            duration: particle.lifetime / 1000,
            ease: "easeOut"
          }}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 10px ${particle.color}`,
            marginLeft: `-${particle.size / 2}px`,
            marginTop: `-${particle.size / 2}px`,
          }}
        />
      ))}
    </div>
  );
};

// Terminal-like typing effect component
interface TypewriterEffectProps {
  text: string;
  className?: string;
  speed?: number;
}

const TypewriterEffect = ({ text, className, speed = 50 }: TypewriterEffectProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blinkCursor, setBlinkCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Typing is done, blink the cursor
      const blinkInterval = setInterval(() => {
        setBlinkCursor(prev => !prev);
      }, 500);
      return () => clearInterval(blinkInterval);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className={`font-mono ${className}`}>
      {displayText}
      {blinkCursor && currentIndex >= text.length && <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>}
      {currentIndex < text.length && <span className="inline-block w-2 h-4 bg-blue-400 ml-1"></span>}
    </div>
  );
};

// Matrix-like raining code effect
const MatrixRain = () => {
  const characters = '01{}[]()SELECT FROM WHERE JOIN GROUP BY ORDER HAVING AND OR NOT NULL IS TRUE FALSE';
  const columnCount = 50; // Number of columns
  interface MatrixColumn {
    chars: string[];
    x: number;
    speed: number;
    opacity: number;
  }
  
  const [columns, setColumns] = useState<MatrixColumn[]>([]);

  useEffect(() => {
    // Initialize columns
    const initialColumns = [];
    for (let i = 0; i < columnCount; i++) {
      initialColumns.push({
        chars: Array(20).fill(undefined).map(() => characters[Math.floor(Math.random() * characters.length)]),
        x: (window.innerWidth / columnCount) * i,
        speed: Math.random() * 20 + 10,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
    setColumns(initialColumns);

    // Update matrix every frame
    const interval = setInterval(() => {
      setColumns(prevColumns => {
        return prevColumns.map(col => {
          // Shift characters down and add a new one at the top
          const newChars = [...col.chars];
          newChars.shift();
          newChars.push(characters[Math.floor(Math.random() * characters.length)]);
          
          return {
            ...col,
            chars: newChars
          };
        });
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {columns.map((col, colIndex) => (
        <div 
          key={colIndex} 
          className="absolute top-0 text-blue-500 font-mono text-xs whitespace-pre"
          style={{ 
            left: col.x, 
            opacity: col.opacity,
            transform: `translateY(${performance.now() / col.speed % 100}%)`,
            transition: 'transform linear'
          }}
        >
          {col.chars.map((char, charIndex) => (
            <div 
              key={charIndex}
              style={{ 
                opacity: 1 - (charIndex / col.chars.length),
                color: charIndex === 0 ? '#60A5FA' : undefined
              }}
            >
              {char}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Floating database icons component
const FloatingDatabaseIcons = () => {
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Don't render floating elements until client-side hydration is complete
  if (!isMounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * windowDimensions.width, 
            y: -30,
            opacity: Math.random() * 0.3 + 0.1,
            rotate: Math.random() * 20 - 10
          }}
          animate={{ 
            y: windowDimensions.height + 30,
            rotate: Math.random() * 360,
            opacity: [
              Math.random() * 0.3 + 0.1,
              Math.random() * 0.4 + 0.2,
              0
            ]
          }}
          transition={{ 
            duration: Math.random() * 20 + 30,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            times: [0, 0.8, 1]
          }}
          className="absolute text-blue-500 text-lg"
        >
          {Math.random() > 0.5 ? (
            <DatabaseIcon size={Math.random() * 15 + 10} />
          ) : (
            <div className="font-mono text-xs whitespace-nowrap">
              {sqlSnippets[Math.floor(Math.random() * sqlSnippets.length)]}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Animated card component with hover effects
type ColorScheme = 'blue' | 'teal' | 'purple' | 'amber';

const AnimatedCard = ({ 
  children, 
  delay, 
  colorScheme = "blue" as ColorScheme, 
  className = "" 
}: { 
  children: React.ReactNode; 
  delay: number; 
  colorScheme?: ColorScheme; 
  className?: string 
}) => {
  const baseHoverClasses = "transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]";
  const colorSchemes: Record<ColorScheme, string> = {
    blue: "hover:border-blue-400 group-hover:text-blue-300",
    teal: "hover:border-teal-400 group-hover:text-teal-300",
    purple: "hover:border-purple-400 group-hover:text-purple-300",
    amber: "hover:border-amber-400 group-hover:text-amber-300",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6, 
        delay: delay * 0.1,
        type: "spring",
        stiffness: 50
      }}
      className={className}
    >
      <div className={`${baseHoverClasses} ${colorSchemes[colorScheme]} h-full group`}>
        {children}
      </div>
    </motion.div>
  );
};

// Glowing ring component 
const GlowingRings = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div 
          className="w-[800px] h-[800px] rounded-full border-2 border-blue-500/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.3, 0.1],
            rotate: 360
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 border-purple-500/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [1, 0.7, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: -360
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-teal-500/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.6, 1.1, 0.6],
            opacity: [0.3, 0.5, 0.3],
            rotate: 180
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
};

// Star field effect
const StarField = () => {
  const stars = Array.from({ length: 200 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.2,
    blinkDuration: Math.random() * 3 + 2
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-blue-100"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 1.5, star.opacity]
          }}
          transition={{
            duration: star.blinkDuration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Main HomePage component
export default function HomePage() {
  const [dailyChallenge, setDailyChallenge] = useState(dailyChallenges[0]);
  const [userPoints, setUserPoints] = useState(0);
  const [glowEffect, setGlowEffect] = useState(false);
  const [hoverButton, setHoverButton] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [matrixVisible, setMatrixVisible] = useState(true);

  const mainContentRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mainContentRef,
    offset: ["start start", "end end"]
  });
  
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const titleY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);
  
  const sqlTips = [
    "Use INDEX hints to optimize complex queries",
    "Remember to normalize your database design",
    "EXPLAIN your queries to understand execution plans",
    "Common Table Expressions make complex queries readable",
    "Use prepared statements to prevent SQL injection"
  ];
  
  // Define global styles
  const globalStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse-slow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }

    @keyframes text-shimmer {
      0% { text-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
      50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4); }
      100% { text-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
    }

    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(10px, -10px) scale(1.1); }
      50% { transform: translate(0, 10px) scale(0.9); }
      75% { transform: translate(-10px, -10px) scale(1.05); }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    .animate-pulse-slow {
      animation: pulse-slow 4s ease-in-out infinite;
    }

    .animate-text-shimmer {
      animation: text-shimmer 2s ease-in-out infinite;
    }

    .animate-blob {
      animation: blob 10s infinite;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }

    .animation-delay-4000 {
      animation-delay: 4s;
    }

    .perspective-text {
      transform: perspective(800px) rotateX(10deg);
    }
  `;

  // Add global styles to document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [globalStyles]);
  
  // Select a random daily challenge
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * dailyChallenges.length);
    setDailyChallenge(dailyChallenges[randomIndex]);
    
    // Enable particles after a delay
    setTimeout(() => {
      setShowParticles(true);
    }, 2000);
    
    // Rotate SQL tips
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % sqlTips.length);
    }, 5000);
    
    // Hide matrix rain after 10 seconds
    setTimeout(() => {
      setMatrixVisible(false);
    }, 10000);
    
    return () => clearInterval(tipInterval);
  }, [sqlTips.length]);

  // Create a glow effect on the SQL logo every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowEffect(true);
      setTimeout(() => setGlowEffect(false), 1500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Function to simulate terminal output
  const executeCommand = (command: string): void => {
    setButtonClicked(true);
    setIsTerminalVisible(true);
    setTerminalOutput((prev: string[]) => [...prev, `> ${command}`]);
    
    // Simulate processing
    setTimeout(() => {
      let response: string = "Command executed successfully!";
      
      if (command.toLowerCase().includes("select")) {
        response = "Query returned 42 rows in 0.003s";
      } else if (command.toLowerCase().includes("update")) {
        response = "Updated 17 rows. Transaction completed.";
      } else if (command.toLowerCase().includes("delete")) {
        response = "Deleted 7 rows. Transaction completed.";
      } else if (command.toLowerCase().includes("help")) {
        response = "Available commands: SELECT, UPDATE, DELETE, HELP, EXIT";
      }
      
      setTerminalOutput((prev: string[]) => [...prev, response]);
      
      // Increment points for user
      if (Math.random() > 0.5) {
        const points: number = Math.floor(Math.random() * 100) + 10;
        setUserPoints((prev: number) => prev + points);
        setTerminalOutput((prev: string[]) => [...prev, `+${points} points earned!`]);
      }
    }, 500);
  };
  
  // Toggle database spin effect
  const toggleSpin = () => {
    setIsSpinning(prev => !prev);
    
    if (!isSpinning) {
      executeCommand("SELECT fun FROM sql_games WHERE spin = true");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background effects */}
      {matrixVisible && <MatrixRain />}
      <GlowingRings />
      <StarField />
      {showParticles && <CursorParticleEffect />}
      
      <div ref={mainContentRef}>
        {/* Hero Section */}
        <motion.section 
          className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden"
          style={{ opacity: backgroundOpacity }}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1,
              type: "spring",
              stiffness: 50
            }}
            style={{ scale: titleScale, y: titleY }}
            className={`text-8xl font-extrabold mb-6 perspective-text ${glowEffect ? 'animate-text-shimmer' : ''}`}
          >
            <span className="inline-block animate-float text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              SQL<span className="animate-pulse">.</span>xyz
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.5,
              duration: 0.8,
              type: "spring"
            }}
            className="relative mb-10"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-medium text-blue-300 mb-1 relative z-10"
              animate={{ 
                textShadow: ["0 0 8px rgba(59,130,246,0.1)", "0 0 16px rgba(59,130,246,0.4)", "0 0 8px rgba(59,130,246,0.1)"] 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Where SQL Becomes an Adventure
            </motion.h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-pulse"></div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="max-w-3xl text-xl text-gray-300 mb-10 leading-relaxed"
          >
            Discover interactive games, powerful tools, and engaging challenges that make learning and mastering SQL an addictive experience.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoverButton('play')}
              onHoverEnd={() => setHoverButton(null)}
            >
              <Button 
                size="lg" 
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 overflow-hidden group"
                onClick={() => executeCommand("SELECT * FROM games WHERE status = 'amazing'")}
              >
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20"
                  animate={{ 
                    x: ['-100%', '100%'],
                    opacity: [0, 0.3, 0] 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut" 
                  }}
                />
                <GamepadIcon className="mr-2 h-5 w-5 animate-bounce" /> 
                <span>Play Now</span>
                
                {hoverButton === 'play' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 w-full h-1 bg-white"
                    layoutId="buttonHighlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoverButton('learn')}
              onHoverEnd={() => setHoverButton(null)}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-900/20 text-lg px-8 py-6 group"
                onClick={() => executeCommand("UPDATE skills SET level = 'expert' WHERE user = 'you'")}
              >
                <GraduationCapIcon className="mr-2 h-5 w-5 group-hover:animate-spin" /> 
                <span>Start Learning</span>
                
                {hoverButton === 'learn' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 w-full h-1 bg-white"
                    layoutId="buttonHighlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </Button>
            </motion.div>
          </motion.div>
          
          {/* SQL Tip of the moment */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute bottom-10 left-0 right-0 mx-auto max-w-md"
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTipIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/60 backdrop-blur-sm p-3 rounded-lg border border-blue-500/30 flex items-center"
              >
                <LightbulbIcon className="text-yellow-400 h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-300 italic">
                  <span className="text-blue-300 font-semibold">SQL Tip:</span> {sqlTips[currentTipIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Scroll down indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <div className="flex flex-col items-center text-blue-400">
              <span className="text-sm mb-2">Scroll to explore</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
          
          {/* Floating database icons */}
          <FloatingDatabaseIcons />

          {/* Interactive Database Icon */}
          <motion.div 
            className="absolute bottom-24 right-12 cursor-pointer hidden lg:block"
            whileHover={{ scale: 1.2 }}
            whileTap={{ rotate: 180 }}
            animate={isSpinning ? { rotate: 360 } : {}}
            transition={isSpinning ? { 
              rotate: { repeat: Infinity, duration: 2, ease: "linear" } 
            } : {}}
            onClick={toggleSpin}
          >
            <div className="relative">
              <DatabaseIcon 
                size={60} 
                className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
              />
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                animate={{
                  boxShadow: ["0 0 0px rgba(59,130,246,0.2)", "0 0 20px rgba(59,130,246,0.6)", "0 0 0px rgba(59,130,246,0.2)"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1">
                <ZapIcon size={16} className="text-white" />
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Terminal Modal */}
        <AnimatePresence>
          {isTerminalVisible && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTerminalVisible(false)}
            >
              <motion.div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div 
                className="bg-slate-900 border border-blue-500/50 rounded-lg w-full max-w-2xl overflow-hidden z-10"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm text-gray-400">SQL.xyz Terminal</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => setIsTerminalVisible(false)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="p-4 font-mono text-sm text-green-400 h-64 overflow-y-auto">
                  <p className="text-blue-400 mb-2">SQL.xyz Terminal v1.0</p>
                  <p className="text-gray-400 mb-4">Type SQL commands or try our interactive demos</p>
                  
                  {terminalOutput.map((line: string, i) => (
                    <div key={i} className={`mb-1 ${line.startsWith('>') ? 'text-white' : 'text-green-400'}`}>
                      {line}
                    </div>
                  ))}
                  
                  <TypewriterEffect 
                    text="Type your SQL command..."
                    className="text-gray-500 mt-2"
                    speed={80}
                  />
                </div>
                <div className="bg-slate-800 p-3 flex">
                  <input 
                    type="text" 
                    className="flex-grow bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter SQL command..."
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        executeCommand(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button 
                    className="ml-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => executeCommand("SELECT * FROM challenges WHERE fun_level = 'maximum'")}
                  >
                    Run
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Challenge */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute h-40 w-40 rounded-full bg-blue-600/30 blur-3xl top-1/4 left-1/4 animate-blob"></div>
            <div className="absolute h-40 w-40 rounded-full bg-purple-600/30 blur-3xl bottom-1/4 right-1/4 animate-blob animation-delay-2000"></div>
            <div className="absolute h-40 w-40 rounded-full bg-pink-600/20 blur-3xl top-3/4 left-1/2 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative">
            <motion.div 
              className="flex justify-between items-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                <div className="relative">
                  <SparklesIcon className="h-8 w-8 text-yellow-400 mr-3" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    <SparklesIcon className="h-8 w-8 text-yellow-400" />
                  </motion.div>
                </div>
                <h2 className="text-3xl font-bold text-white">Daily SQL Challenge</h2>
              </div>
              <motion.div 
                className="flex items-center bg-slate-700/50 py-2 px-4 rounded-full border border-yellow-500/30"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: buttonClicked ? 
                    ["0 0 0px rgba(234,179,8,0.2)", "0 0 20px rgba(234,179,8,0.6)", "0 0 0px rgba(234,179,8,0.2)"] : 
                    "none"
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: 3,
                    ease: "easeInOut"
                  }
                }}
              >
                <TrophyIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-semibold">{userPoints} Points</span>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-slate-700/80 backdrop-blur-sm border-blue-500/50 overflow-hidden relative group">
                <motion.div
                  className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl z-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 relative z-10">
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <CardTitle className="text-2xl text-white flex items-center">
                    {dailyChallenge.icon || <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />}
                    <span className="ml-2">{dailyChallenge.title}</span>
                    <Badge variant="outline" className="ml-3 bg-blue-900/50 group-hover:bg-blue-800/50 transition-colors">
                      {dailyChallenge.difficulty}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    Solve this challenge to earn {dailyChallenge.points} points!
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6 relative z-10">
                  <p className="text-gray-200 mb-6 text-lg">{dailyChallenge.description}</p>
                  
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-6 border border-blue-500/20 font-mono text-sm">
                    <TypewriterEffect 
                      text="-- Write your SQL query here to solve the challenge"
                      className="text-blue-400 mb-2"
                      speed={30}
                    />
                    <TypewriterEffect 
                      text="SELECT * FROM ..."
                      className="text-gray-400"
                      speed={80}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-5 relative overflow-hidden group"
                        onClick={() => {
                          executeCommand(`-- Solving challenge: ${dailyChallenge.title}`);
                          setUserPoints(prev => prev + dailyChallenge.points);
                        }}
                      >
                        <motion.span 
                          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                          animate={{ 
                            x: ['-100%', '100%']
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        />
                        Accept Challenge
                        <ZapIcon className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
                
                {/* Decorative SQL code in the background */}
                <div className="absolute -bottom-10 -left-10 opacity-5 text-sm font-mono transform rotate-12">
                  SELECT * FROM challenges<br/>
                  WHERE difficulty = '{dailyChallenge.difficulty}'<br/>
                  AND points &gt; 50<br/>
                  ORDER BY created_at DESC<br/>
                  LIMIT 1;
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Featured Content Tabs */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'linear'
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              backgroundSize: '100% 100%'
            }}
          />
          
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Discover SQL Adventures</h2>
              <p className="text-xl text-blue-300 max-w-3xl mx-auto">
                From mind-bending challenges to powerful tools - everything you need to master SQL.
              </p>
            </motion.div>
            
            <Tabs defaultValue="all" className="w-full">
              <motion.div 
                className="flex justify-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TabsList className="bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-full border border-blue-500/20">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: ["0 0 0px rgba(59,130,246,0.1)", "0 0 15px rgba(59,130,246,0.3)", "0 0 0px rgba(59,130,246,0.1)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white text-lg px-6 py-2 rounded-full transition-all duration-300"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="games" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white text-lg px-6 py-2 rounded-full transition-all duration-300"
                  >
                    <GamepadIcon className="mr-2 h-4 w-4" /> Games
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tools" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-teal-500 data-[state=active]:text-white text-lg px-6 py-2 rounded-full transition-all duration-300"
                  >
                    <WrenchIcon className="mr-2 h-4 w-4" /> Tools
                  </TabsTrigger>
                  <TabsTrigger 
                    value="learning" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white text-lg px-6 py-2 rounded-full transition-all duration-300"
                  >
                    <GraduationCapIcon className="mr-2 h-4 w-4" /> Learning
                  </TabsTrigger>
                  <TabsTrigger 
                    value="community" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-500 data-[state=active]:text-white text-lg px-6 py-2 rounded-full transition-all duration-300"
                  >
                    <UsersIcon className="mr-2 h-4 w-4" /> Community
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              {/* All Content Tab */}
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* SQL Murder Mystery */}
                  <AnimatedCard delay={0} colorScheme="purple">
                    <Card className="bg-slate-700/80 backdrop-blur-sm border-blue-500/30 h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-shadow duration-300 cursor-pointer group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 mb-2 py-1.5 px-3 text-white">
                            <GamepadIcon className="h-3.5 w-3.5 mr-1.5" /> Game
                          </Badge>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-2xl text-white group-hover:text-purple-300 transition-colors flex items-center">
                          <motion.div
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ 
                              duration: 5,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut",
                              times: [0, 0.2, 0.5, 0.8, 1]
                            }}
                            className="mr-3 text-2xl"
                          >
                            🔍
                          </motion.div>
                          SQL Murder Mystery
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">Solve a murder case using SQL queries</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl animate-pulse-slow"></div>
                        <p className="text-gray-300 mb-4">Use SQL to search a database of suspects and solve the murder mystery. Perfect for SQL beginners and experts alike.</p>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 font-mono text-xs text-gray-400 mb-4">
                          <span className="text-purple-400">SELECT</span> * <span className="text-purple-400">FROM</span> suspects <span className="text-purple-400">WHERE</span> location = <span className="text-green-400">'crime_scene'</span> <span className="text-purple-400">AND</span> time = <span className="text-green-400">'murder_time'</span>;
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <UsersIcon className="h-4 w-4 mr-1" /> 50k+ players
                        </div>
                        <Link href="https://mystery.knightlab.com" target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="group-hover:bg-purple-900/30 transition-colors flex items-center">
                            Play Now
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              className="ml-2"
                            >
                              →
                            </motion.div>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </AnimatedCard>

                  {/* SQL Island */}
                  <AnimatedCard delay={1} colorScheme="purple">
                    <Card className="bg-slate-700/80 backdrop-blur-sm border-blue-500/30 h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-shadow duration-300 cursor-pointer group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 mb-2 py-1.5 px-3 text-white">
                            <GamepadIcon className="h-3.5 w-3.5 mr-1.5" /> Game
                          </Badge>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-2xl text-white group-hover:text-purple-300 transition-colors flex items-center">
                          <motion.div
                            animate={{ 
                              y: [0, -5, 0],
                              rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut"
                            }}
                            className="mr-3 text-2xl"
                          >
                            🏝️
                          </motion.div>
                          SQL Island
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">Survive on an island using SQL</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/5 rounded-full blur-xl animate-pulse-slow"></div>
                        <p className="text-gray-300 mb-4">Stranded after a plane crash, use SQL queries to interact with islanders, find food and eventually escape.</p>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 font-mono text-xs text-gray-400 mb-4">
                          <span className="text-purple-400">SELECT</span> name, skill <span className="text-purple-400">FROM</span> islanders <span className="text-purple-400">WHERE</span> friendly = <span className="text-green-400">TRUE</span> <span className="text-purple-400">ORDER BY</span> helpfulness <span className="text-purple-400">DESC</span>;
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <UsersIcon className="h-4 w-4 mr-1" /> 30k+ players
                        </div>
                        <Link href="https://sql-island.informatik.uni-kl.de" target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="group-hover:bg-purple-900/30 transition-colors flex items-center">
                            Play Now
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              className="ml-2"
                            >
                              →
                            </motion.div>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </AnimatedCard>

                  {/* SQL Squid Game */}
                  <AnimatedCard delay={2} colorScheme="purple">
                    <Card className="bg-slate-700/80 backdrop-blur-sm border-blue-500/30 h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-shadow duration-300 cursor-pointer group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 mb-2 py-1.5 px-3 text-white">
                            <GamepadIcon className="h-3.5 w-3.5 mr-1.5" /> Game
                          </Badge>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-2xl text-white group-hover:text-purple-300 transition-colors flex items-center">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut"
                            }}
                            className="mr-3 text-2xl"
                          >
                            🦑
                          </motion.div>
                          SQL Squid Game
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">SQL challenges inspired by the hit show</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="absolute -top-20 -left-10 w-20 h-20 bg-purple-500/5 rounded-full blur-xl animate-pulse-slow"></div>
                        <p className="text-gray-300 mb-4">Help the Front Man analyze player data and identify rogue guards through 9 progressively difficult SQL challenges.</p>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 font-mono text-xs text-gray-400 mb-4">
                          <span className="text-purple-400">SELECT</span> player_id, survival_chance <span className="text-purple-400">FROM</span> players <span className="text-purple-400">WHERE</span> game_status = <span className="text-green-400">'active'</span> <span className="text-purple-400">ORDER BY</span> debt <span className="text-purple-400">DESC</span>;
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <UsersIcon className="h-4 w-4 mr-1" /> 15k+ players
                        </div>
                        <Link href="https://sqlsquidgame.com" target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="group-hover:bg-purple-900/30 transition-colors flex items-center">
                            Play Now
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              className="ml-2"
                            >
                              →
                            </motion.div>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </AnimatedCard>

                  {/* BlazeSQL */}
                  <AnimatedCard delay={3} colorScheme="blue">
                    <Card className="bg-slate-700/80 backdrop-blur-sm border-blue-500/30 h-full hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-shadow duration-300 cursor-pointer group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 mb-2 py-1.5 px-3 text-white">
                            <WrenchIcon className="h-3.5 w-3.5 mr-1.5" /> Tool
                          </Badge>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-2xl text-white group-hover:text-blue-300 transition-colors flex items-center">
                          <motion.div
                            animate={{ 
                              rotate: [0, 20, 0, -20, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut"
                            }}
                            className="mr-3 text-2xl"
                          >
                            🔥
                          </motion.div>
                          BlazeSQL
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">AI-powered SQL assistant</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl animate-pulse-slow"></div>
                        <p className="text-gray-300 mb-4">Just ask questions in plain English and BlazeSQL generates the SQL queries for you. Perfect for SQL beginners.</p>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-blue-500/20 font-mono text-xs text-gray-400 mb-4">
                          {`"Show me all customers who spent over $1000 last month"`}
                          <div className="mt-2 text-blue-400">↓</div>
                          <div className="mt-2">
                            <span className="text-purple-400">SELECT</span> customer_name, total_spent <span className="text-purple-400">FROM</span> customers <span className="text-purple-400">WHERE</span> total_spent &gt; 1000 <span className="text-purple-400">AND</span> purchase_date &gt;= <span className="text-green-400">'2025-02-01'</span>;
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <CommandIcon className="h-4 w-4 mr-1" /> AI-Powered
                        </div>
                        <Link href="https://blazesql.com" target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="group-hover:bg-blue-900/30 transition-colors flex items-center">
                            Try Now
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              className="ml-2"
                            >
                              →
                            </motion.div>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </AnimatedCard>

                  {/* Schemaverse */}
                  <AnimatedCard delay={4} colorScheme="purple">
                    <Card className="bg-slate-700/80 backdrop-blur-sm border-blue-500/30 h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-shadow duration-300 cursor-pointer group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 mb-2 py-1.5 px-3 text-white">
                            <GamepadIcon className="h-3.5 w-3.5 mr-1.5" /> Game
                          </Badge>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-2xl text-white group-hover:text-purple-300 transition-colors flex items-center">
                          <motion.div
                            animate={{ 
                              rotate: 360
                            }}
                            transition={{ 
                              duration: 20,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="mr-3 text-2xl"
                          >
                            🚀
                          </motion.div>
                          Schemaverse
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">Space strategy game in PostgreSQL</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-500/5 rounded-full blur-xl animate-pulse-slow"></div>
                        <p className="text-gray-300 mb-4">Command your fleet with SQL queries in this space-based strategy game implemented entirely in a PostgreSQL database.</p>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 font-mono text-xs text-gray-400 mb-4">
                          <span className="text-purple-400">UPDATE</span> ships <span className="text-purple-400">SET</span> destination_x = 1337, destination_y = 42 <span className="text-purple-400">WHERE</span> ship_id = 1 <span className="text-purple-400">AND</span> player_id = <span className="text-green-400">current_player_id()</span>;
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <UsersIcon className="h-4 w-4 mr-1" /> 10k+ players
                        </div>
                        <Link href="https://schemaverse.com" target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="group-hover:bg-purple-900/30 transition-colors flex items-center">
                            Play Now
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              className="ml-2"
                            >
                              →
                            </motion.div>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </AnimatedCard>

                  {/* SQL Quiz Master */}
                  <AnimatedCard delay={5} colorScheme="teal">
                    <Card className="bg-slate-700/80 backdrop-blur-sm border-teal-500/50 h-full hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-shadow duration-300 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 blur-xl"></div>
                      </div>
                      
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-teal-600 to-teal-500 mb-2 py-1.5 px-3 text-white">
                            <span className="flex items-center">
                              <SparklesIcon className="h-3.5 w-3.5 mr-1.5" /> Original
                            </span>
                          </Badge>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-2xl text-white group-hover:text-teal-300 transition-colors flex items-center">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, 0]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut"
                            }}
                            className="mr-3 text-2xl"
                          >
                            🧠
                          </motion.div>
                          SQL Quiz Master
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">Test your SQL knowledge</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 mb-4">Challenge yourself with timed SQL quizzes across different difficulty levels and database platforms.</p>
                        
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-teal-500/20 text-sm text-gray-300 mb-4 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="w-full text-center font-semibold text-teal-300"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1, duration: 0.5 }}
                            >
                              Coming Soon!
                            </motion.div>
                          </div>
                          <div className="opacity-20">
                            <div className="font-semibold mb-2">Question 3/10: What will this query return?</div>
                            <div className="font-mono text-xs text-gray-400 mb-3">
                              <span className="text-purple-400">SELECT</span> COUNT(*) <span className="text-purple-400">FROM</span> users <span className="text-purple-400">GROUP BY</span> country <span className="text-purple-400">HAVING</span> COUNT(*) &gt; 1000;
                            </div>
                            <motion.div
                              animate={{ opacity: [1, 0.1, 1] }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-full h-1 bg-teal-500/50 rounded-full mb-2"
                            />
                            <div className="text-xs text-gray-400">Time remaining: 00:42</div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="px-2 py-1 rounded bg-teal-600/20 text-teal-400 text-xs flex items-center animate-pulse">
                            <ClockIcon className="h-3 w-3 mr-1" /> Coming Soon
                          </span>
                        </div>
                        <Link href="/quiz-master">
                          <Button size="sm" variant="ghost" className="group-hover:bg-teal-900/30 transition-colors flex items-center">
                            Learn More
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              className="ml-2"
                            >
                              →
                            </motion.div>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </AnimatedCard>
                </div>
              </TabsContent>

              {/* Games Tab */}
              <TabsContent value="games" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* You could add more "Game" cards here if you want */}
                </div>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* You could add more "Tool" cards here if you want */}
                </div>
              </TabsContent>

              {/* Learning Tab */}
              <TabsContent value="learning" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* You could add more "Learning" cards here if you want */}
                </div>
              </TabsContent>

              {/* Community Tab */}
              <TabsContent value="community" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* You could add more "Community" cards here if you want */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Featured Original Game/Tool Highlight */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.1) 0%, transparent 50%)',
              backgroundSize: '120% 120%'
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'linear'
            }}
          />
          
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-900/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-900/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="flex flex-col md:flex-row gap-12 items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 mb-4 py-1.5 px-3 text-white">
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="mr-2"
                  >
                    ✨
                  </motion.span>
                  Coming Soon
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-4">SQL Puzzle Boxes</h2>
                <p className="text-2xl text-teal-300 mb-6">Solve intricate database puzzles with increasing complexity</p>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Each puzzle box presents you with a complex database scenario. Use your SQL skills to unlock layers of challenges, from simple queries to advanced data transformations and optimization problems.
                </p>
                <div className="flex gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-lg px-8 py-6 relative overflow-hidden group">
                      <motion.span 
                        className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut"
                        }}
                      />
                      <span className="flex items-center">
                        <motion.span
                          animate={{ 
                            rotate: [0, 5, 0, -5, 0] 
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                          className="mr-2"
                        >
                          🎁
                        </motion.span>
                        Join Waitlist
                      </span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" className="border-teal-400 text-teal-400 hover:bg-teal-900/20 text-lg px-8 py-6">
                      Learn More
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-6 border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                  <div className="font-mono text-sm text-gray-300 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl text-teal-400 font-semibold">Puzzle Box Level 3: The Missing Transactions</div>
                      <Badge variant="outline" className="bg-teal-900/30 border-teal-500/30">
                        Advanced
                      </Badge>
                    </div>
                    <p className="text-gray-400 mb-1">-- Find all customers who made purchases on days when</p>
                    <p className="text-gray-400 mb-4">-- the payment system had recorded failures</p>
                    
                    <motion.div
                      animate={{ 
                        boxShadow: ["0 0 0px rgba(20,184,166,0.1)", "0 0 20px rgba(20,184,166,0.3)", "0 0 0px rgba(20,184,166,0.1)"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative"
                    >
                      <div className="bg-slate-900 p-4 rounded mt-2 overflow-x-auto border border-teal-600/20 mb-6">
                        <TypewriterEffect 
                          text={`SELECT 
  c.customer_name,
  t.transaction_date,
  t.amount
FROM 
  customers c
JOIN 
  transactions t ON c.customer_id = t.customer_id
WHERE 
  t.transaction_date IN (
    SELECT 
      failure_date
    FROM 
      system_logs
    WHERE 
      error_code BETWEEN 500 AND 599
  )
ORDER BY 
  t.amount DESC;`}
                          className="text-green-400 font-mono text-sm"
                          speed={10}
                        />
                      </div>
                    </motion.div>
                    
                    <div className="flex items-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, 0, -10, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="text-lg mr-2"
                      >
                        💡
                      </motion.div>
                      <p className="text-amber-400 italic">Hint: Are you sure you&apos;ve found ALL the affected customers?</p>
                    </div>
                    
                    <div className="mt-6 bg-slate-900/50 p-4 rounded-lg border border-teal-500/20">
                      <div className="flex justify-between mb-3">
                        <div className="text-teal-400">Progress</div>
                        <div className="text-teal-400">2/5 Steps Completed</div>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                          initial={{ width: '20%' }}
                          animate={{ width: '40%' }}
                          transition={{ 
                            duration: 1,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-800/80 to-slate-900/0"></div>
          <div className="max-w-7xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Our Growing Community</h2>
              <p className="text-xl text-blue-300 max-w-3xl mx-auto">
                Join thousands of SQL enthusiasts learning, playing, and mastering databases together.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(59,130,246,0.3)" 
                }}
                className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-lg border border-blue-500/20 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.p 
                  className="text-5xl font-bold text-blue-400 mb-3"
                  animate={{
                    textShadow: ["0 0 0px rgba(96,165,250,0)", "0 0 20px rgba(96,165,250,0.5)", "0 0 0px rgba(96,165,250,0)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Counter from={0} to={150} suffix="K+" duration={2.5} />
                </motion.p>
                <p className="text-lg text-gray-300">Active Users</p>
                <div className="absolute -bottom-4 -right-4 opacity-10 text-7xl">👤</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(168,85,247,0.3)" 
                }}
                className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-lg border border-purple-500/20 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.p 
                  className="text-5xl font-bold text-purple-400 mb-3"
                  animate={{
                    textShadow: ["0 0 0px rgba(192,132,252,0)", "0 0 20px rgba(192,132,252,0.5)", "0 0 0px rgba(192,132,252,0)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Counter from={0} to={5} suffix="M+" duration={2.5} />
                </motion.p>
                <p className="text-lg text-gray-300">Queries Run</p>
                <div className="absolute -bottom-4 -right-4 opacity-10 text-7xl">📊</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(20,184,166,0.3)" 
                }}
                className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-lg border border-teal-500/20 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-teal-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.p 
                  className="text-5xl font-bold text-teal-400 mb-3"
                  animate={{
                    textShadow: ["0 0 0px rgba(45,212,191,0)", "0 0 20px rgba(45,212,191,0.5)", "0 0 0px rgba(45,212,191,0)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Counter from={0} to={25} suffix="+" duration={2.5} />
                </motion.p>
                <p className="text-lg text-gray-300">SQL Games &amp; Tools</p>
                <div className="absolute -bottom-4 -right-4 opacity-10 text-7xl">🎮</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(245,158,11,0.3)" 
                }}
                className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-lg border border-amber-500/20 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.p 
                  className="text-5xl font-bold text-amber-400 mb-3"
                  animate={{
                    textShadow: ["0 0 0px rgba(251,191,36,0)", "0 0 20px rgba(251,191,36,0.5)", "0 0 0px rgba(251,191,36,0)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Counter from={0} to={97} suffix="%" duration={2.5} />
                </motion.p>
                <p className="text-lg text-gray-300">Satisfaction Rate</p>
                <div className="absolute -bottom-4 -right-4 opacity-10 text-7xl">⭐</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-slate-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <motion.div 
              className="absolute -top-64 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)"
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <motion.div 
            className="max-w-3xl mx-auto text-center relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Stay Updated with SQL.xyz</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </motion.div>
            
            <p className="text-xl text-gray-300 mb-10">Get notified about new games, tools, and SQL challenges delivered straight to your inbox.</p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative flex-grow">
                <motion.div
                  className="absolute inset-0 rounded-md"
                  animate={{
                    boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 15px rgba(59,130,246,0.3)", "0 0 0px rgba(59,130,246,0)"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <input 
                  type="email" 
                  placeholder="youremail@example.com" 
                  className="px-5 py-4 bg-slate-700/80 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 opacity-50">
                  <DatabaseIcon size={20} />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 whitespace-nowrap text-lg py-4 px-8 rounded-lg">
                  <motion.span
                    animate={{ 
                      x: [0, 5, 0] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="mr-2 inline-block"
                  >
                    ✉️
                  </motion.span>
                  Subscribe
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 text-sm text-gray-400 flex justify-center items-center"
            >
              <CheckIcon className="h-4 w-4 mr-2 text-green-400" />
              <span>We&apos;ll never share your email. Unsubscribe anytime.</span>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -top-8 -left-8 text-5xl opacity-10 transform -rotate-12">📧</div>
            <div className="absolute -bottom-8 -right-8 text-5xl opacity-10 transform rotate-12">📨</div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)' 
            }}></div>
            
            {/* Floating SQL terms */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * 300 + 200,
                  opacity: Math.random() * 0.1 + 0.05,
                  rotate: Math.random() * 20 - 10
                }}
                animate={{ 
                  y: [null, Math.random() * -100 - 50],
                  opacity: [null, 0]
                }}
                transition={{ 
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }}
                className="absolute text-blue-500/10 text-xs font-mono"
              >
                {sqlSnippets[Math.floor(Math.random() * sqlSnippets.length)]}
              </motion.div>
            ))}
          </div>
          
          <div className="max-w-7xl mx-auto relative">
            <motion.div 
              className="flex flex-col items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600"
              >
                SQL<span className="animate-pulse">.</span>xyz
              </motion.div>
              <p className="text-xl text-gray-400 max-w-xl text-center">
                Making SQL fun, interactive, and accessible for everyone, from beginners to experts.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <GamepadIcon className="mr-3 h-5 w-5 text-blue-400" />
                  Quick Links
                </h3>
                <ul className="space-y-4">
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/games" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Games
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/tools" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Tools
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/learning" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Learning
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/community" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Community
                    </Link>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CodeIcon className="mr-3 h-5 w-5 text-purple-400" />
                  Resources
                </h3>
                <ul className="space-y-4">
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/blog" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Blog
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/documentation" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Documentation
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/api" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> API
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> FAQ
                    </Link>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <UsersIcon className="mr-3 h-5 w-5 text-teal-400" />
                  Connect
                </h3>
                <ul className="space-y-4">
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="https://twitter.com/sqlxyz" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Twitter
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="https://github.com/sqlxyz" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> GitHub
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="https://discord.gg/sqlxyz" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Discord
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/contact" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                      <span className="mr-2">→</span> Contact
                    </Link>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <RocketIcon className="mr-3 h-5 w-5 text-amber-400" />
                  Coming Soon
                </h3>
                <ul className="space-y-4">
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }} className="flex items-center">
                    <span className="mr-2">→</span>
                    <span className="text-gray-400">SQL Dungeon Crawler</span>
                    <Badge className="ml-2 bg-amber-600/20 text-amber-400 text-xs">Soon</Badge>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }} className="flex items-center">
                    <span className="mr-2">→</span>
                    <span className="text-gray-400">Query Visualizer</span>
                    <Badge className="ml-2 bg-amber-600/20 text-amber-400 text-xs">Soon</Badge>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }} className="flex items-center">
                    <span className="mr-2">→</span>
                    <span className="text-gray-400">SQL Battle</span>
                    <Badge className="ml-2 bg-amber-600/20 text-amber-400 text-xs">Soon</Badge>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }} className="flex items-center">
                    <span className="mr-2">→</span>
                    <span className="text-gray-400">SQL Puzzle Boxes</span>
                    <Badge className="ml-2 bg-amber-600/20 text-amber-400 text-xs">Soon</Badge>
                  </motion.li>
                </ul>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-20 pt-10 border-t border-slate-800 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex justify-center space-x-6 mb-8">
                <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                  <Link href="https://twitter.com/sqlxyz" className="text-gray-500 hover:text-blue-400">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                  <Link href="https://github.com/sqlxyz" className="text-gray-500 hover:text-gray-300">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                  <Link href="https://discord.gg/sqlxyz" className="text-gray-500 hover:text-indigo-400">
                    <span className="sr-only">Discord</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.608 1.2495-1.8447-.2762-3.6677-.2762-5.4878 0-.1634-.3933-.4-.8882-.6117-1.2495a.077.077 0 00-.0785-.037A19.7363 19.7363 0 004.2618 4.3698a.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 19.9181 19.9181 0 006.0023 3.0225.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0087-3.0224a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              <p className="text-gray-500">
                &copy; {new Date().getFullYear()} SQL.xyz. All rights reserved.
              </p>
            </motion.div>
          </div>
        </footer>
        
        {/* Floating action button */}
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.3, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            onClick={() => executeCommand("HELP")}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-700/20"
          >
            <KeyIcon size={24} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Counter animation component
interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
}

function Counter({ from, to, duration = 2, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number | undefined;
    
    const updateCount = (timestamp: number): void => {
      if (!startTime) {
        startTime = timestamp;
      }
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smoother animation
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(from + (to - from) * easedProgress);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
    
    return () => setCount(from);
  }, [from, to, duration]);

  return <span>{count}{suffix}</span>;
}