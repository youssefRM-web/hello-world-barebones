import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useDemoModal } from '@/components/demo-modal-provider';
import { useAuthModal } from '@/components/auth-modal-provider';

export default function CTA() {
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { openDemoModal } = useDemoModal();
  const { openAuthModal } = useAuthModal();
  
  return (
    <section className="py-16 sm:py-20 gradient-bg relative overflow-hidden">
      <div ref={ctaRef} className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-6 ${ctaVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <Rocket className="w-4 h-4 mr-2" />
          {language === 'de' ? 'Bereit für die Transformation?' : 'Ready for Transformation?'}
        </Badge>
        
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground ${ctaVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
          {language === 'de' ? (
            <>
              <span className="block sm:inline">Intelligente Wartung </span>
              <span className="block sm:inline">beginnt mit </span>
              <span className="block sm:inline text-gradient">Mendigo</span>
            </>
          ) : (
            <>
              <span className="block sm:inline">Smart Maintenance </span>
              <span className="block sm:inline">Begins with </span>
              <span className="block sm:inline text-gradient">Mendigo</span>
            </>
          )}
        </h2>
        
        <p className={`text-lg text-muted-foreground mb-8 max-w-3xl mx-auto ${ctaVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
          {language === 'de' 
            ? 'Mit reibungslos funktionierenden Facility-Teams entsteht für Gäste, Bewohner und Besucher genau das Erlebnis, das sie verdienen – Mendigo ist die intelligente, nahtlose Software, die Ihr Team nicht nur nutzt, sondern liebt.'
            : 'With smoothly functioning facility teams, guests, residents, and visitors get exactly the experience they deserve – Mendigo is the intelligent, seamless software that your team doesn\'t just use, but loves.'}
        </p>
        
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${ctaVisible ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
          <Button 
            size="lg"
            onClick={() => openAuthModal('register')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold shadow-lg text-white border-0 w-full sm:w-auto"
          >
            {t.hero.cta}
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={openDemoModal}
            className="border-2 border-border hover:bg-accent hover:border-accent-foreground px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold text-foreground bg-transparent w-full sm:w-auto"
          >
            {t.contact.demo}
          </Button>
        </div>
        
        <p className={`text-sm text-muted-foreground ${ctaVisible ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          {language === 'de' 
            ? 'Keine Kreditkarte erforderlich • 14-tägige kostenlose Testphase'
            : 'No credit card required • 14-day free trial'}
        </p>
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
    </section>
  );
}
