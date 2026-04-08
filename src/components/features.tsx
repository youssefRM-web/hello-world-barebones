/**
 * =============================================================================
 * FEATURES COMPONENT - Product Features Showcase
 * =============================================================================
 * 
 * Displays the main product features in a visual card layout:
 * - QR Code instant reporting
 * - Smart workflow management  
 * - Asset management dashboard
 * 
 * Features:
 * - Scroll-triggered animations
 * - Interactive visual elements
 * - Multi-language support
 * - Responsive grid layout
 * =============================================================================
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckSquare, Building, FileText, BarChart3, Users, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import officeCorridor from "@/assets/homepage/office-corridor.webp";
import qrScanImage from "@/assets/homepage/qr-code-scan.webp";
import { FadeInUp, FadeInLeft, FadeInRight, StaggerContainer, StaggerItem } from '@/components/page-transition';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';

/**
 * Features Component
 * ------------------
 * Showcases product capabilities with animated feature cards.
 */
export default function Features() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const mainFeatures = [
    {
      icon: <QrCode className="w-12 h-12 text-blue-500" />,
      title: t.features.instantReporting.title,
      description: t.features.instantReporting.description,
      visual: (
        <div className="relative w-48 rounded-2xl overflow-hidden" style={{ height: '240px' }}>
          <img 
            src={qrScanImage} 
            alt="QR-Code-Scan" 
            className="w-full h-full object-cover"
          />
          {/* Software Interface Overlay */}
          <div className="absolute bottom-4 left-6 right-6 bg-white/70 backdrop-blur-md p-2 rounded-lg shadow-2xl" style={{
            border: '3px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)'
          }}>
            {/* Metrics */}
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded p-1.5">
              <div className="text-base font-black text-blue-600">65%</div>
              <div className="text-xs text-gray-600">{t.features.instantReporting.metric}</div>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-white/95",
      textColor: "text-gray-800"
    },
    {
      icon: <CheckSquare className="w-12 h-12 text-green-500" />,
      title: t.features.smartWorkflow.title,
      description: t.features.smartWorkflow.description,
      features: t.features.smartWorkflow.features,
      visual: (
        <div className="bg-green-500 text-white p-3 md:p-4 rounded-xl w-20 md:w-28">
          <div className="flex items-center justify-center h-12 md:h-20">
            <div className="space-y-1 md:space-y-2">
              <div className="bg-white/20 h-1.5 md:h-2 w-6 md:w-8 rounded"></div>
              <div className="bg-white/40 h-1.5 md:h-2 w-8 md:w-12 rounded"></div>
              <div className="bg-white/60 h-1.5 md:h-2 w-4 md:w-6 rounded"></div>
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold">+187%</div>
          <div className="text-xs opacity-80">{t.features.smartWorkflow.metric}</div>
        </div>
      ),
      bgColor: "bg-white/95",
      textColor: "text-gray-800"
    }
  ];

  const largeFeature = {
    badge: t.features.assetManagement.badge,
    title: t.features.assetManagement.title,
    subtitle: t.features.assetManagement.subtitle,
    description: t.features.assetManagement.description,
    features: t.features.assetManagement.features,
    visual: (
      <div className="relative rounded-2xl overflow-hidden h-80">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${officeCorridor})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60"></div>
        </div>
        
        {/* Dashboard Overlay with Color Effect */}
        <div className="absolute bottom-4 left-4 w-64">
          {/* Colorful Glow Background */}
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-emerald-500/20 rounded-2xl blur-xl opacity-60"></div>
          <div className="absolute -inset-2 bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-emerald-400/30 rounded-xl blur-lg opacity-40"></div>
          
          {/* Compact Dashboard */}
          <div className="relative bg-white/70 backdrop-blur-xl p-3 rounded-lg shadow-2xl" style={{
            border: '4px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)'
          }}>
            {/* Header with Status and Location */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1">
                <div className="relative">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping opacity-50"></div>
                </div>
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t.features.assetManagement.dashboard.liveLabel}
                </span>
              </div>
              <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full">
                {t.features.assetManagement.dashboard.building}
              </div>
            </div>
            
            {/* Horizontal Metrics Row */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded p-1.5">
                <div className="text-sm font-black text-gray-800">247</div>
                <div className="text-xs text-gray-600">{t.features.assetManagement.dashboard.total}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded p-1.5">
                <div className="text-sm font-black text-emerald-600">234</div>
                <div className="text-xs text-gray-600">{t.features.assetManagement.dashboard.active}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded p-1.5">
                <div className="text-sm font-black text-orange-600">13</div>
                <div className="text-xs text-gray-600">{t.features.assetManagement.dashboard.issues}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    bgColor: "bg-white/95",
    textColor: "text-gray-800"
  };

  return (
    <section id="features" className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-16">
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${titleVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Sparkles className="w-4 h-4 mr-2" />
            {t.features.badge}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground max-w-[820px] mx-auto ${titleVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {t.features.title}
          </h2>
        </div>

        {/* Main Features Grid - Mobile Optimized */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Top Left - Small Card */}
          <Card className={`${mainFeatures[0].bgColor} border-0 p-6 md:p-8 rounded-3xl shadow-lg ${gridVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="flex-1 order-2 md:order-1">
                <h3 className={`text-2xl md:text-3xl font-bold ${mainFeatures[0].textColor} mb-4 md:mb-6 leading-tight`}>
                  {mainFeatures[0].title}
                </h3>
                <p className={`${mainFeatures[0].textColor} opacity-70 text-sm md:text-base leading-relaxed`}>
                  {mainFeatures[0].description}
                </p>
              </div>
              <div className="flex-shrink-0 mx-auto order-1 md:order-2">
                {mainFeatures[0].visual}
              </div>
            </div>
          </Card>

          {/* Top Right - Large Card */}
          <Card className={`${largeFeature.bgColor} border-0 p-6 md:p-8 rounded-3xl shadow-lg lg:row-span-2 ${gridVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            <div className="flex flex-col h-full">
              <Badge className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full mb-4 w-fit">
                {largeFeature.badge}
              </Badge>
              <h3 className={`text-2xl md:text-3xl font-bold ${largeFeature.textColor} mb-2`}>
                {largeFeature.title}
              </h3>
              <p className={`${largeFeature.textColor} opacity-70 mb-2 text-sm md:text-base`}>
                {largeFeature.subtitle}
              </p>
              <p className="text-gray-800 opacity-60 md:text-sm mb-6 text-[14px]">
                {largeFeature.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-8">
                {largeFeature.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className={`${largeFeature.textColor} opacity-80 text-xs md:text-sm`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                {largeFeature.visual}
              </div>
            </div>
          </Card>

          {/* Bottom Left - Small Card */}
          <Card className={`${mainFeatures[1].bgColor} border-0 p-6 md:p-8 rounded-3xl shadow-lg ${gridVisible ? 'animate-fade-in-left stagger-2' : 'opacity-0'}`}>
            <div className="flex flex-col h-full">
              {/* Top section with visual and title/description side by side */}
              <div className="flex flex-row items-start gap-4 md:gap-6 mb-6">
                <div className="flex-shrink-0">
                  {mainFeatures[1].visual}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg md:text-2xl font-bold ${mainFeatures[1].textColor} mb-2 md:mb-3`}>
                    {mainFeatures[1].title}
                  </h3>
                  <p className={`${mainFeatures[1].textColor} opacity-70 text-xs md:text-base leading-relaxed`}>
                    {mainFeatures[1].description}
                  </p>
                </div>
              </div>
              
              {/* Bottom section with feature list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {mainFeatures[1].features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 justify-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-800 opacity-80 text-[12px]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
