import { Mail, Cookie } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import mendigoLogoBlack from '@/assets/homepage/mendigo-logo-black.png';
import appStoreBadge from '@/assets/homepage/app-store-badge.webp';
import googlePlayBadge from '@/assets/homepage/google-play-badge.webp';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  
  const navigateToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const footerSections = [
    {
      title: t.nav.features,
      links: [
        { name: language === 'de' ? "QR-Code-Meldungen" : "QR Code Reports", action: () => navigateToSection('benefits') },
        { name: language === 'de' ? "Aufgabenverwaltung" : "Task Management", action: () => navigateToSection('benefits') }, 
        { name: language === 'de' ? "Anlagenverfolgung" : "Asset Tracking", action: () => navigateToSection('benefits') },
        { name: language === 'de' ? "Analytics-Dashboard" : "Analytics Dashboard", action: () => navigateToSection('benefits') },
        { name: language === 'de' ? "Mobile App" : "Mobile App", action: () => navigateToSection('benefits') }
      ]
    },
    {
      title: t.footer.legal,
      links: [
        { name: t.footer.impressum, action: () => navigate('/impressum') },
        { name: t.footer.agb, action: () => navigate('/agb') },
        { name: language === 'de' ? "Datenschutz" : "Privacy", action: () => navigate('/datenschutz') },
        { name: language === 'de' ? "Cookie-Einstellungen" : "Cookie Settings", action: () => {
            const cb = (window as any).Cookiebot;
            if (cb) {
              if (typeof cb.renew === 'function') cb.renew();
              else if (typeof cb.show === 'function') cb.show();
            }
          }, isCookie: true
        }
      ]
    },
    {
      title: language === 'de' ? "Menü" : "Menu",
      links: [
        { name: t.nav.features, action: () => navigateToSection('features') },
        { name: t.nav.benefits, action: () => navigateToSection('benefits') },
        { name: t.nav.pricing, action: () => navigateToSection('pricing') },
        { name: t.nav.industries, action: () => navigateToSection('industries') }
      ]
    },
    {
      title: t.nav.contact,
      links: [
        { name: "mendigo@rmsoftware.de", action: () => window.open('mailto:mendigo@rmsoftware.de') }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-[hsl(220,70%,18%)] to-[hsl(220,60%,25%)] pt-16 sm:pt-20 pb-10 sm:pb-12 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12 sm:mb-16">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4 h-10 overflow-hidden -ml-2">
              <img 
                src={mendigoLogoBlack} 
                alt="Mendigo" 
                width={656}
                height={160}
                className="h-[160px] w-auto object-contain object-left"
              />
            </div>
            <p className="text-white/70 mb-6">
              {t.footer.description}
            </p>
            <div className="flex flex-row gap-2 items-end">
              <a 
                href="https://apps.apple.com/de/app/mendigo/id6758513514" 
                className="hover:opacity-80 transition-opacity"
                aria-label={language === 'de' ? 'Mendigo App im App Store herunterladen (bald verfügbar)' : 'Download Mendigo app from App Store (coming soon)'}
              >
                <img 
                  src={appStoreBadge} 
                  alt={language === 'de' ? 'Im App Store laden' : 'Download on App Store'}
                  width={176}
                  height={52}
                  className="w-32 sm:w-44 h-auto object-contain"
                />
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.rmsoftware.mendigo&hl=de&pli=1" 
                className="hover:opacity-80 transition-opacity"
                aria-label={language === 'de' ? 'Mendigo App bei Google Play herunterladen (bald verfügbar)' : 'Download Mendigo app from Google Play (coming soon)'}
              >
                <img 
                  src={googlePlayBadge} 
                  alt={language === 'de' ? 'Jetzt bei Google Play' : 'Get it on Google Play'}
                  width={176}
                  height={52}
                  className="w-32 sm:w-44 h-auto object-contain"
                />
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => {
            const isContactSection = section.title === 'Kontakt' || section.title === 'Contact';
            return (
              <div key={index} className={isContactSection ? 'col-span-2 sm:col-span-1' : ''}>
                <h3 className="font-bold mb-4 text-white text-base">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button 
                        onClick={link.action} 
                        className="text-white/70 hover:text-white transition-colors text-left flex items-center space-x-2"
                      >
                        {isContactSection && <Mail className="h-4 w-4 flex-shrink-0" />}
                        {(link as any).isCookie && <Cookie className="h-4 w-4 flex-shrink-0" />}
                        <span>{link.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/20 pt-8">
          <p className="text-white/60 text-sm text-center">
            © 2026 Mendigo. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}