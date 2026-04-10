/**
 * =============================================================================
 * PRICING COMPONENT - Pricing Plans Display
 * =============================================================================
 * 
 * Displays the available pricing tiers:
 * - Starter: Entry-level plan for small teams
 * - Professional: Most popular plan with full features
 * - Enterprise: Custom pricing for large organizations
 * 
 * Features:
 * - Highlight badge for "Most Popular" plan
 * - Feature comparison lists
 * - CTA buttons (trial / contact sales)
 * - Scroll-triggered animations
 * =============================================================================
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard } from 'lucide-react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useAuthModal } from '@/components/auth-modal-provider';
import { useContactSales } from '@/components/contact-sales-provider';

/**
 * Pricing Component
 * -----------------
 * Displays pricing plans with features and CTAs.
 */
export default function Pricing() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: plansRef, isVisible: plansVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { openAuthModal } = useAuthModal();
  const { openContactSales } = useContactSales();
  
  const plans = [
    {
      name: t.pricing.enterprise.lets,
      description: t.pricing.enterprise.subb,
      // price: t.pricing.enterprise.price,
      period: t.pricing.enterprise.period,
      features: t.pricing.enterprise.features,
      buttonText: t.contact.sales,
      buttonVariant: "default" as const,
      popular: true,
      isEnterprise: true
    }
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-16">
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${titleVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <CreditCard className="w-4 h-4 mr-2" />
            {language === 'de' ? 'UNSERE TARIFE' : 'OUR PLANS'}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground ${titleVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {t.pricing.title}
          </h2>
          <h3 className={`text-base text-muted-foreground`}>
            {plans[0].description}
          </h3>
      
        </div>

        <div ref={plansRef} className="grid gap-6 md:gap-8 max-w-md mx-auto mt-2 ">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`glass-card border relative hover:scale-105 transition-all duration-300  ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-border hover:border-accent-foreground'
              } ${'isEnterprise' in plan && plan.isEnterprise ? 'bg-gradient-to-b from-[hsl(220,70%,12%)] to-[hsl(220,55%,32%)]' : ''} ${plansVisible ? `animate-fade-in-up stagger-${index}` : 'opacity-0'}`}
            >
              {'isMostPopular' in plan && plan.isMostPopular && (
                <Badge className="absolute -top-3 left-1/3 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 px-4 py-1">
                  {language === 'de' ? 'Am Beliebtesten' : 'Most Popular'}
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className={`text-2xl font-bold ${'isEnterprise' in plan && plan.isEnterprise ? 'text-white' : 'text-foreground'}`}>{plan.name}</CardTitle>
                {/* {plan.description && (
                  <CardDescription className={`text-base ${'isEnterprise' in plan && plan.isEnterprise ? 'text-white/70' : 'text-muted-foreground'}`} dangerouslySetInnerHTML={{ __html: plan.description }} />
                )} */}
                {/* {(plan.price || plan.period) && (
                  <div className="mt-6">
                    <span className={`text-4xl font-bold ${'isEnterprise' in plan && plan.isEnterprise ? 'text-white' : 'text-foreground'}`}>{plan.price}</span>
                    <span className={`ml-1 ${'isEnterprise' in plan && plan.isEnterprise ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {plan.period.includes('(') ? (
                        <>
                          {plan.period.split('(')[0]}
                          <span className="text-xs">({plan.period.split('(')[1]}</span>
                        </>
                      ) : plan.period}
                    </span>
                    <div className={`text-xs mt-1 h-4 ${'isEnterprise' in plan && plan.isEnterprise ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {plan.period ? t.pricing.billingNote : '\u00A0'}
                    </div>
                  </div>
                )} */}
              </CardHeader>
              
              <CardContent className="pt-0 flex flex-col flex-1">
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={`flex items-center ${'isEnterprise' in plan && plan.isEnterprise ? 'text-white' : 'text-foreground'}`}>
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`mt-auto w-full py-3 font-semibold text-sm ${
                    plan.buttonVariant === 'default' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0' 
                      : 'bg-transparent border-2 border-border text-foreground hover:bg-accent hover:border-accent-foreground'
                  }`}
                  variant={plan.buttonVariant === 'default' ? 'default' : 'outline'}
                  onClick={'isEnterprise' in plan && plan.isEnterprise ? openContactSales : () => openAuthModal('register')}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
