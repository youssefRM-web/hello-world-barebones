import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Clock, DollarSign, Users, Shield, Smartphone, TrendingUp, Calculator, Info, Wrench, FileText, BarChart, Kanban, Package, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useAuthModal } from '@/components/auth-modal-provider';

export default function Benefits() {
  const { openAuthModal } = useAuthModal();
  const [employees, setEmployees] = useState(3);
  const [buildings, setBuildings] = useState(3);
  const [timeSavedPerTicket, setTimeSavedPerTicket] = useState(60);
  const [ticketsPerMonth, setTicketsPerMonth] = useState(15);
  const [travelTimePerMonth, setTravelTimePerMonth] = useState(120);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [timeSavedTooltipOpen, setTimeSavedTooltipOpen] = useState(false);
  const [travelTimeTooltipOpen, setTravelTimeTooltipOpen] = useState(false);
  
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: calculatorRef, isVisible: calculatorVisible } = useScrollAnimation();
  const { ref: benefitsRef, isVisible: benefitsVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  // Platform costs based on buildings: 1 = €247, 2-5 = €447, >5 = Individual
  const monthlyPlatformCost = buildings === 1 ? 247 : buildings <= 5 ? 447 : 0;
  const isIndividualPricing = buildings > 5;
  
  // Total tickets = tickets per building × number of buildings
  const totalTicketsPerMonth = ticketsPerMonth * buildings;
  
  // Convert time saved to hours for calculation
  const timeSavedInHours = timeSavedPerTicket / 60;
  
  // ROI Calculations
  // Base savings: employees × hours saved × total tickets × hourly rate
  const baseMonthlySavings = employees * timeSavedInHours * totalTicketsPerMonth * hourlyRate;
  
  // Travel time savings: (travel time per month in hours) × hourly rate
  const travelTimeSavings = (travelTimePerMonth / 60) * hourlyRate;
  
  // Total monthly savings
  const monthlySavings = baseMonthlySavings + travelTimeSavings;
  const annualSavings = monthlySavings * 12;
  const annualPlatformCost = monthlyPlatformCost * 12;
  const netAnnualSavings = annualSavings - annualPlatformCost;
  const roi = annualPlatformCost > 0 ? ((netAnnualSavings / annualPlatformCost) * 100) : 0;

  const keyBenefits = t.benefits.keyBenefits.map((benefit, index) => ({
    icon: index === 0 ? <Clock className="w-6 h-6 text-blue-500" /> :
          index === 1 ? <Package className="w-6 h-6 text-green-500" /> :
          index === 2 ? <Kanban className="w-6 h-6 text-blue-400" /> :
          index === 3 ? <Wrench className="w-6 h-6 text-orange-500" /> :
          index === 4 ? <FileText className="w-6 h-6 text-purple-500" /> :
          <BarChart className="w-6 h-6 text-green-600" />,
    title: benefit.title,
    description: benefit.description,
    bgColor: index === 0 ? "bg-blue-500/20" :
             index === 1 ? "bg-green-500/20" :
             index === 2 ? "bg-blue-400/20" :
             index === 3 ? "bg-orange-500/20" :
             index === 4 ? "bg-purple-500/20" :
             "bg-green-600/20"
  }));

  const additionalBenefits = t.benefits.additionalBenefits.map((benefit, index) => ({
    icon: index === 0 ? <Shield className="w-10 h-10 text-blue-500" /> :
          index === 1 ? <Smartphone className="w-10 h-10 text-blue-400" /> :
          <TrendingUp className="w-10 h-10 text-green-500" />,
    title: benefit.title,
    description: benefit.description
  }));

  return (
    <section id="benefits" className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-16">
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${titleVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <TrendingUp className="w-4 h-4 mr-2" />
            {t.benefits.badge}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground ${titleVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {t.benefits.title}
          </h2>
          <p className={`text-lg text-muted-foreground max-w-3xl mx-auto ${titleVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            {t.benefits.subtitle}
          </p>
        </div>

        {/* Key Benefits Grid */}
        <div ref={benefitsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {keyBenefits.map((benefit, index) => (
            <div key={index} className={`p-6 rounded-2xl text-left shadow-lg ring-4 ring-inset ring-white/80 dark:ring-slate-700/50 ${benefitsVisible ? `animate-fade-in-up stagger-${index}` : 'opacity-0'} ${
              index === 0 ? 'bg-gradient-to-br from-purple-100 from-10% via-white via-50% to-white dark:from-purple-900/30 dark:via-slate-800 dark:to-slate-900' :
              index === 1 ? 'bg-gradient-to-br from-blue-100 from-10% via-white via-50% to-white dark:from-blue-900/30 dark:via-slate-800 dark:to-slate-900' :
              index === 2 ? 'bg-gradient-to-br from-pink-100 from-10% via-white via-50% to-white dark:from-pink-900/30 dark:via-slate-800 dark:to-slate-900' :
              index === 3 ? 'bg-gradient-to-br from-purple-100 from-10% via-white via-50% to-white dark:from-purple-900/30 dark:via-slate-800 dark:to-slate-900' :
              index === 4 ? 'bg-gradient-to-br from-red-100 from-10% via-white via-50% to-white dark:from-red-900/30 dark:via-slate-800 dark:to-slate-900' :
              'bg-gradient-to-br from-green-100 from-10% via-white via-50% to-white dark:from-green-900/30 dark:via-slate-800 dark:to-slate-900'
            }`}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-white dark:bg-slate-800 shadow-md">
                {index === 0 && <Clock className="w-7 h-7 text-purple-500" />}
                {index === 1 && <Package className="w-7 h-7 text-blue-500" />}
                {index === 2 && <Kanban className="w-7 h-7 text-pink-500" />}
                {index === 3 && <Wrench className="w-7 h-7 text-purple-500" />}
                {index === 4 && <FileText className="w-7 h-7 text-red-400" />}
                {index === 5 && <BarChart className="w-7 h-7 text-green-500" />}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 max-w-6xl mx-auto">
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">65%</div>
            <div className="text-muted-foreground text-sm">{t.benefits.stats.fasterResponse}</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">30%</div>
            <div className="text-muted-foreground text-sm">{t.benefits.stats.reducedCosts}</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-muted-foreground text-sm">{t.benefits.stats.betterSatisfaction}</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">80%</div>
            <div className="text-muted-foreground text-sm">{language === 'de' ? 'Reduzierung des Papieraufwands' : 'Paper Workflow Reduction'}</div>
          </div>
        </div>



        {/* ROI Calculator - Full Width Section */}
        <div ref={calculatorRef} className="mb-12">
          <div className="text-center mb-8">
            <h3 className={`text-3xl font-bold text-foreground mb-4 ${calculatorVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>{t.benefits.roiCalculator.title}</h3>
            <p className={`text-muted-foreground max-w-2xl mx-auto ${calculatorVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {t.benefits.roiCalculator.subtitle}
            </p>
          </div>
          
          <Card className={`glass-card border-border max-w-5xl mx-auto ${calculatorVisible ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Controls */}
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-6">{t.benefits.roiCalculator.adjustParameters}</h4>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-muted-foreground text-sm">{t.benefits.roiCalculator.buildings}</Label>
                        <span className="text-blue-400 font-bold">{buildings}</span>
                      </div>
                      <Slider
                        value={[buildings]}
                        onValueChange={(value) => setBuildings(value[0])}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                        aria-label="Anzahl der Gebäude"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-muted-foreground text-sm">{t.benefits.roiCalculator.employees}</Label>
                        <span className="text-blue-400 font-bold">{employees}</span>
                      </div>
                      <Slider
                        value={[employees]}
                        onValueChange={(value) => setEmployees(value[0])}
                        max={25}
                        min={2}
                        step={1}
                        className="w-full"
                        aria-label="Anzahl der Mitarbeiter"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>2</span>
                        <span>25</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-muted-foreground text-sm">{t.benefits.roiCalculator.ticketsPerMonthPerBuilding}</Label>
                        <span className="text-blue-400 font-bold">{ticketsPerMonth}</span>
                      </div>
                      <Slider
                        value={[ticketsPerMonth]}
                        onValueChange={(value) => setTicketsPerMonth(value[0])}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                        aria-label="Tickets pro Monat"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>10</span>
                        <span>100</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-muted-foreground text-sm">{t.benefits.roiCalculator.hoursPerTicket}</Label>
                          <Popover open={timeSavedTooltipOpen} onOpenChange={setTimeSavedTooltipOpen}>
                            <PopoverTrigger asChild>
                              <button 
                                type="button" 
                                className="focus:outline-none group"
                                aria-label="Hilfe zur Zeitersparnis pro Ticket"
                                onMouseEnter={() => setTimeSavedTooltipOpen(true)}
                                onMouseLeave={() => setTimeSavedTooltipOpen(false)}
                              >
                                <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-foreground cursor-pointer" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent 
                              side="top" 
                              className="max-w-sm p-3 w-auto"
                              onMouseEnter={() => setTimeSavedTooltipOpen(true)}
                              onMouseLeave={() => setTimeSavedTooltipOpen(false)}
                            >
                              <p className="text-sm font-medium mb-1">{t.benefits.roiCalculator.timeSavedTooltipTitle}</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• {t.benefits.roiCalculator.timeSavedTooltip1}</li>
                                <li>• {t.benefits.roiCalculator.timeSavedTooltip2}</li>
                                <li>• {t.benefits.roiCalculator.timeSavedTooltip3}</li>
                                <li>• {t.benefits.roiCalculator.timeSavedTooltip4}</li>
                              </ul>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <span className="text-blue-400 font-bold">{timeSavedPerTicket >= 60 ? `${Math.floor(timeSavedPerTicket / 60)}h ${timeSavedPerTicket % 60 > 0 ? `${timeSavedPerTicket % 60}min` : ''}` : `${timeSavedPerTicket} min`}</span>
                      </div>
                      <Slider
                        value={[timeSavedPerTicket]}
                        onValueChange={(value) => {
                          const v = value[0];
                          if (v <= 60) {
                            setTimeSavedPerTicket(Math.round(v / 15) * 15);
                          } else {
                            setTimeSavedPerTicket(60 + Math.round((v - 60) / 30) * 30);
                          }
                        }}
                        max={180}
                        min={30}
                        step={15}
                        className="w-full"
                        aria-label="Zeitersparnis pro Ticket"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>30 min</span>
                        <span>3h</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-muted-foreground text-sm">{t.benefits.roiCalculator.travelTimePerTicket}</Label>
                          <Popover open={travelTimeTooltipOpen} onOpenChange={setTravelTimeTooltipOpen}>
                            <PopoverTrigger asChild>
                              <button 
                                type="button" 
                                className="focus:outline-none group"
                                aria-label="Hilfe zur Fahrzeit pro Ticket"
                                onMouseEnter={() => setTravelTimeTooltipOpen(true)}
                                onMouseLeave={() => setTravelTimeTooltipOpen(false)}
                              >
                                <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-foreground cursor-pointer" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent 
                              side="top" 
                              className="max-w-xs p-3 w-auto"
                              onMouseEnter={() => setTravelTimeTooltipOpen(true)}
                              onMouseLeave={() => setTravelTimeTooltipOpen(false)}
                            >
                              <p className="text-sm font-medium mb-1">{t.benefits.roiCalculator.travelTimeTooltipTitle}</p>
                              <p className="text-xs text-muted-foreground">{t.benefits.roiCalculator.travelTimeTooltip}</p>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <span className="text-blue-400 font-bold">{travelTimePerMonth >= 60 ? `${Math.floor(travelTimePerMonth / 60)}h ${travelTimePerMonth % 60 > 0 ? `${travelTimePerMonth % 60}min` : ''}` : `${travelTimePerMonth} min`}</span>
                      </div>
                      <Slider
                        value={[travelTimePerMonth]}
                        onValueChange={(value) => setTravelTimePerMonth(value[0])}
                        max={600}
                        min={60}
                        step={30}
                        className="w-full"
                        aria-label="Fahrzeit pro Monat"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1h</span>
                        <span>10h</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-muted-foreground text-sm">{t.benefits.roiCalculator.hourlyRate}</Label>
                        <span className="text-blue-400 font-bold">€{hourlyRate}</span>
                      </div>
                      <Slider
                        value={[hourlyRate]}
                        onValueChange={(value) => setHourlyRate(value[0])}
                        max={120}
                        min={25}
                        step={5}
                        className="w-full"
                        aria-label="Stundensatz in Euro"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>€25</span>
                        <span>€120</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Breakdown - Moved below sliders */}
                  <div className="p-4 bg-accent/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-4 h-4 text-foreground" />
                      <span className="text-foreground text-sm font-semibold">{t.benefits.roiCalculator.calculation}</span>
                    </div>
                    <div className="text-sm text-foreground space-y-1">
                      <p>{t.benefits.roiCalculator.totalTickets}: {ticketsPerMonth} × {buildings} = {totalTicketsPerMonth} {t.benefits.roiCalculator.tickets}/{t.benefits.roiCalculator.month}</p>
                      <p>{t.benefits.roiCalculator.baseSavings}: {employees} × {timeSavedPerTicket}min × {totalTicketsPerMonth} × €{hourlyRate} = €{Math.round(baseMonthlySavings).toLocaleString()}</p>
                      <p>{t.benefits.roiCalculator.travelSavings}: {travelTimePerMonth}min × €{hourlyRate}/h = €{Math.round(travelTimeSavings).toLocaleString()}</p>
                      <p>{t.benefits.roiCalculator.platformCosts}: {isIndividualPricing ? t.benefits.roiCalculator.individual : `€${monthlyPlatformCost}`}/{t.benefits.roiCalculator.month}</p>
                    </div>
                  </div>
                </div>

                {/* Results - Moved to right side */}
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-6">{t.benefits.roiCalculator.yourResults}</h4>
                  
                  {/* Key Metrics */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg border border-border">
                      <span className="text-foreground">{t.benefits.roiCalculator.results.monthlySavings}</span>
                      <span className="text-emerald-600 font-bold text-xl">€{Math.round(monthlySavings).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg border border-border">
                      <span className="text-foreground">{t.benefits.roiCalculator.results.annualSavings}</span>
                      <span className="text-emerald-600 font-bold text-xl">€{Math.round(annualSavings).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg border border-border">
                      <span className="text-foreground">{t.benefits.roiCalculator.results.platformCostsAnnual}</span>
                      <span className="text-blue-600 font-bold text-xl">{isIndividualPricing ? t.benefits.roiCalculator.individual : `€${annualPlatformCost.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg border border-border">
                      <span className="text-foreground">{t.benefits.roiCalculator.results.netAnnualSavings}</span>
                      <span className="text-emerald-600 font-bold text-xl">{isIndividualPricing ? t.benefits.roiCalculator.contactSales : `€${Math.round(netAnnualSavings).toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="text-foreground">ROI</span>
                      <span className="text-emerald-600 font-bold text-2xl">{isIndividualPricing ? t.benefits.roiCalculator.contactSales : `${roi.toFixed(0)}%`}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <p className="text-emerald-600 text-sm text-center font-semibold">
                      {t.benefits.roiCalculator.results.paybackTime}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* CTA Button */}
          <div className="text-center mt-8">
            <Button 
              size="lg"
              onClick={() => openAuthModal('register')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t.benefits.roiCalculator.saveNow}
            </Button>
            <p className="text-muted-foreground text-sm mt-3">{t.benefits.roiCalculator.freeTrial}</p>
          </div>
        </div>

        {/* Additional Benefits Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {additionalBenefits.map((benefit, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-border text-left">
              {index === 0 && <Shield className="w-8 h-8 text-blue-500 mb-4" />}
              {index === 1 && <Smartphone className="w-8 h-8 text-blue-500 mb-4" />}
              {index === 2 && <TrendingUp className="w-8 h-8 text-blue-500 mb-4" />}
              <h4 className="text-lg font-bold mb-3 text-foreground">{benefit.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
