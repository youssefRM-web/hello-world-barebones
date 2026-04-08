import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SparklesText } from '@/components/ui/sparkles-text';
import { QrCode, Clock, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useDemoModal } from '@/components/demo-modal-provider';
import card1Image from '@/assets/homepage/qr-demo-step-1.webp';
import card2Image from '@/assets/homepage/qr-demo-step-2.webp';
import card3Image from '@/assets/homepage/qr-demo-step-3.webp';
import demoQrCode from '@/assets/homepage/demo-qr-code.png';

export default function QrDemo() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { openDemoModal } = useDemoModal();
  const steps = [
    {
      number: 1,
      title: t.qrDemo.steps[0].title,
      description: t.qrDemo.steps[0].description,
      bgColor: "bg-blue-500",
      image: card1Image
    },
    {
      number: 2,
      title: t.qrDemo.steps[1].title,
      description: t.qrDemo.steps[1].description,
      bgColor: "bg-blue-400",
      image: card2Image
    },
    {
      number: 3,
      title: t.qrDemo.steps[2].title,
      description: t.qrDemo.steps[2].description,
      bgColor: "bg-green-500",
      image: card3Image
    }
  ];

  return (
    <section className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
              {t.qrDemo.title}{' '}
              <SparklesText 
                text={t.qrDemo.titleHighlight} 
                className="text-3xl sm:text-4xl"
                colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
                sparklesCount={16}
              />
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.qrDemo.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-lg border border-border text-left">
                <div className="h-44 flex items-center justify-center mb-4">
                  <img
                    src={step.image}
                    alt={step.title}
                    loading="lazy"
                    decoding="async"
                    className={`object-contain ${index === 0 ? 'w-40 h-40' : 'w-48 h-48'}`}
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-[hsl(220,70%,18%)] to-[hsl(220,60%,32%)] rounded-2xl p-8 border border-blue-500/30">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-white mb-4">{t.qrDemo.liveDemo.title}</h3>
                  <p className="text-white/70 mb-6">
                    {t.qrDemo.liveDemo.descriptionLine1}
                    <br className="hidden md:inline" />
                    {' '}{t.qrDemo.liveDemo.descriptionLine2}
                  </p>
                  <Button onClick={openDemoModal} className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm">{t.qrDemo.liveDemo.button}</Button>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                    <img 
                      src={demoQrCode}
                      alt="Demo QR-Code"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2 text-center">
                    {t.qrDemo.liveDemo.qrDescriptionPart1}
                    <a 
                       href="https://www.mendigo.de/report?type=space&id=69c45b5012c99142e06ebc91&org=69be6f177bfd6e4803335c97&building=69be71f67bfd6e4803335ca6&name=Eingangshalle%20Test"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {t.qrDemo.liveDemo.qrDescriptionLink}
                    </a>
                    {t.qrDemo.liveDemo.qrDescriptionPart2}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-6xl mx-auto mt-16 sm:mt-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              {t.statusQuo.impactSummary.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-lg border border-border text-left">
              <QrCode className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-3">
                {t.statusQuo.impactSummary.metrics.reportingTime.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.statusQuo.impactSummary.metrics.reportingTime.description}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-lg border border-border text-left">
              <Clock className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-3">
                {t.statusQuo.impactSummary.metrics.resolution.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.statusQuo.impactSummary.metrics.resolution.description}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-lg border border-border text-left">
              <TrendingDown className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-3">
                {t.statusQuo.impactSummary.metrics.costs.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.statusQuo.impactSummary.metrics.costs.description}
              </p>
            </div>
          </div>
        </div>
    </section>
  );
}
