import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Clock, AlertTriangle, TrendingUp, TrendingDown, Users, FileText, Smartphone, ChevronLeft, ChevronRight, QrCode, ArrowRightLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/page-transition';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';

export default function StatusQuoComparison() {
  const [currentTopic, setCurrentTopic] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const comparisons = [
    {
      category: t.statusQuo.problemReporting.category,
      statusQuo: {
        title: t.statusQuo.problemReporting.traditional.title,
        description: t.statusQuo.problemReporting.traditional.description,
        icon: <FileText className="w-6 h-6 text-red-400" />,
        problems: t.statusQuo.problemReporting.traditional.problems,
        timeToReport: t.statusQuo.problemReporting.traditional.timeToReport,
        accuracy: t.statusQuo.problemReporting.traditional.accuracy,
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
      },
      facilityPro: {
        title: t.statusQuo.problemReporting.mendigo.title,
        description: t.statusQuo.problemReporting.mendigo.description,
        icon: <Smartphone className="w-6 h-6 text-green-400" />,
        benefits: t.statusQuo.problemReporting.mendigo.benefits,
        timeToReport: t.statusQuo.problemReporting.mendigo.timeToReport,
        accuracy: t.statusQuo.problemReporting.mendigo.accuracy,
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30"
      }
    },
    {
      category: t.statusQuo.taskManagement.category,
      statusQuo: {
        title: t.statusQuo.taskManagement.traditional.title,
        description: t.statusQuo.taskManagement.traditional.description,
        icon: <FileText className="w-6 h-6 text-red-400" />,
        problems: t.statusQuo.taskManagement.traditional.problems,
        efficiency: t.statusQuo.taskManagement.traditional.efficiency,
        visibility: t.statusQuo.taskManagement.traditional.visibility,
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
      },
      facilityPro: {
        title: t.statusQuo.taskManagement.mendigo.title,
        description: t.statusQuo.taskManagement.mendigo.description,
        icon: <TrendingUp className="w-6 h-6 text-green-400" />,
        benefits: t.statusQuo.taskManagement.mendigo.benefits,
        efficiency: t.statusQuo.taskManagement.mendigo.efficiency,
        visibility: t.statusQuo.taskManagement.mendigo.visibility,
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30"
      }
    },
    {
      category: t.statusQuo.communication.category,
      statusQuo: {
        title: t.statusQuo.communication.traditional.title,
        description: t.statusQuo.communication.traditional.description,
        icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
        problems: t.statusQuo.communication.traditional.problems,
        responseTime: t.statusQuo.communication.traditional.responseTime,
        contextRetention: t.statusQuo.communication.traditional.contextRetention,
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
      },
      facilityPro: {
        title: t.statusQuo.communication.mendigo.title,
        description: t.statusQuo.communication.mendigo.description,
        icon: <Users className="w-6 h-6 text-green-400" />,
        benefits: t.statusQuo.communication.mendigo.benefits,
        responseTime: t.statusQuo.communication.mendigo.responseTime,
        contextRetention: t.statusQuo.communication.mendigo.contextRetention,
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30"
      }
    }
  ];

  // Auto-cycle through topics every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentTopic(prev => prev === comparisons.length - 1 ? 0 : prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [comparisons.length, isPaused]);

  // Resume auto-cycling after user interaction
  useEffect(() => {
    if (isPaused) {
      const resumeTimer = setTimeout(() => {
        setIsPaused(false);
      }, 3000); // Resume after 3 seconds of no interaction

      return () => clearTimeout(resumeTimer);
    }
  }, [isPaused]);

  const handleManualNavigation = (newTopic: number) => {
    setCurrentTopic(newTopic);
    setIsPaused(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentTopic < comparisons.length - 1) {
      handleManualNavigation(currentTopic + 1);
    }
    if (isRightSwipe && currentTopic > 0) {
      handleManualNavigation(currentTopic - 1);
    }
  };

  return (
    <section className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={headerRef} className={`mb-16 ${headerVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${headerVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {t.statusQuo.badge}
          </Badge>
          <h2 
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground ${headerVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}
            style={{ textAlign: isMobile ? 'left' : 'center' }}
          >
            {t.statusQuo.title}
          </h2>
          <p 
            className={`text-lg text-muted-foreground max-w-4xl md:mx-auto ${headerVisible ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}
            style={{ textAlign: isMobile ? 'left' : 'center' }}
          >
            {t.statusQuo.subtitle}
          </p>
        </div>

        {/* Topic Navigation - Desktop Only */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="bg-accent/50 rounded-lg p-1 flex space-x-1">
            {comparisons.map((comparison, index) => (
              <button
                key={index}
                onClick={() => handleManualNavigation(index)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                  currentTopic === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {comparison.category}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows - Desktop Only */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManualNavigation(currentTopic === 0 ? comparisons.length - 1 : currentTopic - 1)}
            className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-10 glass-card border-border text-foreground hover:bg-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManualNavigation(currentTopic === comparisons.length - 1 ? 0 : currentTopic + 1)}
            className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-10 glass-card border-border text-foreground hover:bg-accent"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Desktop Carousel */}
          <div className="hidden md:block overflow-hidden">
            <div 
              className="transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTopic * 100}%)` }}
            >
              <div className="flex">
                {comparisons.map((comparison, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4"
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(true)} // Will trigger resume timer
                    >
                      {/* Status Quo */}
                      <Card className="glass-card border-2 border-red-500/50 transition-all duration-300 hover:border-red-500/70">
                        <CardContent className="p-4 md:p-8 relative">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-lg"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center mb-3 md:mb-6">
                              <div className="p-1.5 md:p-2 bg-red-500/20 rounded-lg mr-3 md:mr-4">
                                {comparison.statusQuo.icon}
                              </div>
                              <div>
                                <h4 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                                  {comparison.statusQuo.title}
                                </h4>
                                <p className="text-muted-foreground text-sm md:text-base">{comparison.statusQuo.description}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 md:space-y-4 mb-4 md:mb-6">
                              {comparison.statusQuo.problems.map((problem, idx) => (
                                <div key={idx} className="flex items-start space-x-2 md:space-x-3 p-2 md:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-foreground text-xs md:text-sm font-medium">{problem}</span>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-4 pt-3 md:pt-6 border-t-2 border-red-500/30">
                              {comparison.statusQuo.timeToReport && (
                                <>
                                  <div className="text-center p-2 md:p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Meldezeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.statusQuo.timeToReport}</div>
                                  </div>
                                  <div className="text-center p-2 md:p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Genauigkeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.statusQuo.accuracy}</div>
                                  </div>
                                </>
                              )}
                              {comparison.statusQuo.efficiency && (
                                <>
                                  <div className="text-center p-2 md:p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Effizienz</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.statusQuo.efficiency}</div>
                                  </div>
                                  <div className="text-center p-2 md:p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Sichtbarkeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.statusQuo.visibility}</div>
                                  </div>
                                </>
                              )}
                              {comparison.statusQuo.responseTime && (
                                <>
                                  <div className="text-center p-2 md:p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Antwortzeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.statusQuo.responseTime}</div>
                                  </div>
                                  <div className="text-center p-2 md:p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Kontextbewahrung</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.statusQuo.contextRetention}</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mendigo */}
                      <Card className="glass-card border-2 border-green-500/50 transition-all duration-300 hover:border-green-500/70">
                        <CardContent className="p-4 md:p-8 relative">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-lg"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center mb-3 md:mb-6">
                              <div className="p-1.5 md:p-2 bg-green-500/20 rounded-lg mr-3 md:mr-4">
                                {comparison.facilityPro.icon}
                              </div>
                              <div>
                                <h4 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                                  {comparison.facilityPro.title}
                                </h4>
                                <p className="text-muted-foreground text-sm md:text-base">{comparison.facilityPro.description}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 md:space-y-4 mb-4 md:mb-6">
                              {comparison.facilityPro.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start space-x-2 md:space-x-3 p-2 md:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-foreground text-xs md:text-sm font-medium">{benefit}</span>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-4 pt-3 md:pt-6 border-t-2 border-green-500/30">
                              {comparison.facilityPro.timeToReport && (
                                <>
                                  <div className="text-center p-2 md:p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Meldezeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.facilityPro.timeToReport}</div>
                                  </div>
                                  <div className="text-center p-2 md:p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Genauigkeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.facilityPro.accuracy}</div>
                                  </div>
                                </>
                              )}
                              {comparison.facilityPro.efficiency && (
                                <>
                                  <div className="text-center p-2 md:p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Effizienz</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.facilityPro.efficiency}</div>
                                  </div>
                                  <div className="text-center p-2 md:p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Sichtbarkeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.facilityPro.visibility}</div>
                                  </div>
                                </>
                              )}
                              {comparison.facilityPro.responseTime && (
                                <>
                                  <div className="text-center p-2 md:p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Antwortzeit</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.facilityPro.responseTime}</div>
                                  </div>
                                  <div className="text-center p-2 md:p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Kontextbewahrung</div>
                                    <div className="text-foreground font-bold text-sm md:text-lg">{comparison.facilityPro.contextRetention}</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            {/* Mobile Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="bg-accent/50 rounded-lg p-1 flex space-x-1 overflow-x-auto">
                {comparisons.map((comparison, index) => (
                  <button
                    key={index}
                    onClick={() => handleManualNavigation(index)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                      currentTopic === index
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {comparison.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Swipeable Content */}
            <div 
              className="relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentTopic * 100}%)` }}
              >
                {comparisons.map((comparison, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <div className="space-y-4">
                      {/* Status Quo Card */}
                      <Card className="glass-card border-2 border-red-500/50 transition-all duration-300">
                        <CardContent className="p-4 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-lg"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center mb-3">
                              <div className="p-1.5 bg-red-500/20 rounded-lg mr-3">
                                {comparison.statusQuo.icon}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-1">
                                  {comparison.statusQuo.title}
                                </h4>
                                <p className="text-muted-foreground text-sm">{comparison.statusQuo.description}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              {comparison.statusQuo.problems.map((problem, idx) => (
                                <div key={idx} className="flex items-start space-x-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-foreground text-xs">{problem}</span>
                                </div>
                              ))}
                            </div>

                            {/* Impact Metrics for Mobile */}
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t-2 border-red-500/30">
                              {comparison.statusQuo.timeToReport && (
                                <>
                                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Meldezeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.statusQuo.timeToReport}</div>
                                  </div>
                                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Genauigkeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.statusQuo.accuracy}</div>
                                  </div>
                                </>
                              )}
                              {comparison.statusQuo.efficiency && (
                                <>
                                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Effizienz</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.statusQuo.efficiency}</div>
                                  </div>
                                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Sichtbarkeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.statusQuo.visibility}</div>
                                  </div>
                                </>
                              )}
                              {comparison.statusQuo.responseTime && (
                                <>
                                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Antwortzeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.statusQuo.responseTime}</div>
                                  </div>
                                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-red-400 font-bold text-xs uppercase tracking-wider">Kontextbewahrung</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.statusQuo.contextRetention}</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mendigo Card */}
                      <Card className="glass-card border-2 border-green-500/50 transition-all duration-300">
                        <CardContent className="p-4 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-lg"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center mb-3">
                              <div className="p-1.5 bg-green-500/20 rounded-lg mr-3">
                                {comparison.facilityPro.icon}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-1">
                                  {comparison.facilityPro.title}
                                </h4>
                                <p className="text-muted-foreground text-sm">{comparison.facilityPro.description}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              {comparison.facilityPro.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start space-x-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-foreground text-xs">{benefit}</span>
                                </div>
                              ))}
                            </div>

                            {/* Impact Metrics for Mobile */}
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t-2 border-green-500/30">
                              {comparison.facilityPro.timeToReport && (
                                <>
                                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Meldezeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.facilityPro.timeToReport}</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Genauigkeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.facilityPro.accuracy}</div>
                                  </div>
                                </>
                              )}
                              {comparison.facilityPro.efficiency && (
                                <>
                                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Effizienz</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.facilityPro.efficiency}</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Sichtbarkeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.facilityPro.visibility}</div>
                                  </div>
                                </>
                              )}
                              {comparison.facilityPro.responseTime && (
                                <>
                                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Antwortzeit</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.facilityPro.responseTime}</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Kontextbewahrung</div>
                                    <div className="text-foreground font-bold text-sm">{comparison.facilityPro.contextRetention}</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Dots for Mobile */}
              <div className="flex justify-center space-x-2 mt-6">
                {comparisons.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleManualNavigation(index)}
                    aria-label={`Thema ${index + 1} von ${comparisons.length}`}
                    className="p-2 flex items-center justify-center"
                  >
                    <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentTopic === index
                        ? 'bg-blue-500 scale-125'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dots Indicator - Desktop Only */}
          <div className="hidden md:flex justify-center space-x-2 mt-8">
            {comparisons.map((_, index) => (
              <button
                key={index}
                onClick={() => handleManualNavigation(index)}
                aria-label={`Thema ${index + 1} von ${comparisons.length}`}
                className="p-2 flex items-center justify-center"
              >
                <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentTopic === index
                    ? 'bg-blue-500'
                    : 'bg-muted-foreground hover:bg-foreground'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Impact Summary */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {t.statusQuo.impactSummary.title}
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-border text-left">
              <QrCode className="w-8 h-8 text-blue-500 mb-4" />
              <h4 className="text-lg font-bold text-foreground mb-3">{t.statusQuo.impactSummary.metrics.reportingTime.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.statusQuo.impactSummary.metrics.reportingTime.description}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-border text-left">
              <Clock className="w-8 h-8 text-blue-500 mb-4" />
              <h4 className="text-lg font-bold text-foreground mb-3">{t.statusQuo.impactSummary.metrics.resolution.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.statusQuo.impactSummary.metrics.resolution.description}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-border text-left">
              <TrendingDown className="w-8 h-8 text-blue-500 mb-4" />
              <h4 className="text-lg font-bold text-foreground mb-3">{t.statusQuo.impactSummary.metrics.costs.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.statusQuo.impactSummary.metrics.costs.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}