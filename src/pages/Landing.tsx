import { useLanguage } from "@/contexts/LanguageContext";
import { landingTranslations } from "@/lib/landingTranslations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import {
  Sparkles, UtensilsCrossed, ShoppingCart, MapPin,
  BarChart3, Globe, Play, Check, Clock, TrendingUp,
  ShieldCheck, Heart, Star, ArrowRight, Menu, X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Landing = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (key: string) => {
    const tr = landingTranslations[key];
    return tr ? tr[language] : key;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-extrabold text-foreground">
            call<span className="text-primary">2</span>Food
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("landingFeatures")}</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("landingHowItWorks")}</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("landingPricing")}</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("landingTestimonials")}</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "de" : "en")}
              className="text-xs font-medium px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === "en" ? "DE" : "EN"}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>{t("landingLogin")}</Button>
            <Button size="sm" onClick={() => navigate("/auth")}>{t("landingGetStarted")}</Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border px-4 pb-4 flex flex-col gap-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2">{t("landingFeatures")}</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2">{t("landingHowItWorks")}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2">{t("landingPricing")}</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2">{t("landingTestimonials")}</a>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setLanguage(language === "en" ? "de" : "en")} className="text-xs font-medium px-2 py-1 rounded border border-border">
                {language === "en" ? "DE" : "EN"}
              </button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>{t("landingLogin")}</Button>
              <Button size="sm" onClick={() => navigate("/auth")}>{t("landingGetStarted")}</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Restaurant food" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 lg:py-44">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-up">
              {t("heroHeadline")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-up" style={{ animationDelay: "0.15s" }}>
              {t("heroSubheadline")}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" className="text-base px-8 py-6 rounded-full shadow-lg" onClick={() => navigate("/auth")}>
                {t("heroCtaPrimary")} <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-full bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Play size={18} /> {t("heroCtaSecondary")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6">{t("trustBarText")}</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-40">
            {["RestoPro", "FoodieHub", "DineFlow", "MenuCloud", "OrderNow"].map((name) => (
              <span key={name} className="text-lg md:text-xl font-bold text-foreground tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("featuresSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, titleKey: "featureAiTitle", descKey: "featureAiDesc" },
              { icon: UtensilsCrossed, titleKey: "featureMenuTitle", descKey: "featureMenuDesc" },
              { icon: ShoppingCart, titleKey: "featureOrderTitle", descKey: "featureOrderDesc" },
              { icon: MapPin, titleKey: "featureTrackingTitle", descKey: "featureTrackingDesc" },
              { icon: BarChart3, titleKey: "featureAnalyticsTitle", descKey: "featureAnalyticsDesc" },
              { icon: Globe, titleKey: "featureLanguageTitle", descKey: "featureLanguageDesc" },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t(titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("howItWorksTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("howItWorksSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, titleKey: "step1Title", descKey: "step1Desc", icon: Sparkles },
              { step: 2, titleKey: "step2Title", descKey: "step2Desc", icon: Globe },
              { step: 3, titleKey: "step3Title", descKey: "step3Desc", icon: ShoppingCart },
              { step: 4, titleKey: "step4Title", descKey: "step4Desc", icon: TrendingUp },
            ].map(({ step, titleKey, descKey, icon: Icon }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-primary/25">
                  {step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t(titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("benefitsTitle")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("benefitsSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Clock, titleKey: "benefit1Title", descKey: "benefit1Desc" },
              { icon: TrendingUp, titleKey: "benefit2Title", descKey: "benefit2Desc" },
              { icon: ShieldCheck, titleKey: "benefit3Title", descKey: "benefit3Desc" },
              { icon: Heart, titleKey: "benefit4Title", descKey: "benefit4Desc" },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="text-primary" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{t(titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("testimonialsTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("testimonialsSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-6 italic">
                  "{t(`testimonial${i}Text`)}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {t(`testimonial${i}Name`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(`testimonial${i}Name`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`testimonial${i}Role`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("pricingTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("pricingSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow flex flex-col">
              <h3 className="text-lg font-bold text-foreground mb-2">{t("pricingStarter")}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{t("pricingStarterPrice")}</span>
                <span className="text-muted-foreground text-sm">{t("pricingStarterPeriod")}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary shrink-0" /> {t(`pricingStarterFeature${i}`)}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full" onClick={() => navigate("/auth")}>{t("pricingChoose")}</Button>
            </div>
            {/* Pro */}
            <div className="p-8 rounded-2xl bg-card border-2 border-primary shadow-xl shadow-primary/10 flex flex-col relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4">{t("pricingMostPopular")}</Badge>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("pricingPro")}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{t("pricingProPrice")}</span>
                <span className="text-muted-foreground text-sm">{t("pricingProPeriod")}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary shrink-0" /> {t(`pricingProFeature${i}`)}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-full" onClick={() => navigate("/auth")}>{t("pricingChoose")}</Button>
            </div>
            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow flex flex-col">
              <h3 className="text-lg font-bold text-foreground mb-2">{t("pricingEnterprise")}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{t("pricingEnterprisePrice")}</span>
                <span className="text-muted-foreground text-sm">{t("pricingEnterprisePeriod")}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary shrink-0" /> {t(`pricingEnterpriseFeature${i}`)}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full">{t("pricingContact")}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-6">{t("finalCtaTitle")}</h2>
          <p className="text-lg text-primary-foreground/70 mb-10">{t("finalCtaSubtitle")}</p>
          <Button size="lg" className="text-base px-10 py-6 rounded-full shadow-lg shadow-primary/30" onClick={() => navigate("/auth")}>
            {t("finalCtaButton")} <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-extrabold text-primary-foreground">
                call<span className="text-primary">2</span>Food
              </span>
              <p className="text-sm text-primary-foreground/50 mt-3">
                {language === "en" ? "The modern restaurant platform." : "Die moderne Restaurant-Plattform."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary-foreground mb-3">{t("footerProduct")}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/50">
                <li><a href="#features" className="hover:text-primary-foreground transition-colors">{t("landingFeatures")}</a></li>
                <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">{t("landingPricing")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary-foreground mb-3">{t("footerCompany")}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/50">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footerAbout")}</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footerBlog")}</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footerCareers")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary-foreground mb-3">{t("footerLegal")}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/50">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footerPrivacy")}</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footerTerms")}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 pt-8 text-center">
            <p className="text-sm text-primary-foreground/40">{t("footerRights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
