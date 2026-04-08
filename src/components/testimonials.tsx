import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Users } from 'lucide-react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import sarahPhoto from '@/assets/homepage/stock_images/testimonial-sarah.webp';
import marcusPhoto from '@/assets/homepage/stock_images/testimonial-marcus.webp';
import timoPhoto from '@/assets/homepage/testimonial-timo.webp';

export default function Testimonials() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollAnimation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const testimonials = [
    {
      name: t.testimonials.testimonials[0].name,
      title: t.testimonials.testimonials[0].title,
      company: t.testimonials.testimonials[0].company,
      avatar: sarahPhoto,
      rating: 5,
      quote: t.testimonials.testimonials[0].quote,
      metrics: t.testimonials.testimonials[0].metrics
    },
    {
      name: t.testimonials.testimonials[1].name,
      title: t.testimonials.testimonials[1].title,
      company: t.testimonials.testimonials[1].company,
      avatar: marcusPhoto,
      rating: 5,
      quote: t.testimonials.testimonials[1].quote,
      metrics: t.testimonials.testimonials[1].metrics
    },
    {
      name: t.testimonials.testimonials[2].name,
      title: t.testimonials.testimonials[2].title,
      company: t.testimonials.testimonials[2].company,
      avatar: timoPhoto,
      rating: 5,
      quote: t.testimonials.testimonials[2].quote,
      metrics: t.testimonials.testimonials[2].metrics
    }
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <Badge className={`bg-transparent text-blue-500 border-blue-500 mb-4 ${titleVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Users className="w-4 h-4 mr-2" />
            {t.testimonials.badge}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-foreground ${titleVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {t.testimonials.title}
          </h2>
        </div>

        {/* Desktop Grid */}
        <div ref={testimonialsRef} className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className={`glass-card border-border h-full ${testimonialsVisible ? `animate-fade-in-up stagger-${index}` : 'opacity-0'}`}>
              <CardContent className="p-6 h-full flex flex-col">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6 flex-grow">
                  <Quote className="w-8 h-8 text-blue-400 opacity-50 absolute -top-2 -left-1" />
                  <p className="text-muted-foreground italic pl-10">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Metrics */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6">
                  <div className="text-green-600 dark:text-green-400 font-semibold text-sm text-center">
                    {testimonial.metrics}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center mt-auto">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.name} Avatar`} 
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <div className="text-foreground font-semibold">{testimonial.name}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="glass-card border-border">
                    <CardContent className="p-6">
                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      {/* Quote */}
                      <div className="relative mb-6">
                        <Quote className="w-8 h-8 text-blue-400 opacity-50 absolute -top-2 -left-1" />
                        <p className="text-muted-foreground italic pl-10">
                          {testimonial.quote}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6">
                        <div className="text-green-600 dark:text-green-400 font-semibold text-sm text-center">
                          {testimonial.metrics}
                        </div>
                      </div>

                      {/* Author */}
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-4">
                          <img 
                            src={testimonial.avatar} 
                            alt={`${testimonial.name} Avatar`} 
                            loading={index === currentSlide ? "eager" : "lazy"}
                            decoding="async"
                            className="w-11 h-11 object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-foreground font-semibold">{testimonial.name}</div>
                          <div className="text-muted-foreground text-sm">{testimonial.title}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Navigation Dots */}
            <div className="flex justify-center mt-6 space-x-2" role="tablist" aria-label={language === 'de' ? 'Kundenbewertungen Navigation' : 'Customer reviews navigation'}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`${language === 'de' ? 'Bewertung' : 'Review'} ${index + 1} ${language === 'de' ? 'von' : 'of'} ${testimonials.length}`}
                  aria-selected={index === currentSlide}
                  role="tab"
                  className="p-2 flex items-center justify-center"
                >
                  <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-muted-foreground hover:bg-foreground'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}