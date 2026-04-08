import { useEffect } from 'react';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import problemCard1 from '@/assets/homepage/reporting-chaos-card.webp';
import problemCard2 from '@/assets/homepage/task-standstill-card.webp';
import problemCard3 from '@/assets/homepage/communication-card.webp';

const cardImages = [problemCard1, problemCard2, problemCard3];

const preloadImages = () => {
  cardImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.type = 'image/webp';
    document.head.appendChild(link);
  });
};

const translations = {
  de: {
    headline: 'Facility Management',
    headlineAccent: 'heute',
    subtitle: 'Telefonate, E-Mails, WhatsApp, Notizen. Informationen gehen verloren, Aufgaben verzögern sich, Frust baut sich auf.',
    subtitleMobile: '',
    warnings: [],
    cards: [
      {
        title: 'Melde-Chaos',
        points: [
          { text: 'Unterschiedliche Kanäle', bold: false },
          { text: 'Fehlende Fotodokumentation', bold: false },
          { text: 'Ungenaue Ortsangaben', bold: false }
        ],
        footer: {
          icon: 'clock',
          prefix: 'Zeitverlust:',
          highlight: '5–15 Min. pro Meldung',
          suffix: ''
        }
      },
      {
        title: 'Aufgaben-Stillstand',
        points: [
          { text: 'Analoge Listen & Whiteboards', bold: false },
          { text: 'Kein Echtzeit-Status', bold: false },
          { text: 'Manuelles Nachverfolgen', bold: false }
        ],
        footer: {
          icon: 'warning',
          prefix: 'Problem:',
          highlight: 'Keine Transparenz im Team',
          suffix: ''
        }
      },
      {
        title: 'Kommunikation',
        points: [
          { text: 'Telefon-Pingpong', bold: false },
          { text: 'Unübersichtliche E-Mail-Verläufe', bold: false },
          { text: 'Verstreute Informationen', bold: false }
        ],
        footer: {
          icon: 'zap',
          prefix: 'Folge:',
          highlight: 'Sehr lange Antwortzeiten',
          suffix: ''
        }
      }
    ]
  },
  en: {
    headline: 'The current state of',
    headlineAccent: 'Facility Management',
    subtitle: 'Phone calls, emails, WhatsApp, notes. Information gets lost, tasks are delayed, frustration builds.',
    subtitleMobile: '',
    warnings: [],
    cards: [
      {
        title: 'Reporting chaos',
        points: [
          { text: 'Different channels', bold: false },
          { text: 'Lack of photo documentation', bold: false },
          { text: 'Inaccurate location information', bold: false }
        ],
        footer: {
          icon: 'clock',
          prefix: 'Time lost:',
          highlight: '5–15 minutes',
          suffix: 'per report'
        }
      },
      {
        title: 'Task standstill',
        points: [
          { text: 'Analog lists & whiteboards', bold: false },
          { text: 'No real-time status', bold: false },
          { text: 'Manual tracking', bold: false }
        ],
        footer: {
          icon: 'warning',
          prefix: 'Problem:',
          highlight: 'No transparency within the team',
          suffix: ''
        }
      },
      {
        title: 'Communication',
        points: [
          { text: 'Phone ping-pong', bold: false },
          { text: 'Confusing email threads', bold: false },
          { text: 'Scattered information', bold: false }
        ],
        footer: {
          icon: 'zap',
          prefix: 'Consequence:',
          highlight: 'Very long response times',
          suffix: ''
        }
      }
    ]
  }
};

const FooterIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'clock':
      return <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case 'zap':
      return <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    default:
      return null;
  }
};

export default function ProblemSection() {
  const { language } = useLanguage();
  const t = translations[language];
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  useEffect(() => {
    preloadImages();
  }, []);

  return (
    <section 
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-gray-50 text-foreground overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className={`text-left md:text-center mb-6 md:mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-gray-900">
            {t.headline}{' '}
            <span className="text-gray-900">{t.headlineAccent}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-5xl md:mx-auto mb-8 md:mb-12">
            {t.subtitle}
            {t.subtitleMobile && (
              <>
                <span className="hidden md:inline"> {t.subtitleMobile}</span>
                <span className="block md:hidden mt-2">{t.subtitleMobile}</span>
              </>
            )}
          </p>
          
          <div className="flex flex-col items-center gap-3 md:gap-4">
            {t.warnings.map((warning, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 text-left transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm md:text-base">{warning}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {t.cards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full transition-all duration-500 hover:shadow-lg overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${400 + index * 150}ms` }}
            >
              <div className="w-full h-48 flex items-center justify-center p-6" style={{ backgroundColor: '#0a3263' }}>
                <img 
                  src={cardImages[index]} 
                  alt={card.title}
                  loading="eager"
                  decoding="sync"
                  className="max-w-full max-h-full object-contain"
                  style={{ contentVisibility: 'auto' }}
                />
              </div>
              
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h3>
                
                <ul className="space-y-3 mb-auto">
                  {card.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2 text-base">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span className={point.bold ? 'text-gray-900 font-semibold' : 'text-gray-600'}>
                        {point.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center gap-3 pt-5 mt-6 border-t border-gray-100">
                  <FooterIcon type={card.footer.icon} />
                  <p className="text-base text-gray-500">
                    {card.footer.prefix && <span className="text-gray-900 font-semibold">{card.footer.prefix} </span>}
                    <span>{card.footer.highlight}</span>
                    {card.footer.suffix && <span> {card.footer.suffix}</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
