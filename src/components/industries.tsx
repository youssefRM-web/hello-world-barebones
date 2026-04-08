import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Building2, Wrench, Hotel, Volleyball, Heart, CheckCircle } from 'lucide-react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useDemoModal } from '@/components/demo-modal-provider';

import propertyManagementImg from '@/assets/homepage/property-management.webp';
import cleaningServiceImg from '@/assets/homepage/stock_images/cleaning-service.webp';
import hotelImg from '@/assets/homepage/stock_images/hotel-lobby.webp';
import sportsImg from '@/assets/homepage/sports-facilities.webp';
import healthcareImg from '@/assets/homepage/stock_images/healthcare-facility.webp';

const allImages = [propertyManagementImg, cleaningServiceImg, hotelImg, sportsImg, healthcareImg];

export default function Industries() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState("hausverwaltung");
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { openDemoModal } = useDemoModal();

  useEffect(() => {
    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const industriesData = [
    {
      id: "hausverwaltung",
      icon: <Building2 className="w-5 h-5" />,
      title: t.industries?.propertyManagement?.title || 'Hausverwaltungen',
      shortTitle: t.industries?.propertyManagement?.shortTitle || 'Hausverwaltung',
      category: t.industries?.propertyManagement?.category || 'Immobilien',
      categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      heroImage: propertyManagementImg,
      headline: t.industries?.propertyManagement?.headline || 'Schluss mit verlorenen Meldungen und unzufriedenen Mietern',
      description: t.industries?.propertyManagement?.description || 'Verwandeln Sie chaotische Kommunikation in einen reibungslosen digitalen Workflow.',
      painPoints: t.industries?.propertyManagement?.painPoints || [],
      bgGradient: "from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-500/20"
    },
    {
      id: "hausmeister",
      icon: <Wrench className="w-5 h-5" />,
      title: t.industries.cleaning.title,
      shortTitle: t.industries.cleaning.shortTitle,
      category: t.industries.cleaning.category,
      categoryColor: "bg-green-500/20 text-green-400 border-green-500/30",
      heroImage: cleaningServiceImg,
      headline: t.industries.cleaning.headline,
      description: t.industries.cleaning.description,
      painPoints: t.industries.cleaning.painPoints,
      bgGradient: "from-green-500/10 to-green-600/5",
      borderColor: "border-green-500/20"
    },
    {
      id: "hotels",
      icon: <Hotel className="w-5 h-5" />,
      title: t.industries.hotels.title,
      shortTitle: t.industries.hotels.shortTitle,
      category: t.industries.hotels.category,
      categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      heroImage: hotelImg,
      headline: t.industries.hotels.headline,
      description: t.industries.hotels.description,
      painPoints: t.industries.hotels.painPoints,
      bgGradient: "from-purple-500/10 to-purple-600/5",
      borderColor: "border-purple-500/20"
    },
    {
      id: "sport",
      icon: <Volleyball className="w-5 h-5" />,
      title: t.industries.sports.title,
      shortTitle: t.industries.sports.shortTitle,
      category: t.industries.sports.category,
      categoryColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      heroImage: sportsImg,
      headline: t.industries.sports.headline,
      description: t.industries.sports.description,
      painPoints: t.industries.sports.painPoints,
      bgGradient: "from-orange-500/10 to-orange-600/5",
      borderColor: "border-orange-500/20"
    },
    {
      id: "healthcare",
      icon: <Heart className="w-5 h-5" />,
      title: t.industries.healthcare.title,
      shortTitle: t.industries.healthcare.shortTitle,
      category: t.industries.healthcare.category,
      categoryColor: "bg-red-500/20 text-red-400 border-red-500/30",
      heroImage: healthcareImg,
      headline: t.industries.healthcare.headline,
      description: t.industries.healthcare.description,
      painPoints: t.industries.healthcare.painPoints,
      bgGradient: "from-red-500/10 to-red-600/5",
      borderColor: "border-red-500/20"
    }
  ];

  const industries = industriesData;
  const currentIndustry = industries.find(industry => industry.id === activeTab) || industries[0];

  return (
    <section id="industries" className="py-10 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div ref={titleRef} className={`text-center mb-10 ${titleVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${titleVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            <Building2 className="w-4 h-4 mr-2" />
            {t.industries.badge}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground ${titleVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            {t.industries.title}
          </h2>
          <p className={`text-lg text-muted-foreground max-w-4xl mx-auto ${titleVisible ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
            {t.industries.subtitle}
          </p>
        </div>

        {/* Tabs System */}
        <div ref={contentRef} className={`max-w-7xl mx-auto ${contentVisible ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation - Mobile Optimized */}
            <TabsList className="w-full mb-6 bg-accent/50 p-1 md:p-2 h-auto">
              {/* Mobile: 2 rows layout */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1 w-full">
                {industries.map((industry) => (
                  <TabsTrigger
                    key={industry.id}
                    value={industry.id}
                    className="group flex flex-col items-center p-2 md:p-3 text-xs md:text-xs font-medium transition-all duration-300 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-md data-[state=active]:scale-[1.02] border border-transparent data-[state=active]:border-blue-500/30 min-h-[60px] md:min-h-[70px]"
                    data-testid={`tab-${industry.id}`}
                  >
                    <div className="mb-1 md:mb-2 text-muted-foreground group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300">
                      {industry.icon}
                    </div>
                    <span className="text-center leading-tight text-[10px] md:text-xs">{industry.shortTitle}</span>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>

            {/* Tab Content - forceMount keeps images in DOM to prevent reload */}
            {industries.map((industry) => (
              <TabsContent 
                key={industry.id} 
                value={industry.id} 
                className={`mt-0 ${activeTab === industry.id ? '' : 'hidden'}`}
                forceMount
              >
                <Card className={`glass-card border-2 ${industry.borderColor} overflow-hidden`}>
                  <div className="grid lg:grid-cols-5 gap-0 lg:items-stretch">
                    {/* Hero Image Side - takes 2 of 5 columns */}
                    <div className="relative h-48 md:h-56 lg:h-auto lg:col-span-2">
                      <img 
                        src={industry.heroImage}
                        alt={`${industry.title} Header`}
                        loading={activeTab === industry.id ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${industry.bgGradient} opacity-98`}></div>
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="absolute top-4 left-4 lg:top-6 lg:left-6">
                        <Badge className={`${industry.categoryColor} mb-2 text-xs`}>
                          {industry.category}
                        </Badge>
                        <div className="flex items-center text-white mb-2">
                          <div className="p-1.5 lg:p-2 bg-white/20 rounded-lg mr-2 lg:mr-3">
                            {industry.id === "hausverwaltung" && <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
                            {industry.id === "hausmeister" && <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
                            {industry.id === "hotels" && <Hotel className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
                            {industry.id === "sport" && <Volleyball className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
                            {industry.id === "healthcare" && <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
                          </div>
                          <h3 className="text-lg lg:text-xl font-bold">{industry.title}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Content Side - takes 3 of 5 columns */}
                    <CardContent className="p-4 md:p-5 lg:p-6 lg:col-span-3 lg:flex lg:flex-col lg:justify-start">
                      <div className="space-y-3 md:space-y-4">
                        {/* Headlines */}
                        <div>
                          <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 leading-tight">
                            {industry.headline}
                          </h4>
                          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                            {industry.description}
                          </p>
                        </div>

                        {/* Pain Points & Solutions */}
                        <div className="space-y-2">
                          <h5 className="text-sm md:text-base font-semibold text-foreground mb-2">
                            {t.industries.solutionHeadline}
                          </h5>
                          {industry.painPoints.map((point, idx) => (
                            <div key={idx} className="p-3 md:p-4 bg-accent/30 rounded-lg border border-border">
                              <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-muted-foreground">
                                    {t.industries.problemLabel} <span className="text-red-400">{point.problem}</span>
                                  </div>
                                  <div className="text-sm font-medium text-foreground">
                                    {t.industries.solutionLabel} {point.solution}
                                  </div>
                                  <div className="inline-flex items-center px-2 py-1 bg-green-600/20 text-green-600 dark:text-green-400 rounded text-sm font-semibold">
                                    ✓ {point.metric}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="pt-2 md:pt-3">
                          <Button 
                            size="default"
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            data-testid="button-industry-consultation"
                            onClick={openDemoModal}
                          >
                            <span className="hidden md:inline">{t.industries.freeDemoButton} {industry.shortTitle}</span>
                            <span className="md:hidden">{t.industries.requestDemoMobile}</span>
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}