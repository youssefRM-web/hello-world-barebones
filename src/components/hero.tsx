/**
 * =============================================================================
 * HERO COMPONENT - Main Landing Section
 * =============================================================================
 * 
 * The primary above-the-fold section featuring:
 * - Animated headline with rotating words
 * - Subtitle and call-to-action buttons
 * - Dashboard preview with animated status cards
 * - Background decorative paths
 * 
 * Responsive Layouts:
 * - Desktop: Full hero image with floating status cards
 * - Mobile: Cards stacked above/below hero image with connection lines
 * 
 * Animations:
 * - Word rotation every 2 seconds
 * - Connection line pulse effects
 * - Card status indicators
 * =============================================================================
 */

import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { useDemoModal } from '@/components/demo-modal-provider';
import { useAuthModal } from '@/components/auth-modal-provider';

/** Avatar images for status cards */
import memoji08 from '@/assets/homepage/avatar-sarah.webp';
import memoji05 from '@/assets/homepage/avatar-mike.webp';
import memoji07 from '@/assets/homepage/avatar-david.webp';
import memoji16 from '@/assets/homepage/avatar-alex.webp';

/** Hero background images (desktop and mobile versions) */
import heroOffice from '@/assets/homepage/facility-management-dashboard.webp';
import heroOfficeMobile from '@/assets/homepage/facility-management-dashboard-mobile.webp';

/**
 * Hero Component
 * --------------
 * Main landing section with animated headline and dashboard preview.
 */
export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { openDemoModal } = useDemoModal();
  const { openAuthModal } = useAuthModal();
  const words = language === 'de' 
    ? ['einfach', 'schnell', 'intuitiv', 'effizient']
    : ['simple', 'fast', 'intuitive', 'efficient'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroOffice;
    link.type = 'image/webp';
    document.head.appendChild(link);

    const linkMobile = document.createElement('link');
    linkMobile.rel = 'preload';
    linkMobile.as = 'image';
    linkMobile.href = heroOfficeMobile;
    linkMobile.type = 'image/webp';
    document.head.appendChild(linkMobile);
  }, []);
  return (
    <section className="relative min-h-screen md:min-h-[85vh] lg:min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      <div className="absolute inset-0 z-0 hidden md:block">
        <AuroraBackground />
      </div>
      <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 md:pt-28 lg:pt-40 pb-16 sm:pb-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-foreground leading-tight">
            <div className="whitespace-nowrap">Facility Management</div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
              <span>{language === 'de' ? 'wird' : 'made'}</span>
              <span className="inline-block min-w-[160px] sm:min-w-[200px] md:min-w-[220px] lg:min-w-[300px] text-left relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent inline-block"
                  >
                    {words[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto sm:max-w-none">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto sm:justify-center">
              <Button 
                size="lg" 
                onClick={() => openAuthModal('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                {t.hero.cta}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={openDemoModal}
                className="border-2 border-border hover:bg-accent hover:border-accent-foreground px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold text-foreground bg-transparent transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                {language === 'de' ? 'Demo buchen' : 'Book Demo'}
              </Button>
            </div>
            <p className="text-sm text-gray-400">{language === 'de' ? 'Keine Kreditkarte erforderlich' : 'No credit card required'}</p>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="relative max-w-6xl mx-auto mt-16">
          <div className="glass-card p-4 rounded-2xl">
            {/* Desktop: Full image with all overlays */}
            <div className="hidden md:block relative">
              {/* @ts-ignore - fetchpriority is valid HTML but not in React types */}
              <img 
                src={heroOffice}
                alt="Moderne Gebäudemanagement-Dashboard-Oberfläche" 
                className="rounded-xl w-full h-auto"
                width={1200}
                height={600}
                loading="eager"
                decoding="sync"
                // @ts-ignore
                fetchpriority="high"
              />
              
              {/* Connection Lines and Dots - Desktop only */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 15}} viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet">
                <polyline points="18,11 30,11 30,7.5 40,7.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" fill="none" strokeLinejoin="miter"/>
                <polyline points="82,14 70,14 70,25.5 57,25.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" fill="none" strokeLinejoin="miter"/>
                <polyline points="18,36 28,36 28,23.5 37,23.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" fill="none" strokeLinejoin="miter"/>
                <polyline points="82,42 74,42 74,36.5 63,36.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" fill="none" strokeLinejoin="miter"/>
                
                <g>
                  <circle cx="40" cy="7.5" r="0.4" fill="white"/>
                  <circle cx="40" cy="7.5" r="0.6" fill="none" stroke="white" strokeWidth="0.15" opacity="0.4">
                    <animate attributeName="r" values="0.6;1.0;0.6" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
                  </circle>
                </g>
                <g>
                  <circle cx="57" cy="25.5" r="0.4" fill="white"/>
                  <circle cx="57" cy="25.5" r="0.6" fill="none" stroke="white" strokeWidth="0.15" opacity="0.4">
                    <animate attributeName="r" values="0.6;1.0;0.6" dur="3s" repeatCount="indefinite" begin="0.7s"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" begin="0.7s"/>
                  </circle>
                </g>
                <g>
                  <circle cx="37" cy="23.5" r="0.4" fill="white"/>
                  <circle cx="37" cy="23.5" r="0.6" fill="none" stroke="white" strokeWidth="0.15" opacity="0.4">
                    <animate attributeName="r" values="0.6;1.0;0.6" dur="3s" repeatCount="indefinite" begin="1.4s"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" begin="1.4s"/>
                  </circle>
                </g>
                <g>
                  <circle cx="63" cy="36.5" r="0.4" fill="white"/>
                  <circle cx="63" cy="36.5" r="0.6" fill="none" stroke="white" strokeWidth="0.15" opacity="0.4">
                    <animate attributeName="r" values="0.6;1.0;0.6" dur="3s" repeatCount="indefinite" begin="2.1s"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" begin="2.1s"/>
                  </circle>
                </g>
              </svg>
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl pointer-events-none" style={{zIndex: 5}}></div>

              {/* Desktop Cards - All 4 */}
              <div className="absolute top-8 left-8 bg-slate-800/20 backdrop-blur-md border border-slate-700/30 rounded-lg shadow-xl p-3 w-48 text-left" style={{zIndex: 20}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">{t.heroCards.statuses.open}</span>
                </div>
                <p className="font-bold text-white mb-1 text-sm text-left">{t.heroCards.systems.hvac}</p>
                <p className="text-xs text-gray-300 mb-2 leading-tight text-left">{t.heroCards.descriptions.hvac}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={memoji08} alt="Sarah M." className="w-7 h-7 object-cover" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">Sarah M.</span>
                </div>
              </div>

              <div className="absolute top-12 right-8 bg-slate-800/20 backdrop-blur-md border border-slate-700/30 rounded-lg shadow-xl p-3 w-48 text-left" style={{zIndex: 20}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-sm"></div>
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">{t.heroCards.statuses.inProgress}</span>
                </div>
                <p className="font-bold text-white mb-1 text-sm text-left">{t.heroCards.systems.lighting}</p>
                <p className="text-xs text-gray-300 mb-2 leading-tight text-left">{t.heroCards.descriptions.lighting}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={memoji05} alt="Mike J." className="w-7 h-7 object-cover" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">Mike J.</span>
                </div>
              </div>

              <div className="absolute bottom-16 left-8 bg-slate-800/20 backdrop-blur-md border border-slate-700/30 rounded-lg shadow-xl p-3 w-48 text-left" style={{zIndex: 20}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">{t.heroCards.statuses.resolved}</span>
                </div>
                <p className="font-bold text-white mb-1 text-sm text-left">{t.heroCards.systems.network}</p>
                <p className="text-xs text-gray-300 mb-2 leading-tight text-left">{t.heroCards.descriptions.network}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={memoji07} alt="David W." className="w-7 h-7 object-contain" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">David W.</span>
                </div>
              </div>

              <div className="absolute bottom-20 right-8 bg-slate-800/20 backdrop-blur-md border border-slate-700/30 rounded-lg shadow-xl p-3 w-48 text-left" style={{zIndex: 20}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">{t.heroCards.statuses.resolved}</span>
                </div>
                <p className="font-bold text-white mb-1 text-sm text-left">{t.heroCards.systems.printer}</p>
                <p className="text-xs text-gray-300 mb-2 leading-tight text-left">{t.heroCards.descriptions.printer}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={memoji16} alt="Alex L." className="w-7 h-7 object-contain" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">Alex L.</span>
                </div>
              </div>
            </div>

            {/* Mobile: Cards above and below image with connection lines */}
            <div className="md:hidden">
              {/* Top Cards - 2 cards above */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-md border border-gray-300 dark:border-slate-700/50 rounded-lg p-4 shadow-lg flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide">{t.heroCards.statuses.open}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-base mb-4 text-left leading-tight break-words flex-grow">{t.heroCards.systems.hvac}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                      <img src={memoji08} alt="Sarah M." className="w-7 h-7 object-cover" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Sarah M.</span>
                  </div>
                </div>

                <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-md border border-gray-300 dark:border-slate-700/50 rounded-lg p-4 shadow-lg flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">{t.heroCards.statuses.inProgress}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-base mb-4 text-left leading-tight break-words flex-grow">{t.heroCards.systems.lighting}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      <img src={memoji05} alt="Mike J." className="w-7 h-7 object-cover" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Mike J.</span>
                  </div>
                </div>
              </div>

              {/* Image with Connection Lines */}
              <div className="relative">
                {/* @ts-ignore - fetchpriority is valid HTML but not in React types */}
                <img 
                  src={heroOfficeMobile}
                  alt="Moderne Gebäudemanagement-Oberfläche" 
                  className="rounded-xl w-full h-64 object-cover"
                  width={800}
                  height={500}
                  loading="eager"
                  // @ts-ignore
                  fetchpriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent rounded-xl"></div>
                
                {/* Mobile Connection Lines and Dots */}
                <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none" style={{zIndex: 15}} viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet">
                  {/* Connection lines with proper 90-degree angles only */}
                  {/* Connection lines with gradient */}
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.6"/>
                    </linearGradient>
                  </defs>
                  
                  {/* HVAC System (top left) to ceiling dot */}
                  <polyline points="25,-15 25,7.5 40,7.5" stroke="url(#connectionGradient)" strokeWidth="0.8" fill="none" strokeLinejoin="miter"/>
                  
                  {/* Lighting Issues (top right) to right wall dot */}
                  <polyline points="75,-15 75,25.5 57,25.5" stroke="url(#connectionGradient)" strokeWidth="0.8" fill="none" strokeLinejoin="miter"/>
                  
                  {/* Network Fixed (bottom left) to left wall dot */}
                  <polyline points="25,65 25,23.5 37,23.5" stroke="url(#connectionGradient)" strokeWidth="0.8" fill="none" strokeLinejoin="miter"/>
                  
                  {/* Printer Serviced (bottom right) to right equipment dot */}
                  <polyline points="75,65 75,36.5 63,36.5" stroke="url(#connectionGradient)" strokeWidth="0.8" fill="none" strokeLinejoin="miter"/>
                  
                  {/* Connection dots with gradient colors */}
                  <defs>
                    <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.8"/>
                    </radialGradient>
                  </defs>
                  
                  <g>
                    <circle cx="40" cy="7.5" r="1" fill="url(#dotGradient)"/>
                    <circle cx="40" cy="7.5" r="1.5" fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.7">
                      <animate attributeName="r" values="1.5;2.2;1.5" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite"/>
                    </circle>
                  </g>
                  <g>
                    <circle cx="57" cy="25.5" r="1" fill="url(#dotGradient)"/>
                    <circle cx="57" cy="25.5" r="1.5" fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.7">
                      <animate attributeName="r" values="1.5;2.2;1.5" dur="3s" repeatCount="indefinite" begin="0.7s"/>
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" begin="0.7s"/>
                    </circle>
                  </g>
                  <g>
                    <circle cx="37" cy="23.5" r="1" fill="url(#dotGradient)"/>
                    <circle cx="37" cy="23.5" r="1.5" fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.7">
                      <animate attributeName="r" values="1.5;2.2;1.5" dur="3s" repeatCount="indefinite" begin="1.4s"/>
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" begin="1.4s"/>
                    </circle>
                  </g>
                  <g>
                    <circle cx="63" cy="36.5" r="1" fill="url(#dotGradient)"/>
                    <circle cx="63" cy="36.5" r="1.5" fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.7">
                      <animate attributeName="r" values="1.5;2.2;1.5" dur="3s" repeatCount="indefinite" begin="2.1s"/>
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" begin="2.1s"/>
                    </circle>
                  </g>
                </svg>
              </div>
              
              {/* Bottom Cards - 2 cards below */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-md border border-gray-300 dark:border-slate-700/50 rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">{t.heroCards.statuses.resolved}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-base mb-4 text-left leading-tight break-words">{t.heroCards.systems.network}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                      <img src={memoji07} alt="David W." className="w-7 h-7 object-cover" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">David W.</span>
                  </div>
                </div>

                <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-md border border-gray-300 dark:border-slate-700/50 rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">{t.heroCards.statuses.resolved}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-base mb-4 text-left leading-tight break-words">{t.heroCards.systems.printer}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center overflow-hidden">
                      <img src={memoji16} alt="Alex L." className="w-7 h-7 object-cover" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Alex L.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}