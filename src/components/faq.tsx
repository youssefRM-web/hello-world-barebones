import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, HelpCircle, Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const faqs = t.faq.items.map((item, index) => ({
    id: `faq-${index}`,
    question: item.question,
    answer: item.answer
  }));

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  return (
    <section className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div ref={titleRef} className="text-center mb-16">
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${titleVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <HelpCircle className="w-4 h-4 mr-2" />
            {t.faq.badge}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground ${titleVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {t.faq.title}
          </h2>
          <p className={`text-lg text-muted-foreground ${titleVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            {t.faq.subtitle}
          </p>
        </div>

        <div ref={faqRef} className="space-y-4">
          {visibleFaqs.map((faq, index) => (
            <Card key={faq.id} className={`glass-card border-border overflow-hidden ${faqVisible ? `animate-fade-in-up stagger-${Math.min(index, 5)}` : 'opacity-0'}`}>
              <button 
                className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-accent/50 transition-colors" 
                onClick={() => toggleFaq(faq.id)}
              >
                <span className="text-base sm:text-lg font-semibold text-foreground pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transform transition-transform flex-shrink-0 ${
                    openFaq === faq.id ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {openFaq === faq.id && (
                <CardContent className="px-6 pb-6">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {faqs.length > 5 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
            >
              {showAll ? (
                <>
                  <Minus className="w-4 h-4 mr-2" />
                  {t.faq.showLess}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.faq.showMore}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
