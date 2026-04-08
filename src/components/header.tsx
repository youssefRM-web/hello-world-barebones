import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar } from 'lucide-react';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoModal } from '@/components/demo-modal-provider';
import { AuthModals } from '@/components/modals';
import mendigoLogo from '@/assets/homepage/mendigo-logo-white.webp';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { openDemoModal } = useDemoModal();
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register" | "forgot-password" | "reset-password">("login");

  const openAuthModal = (type: "login" | "register" | "forgot-password" | "reset-password") => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) { setHeaderVisible(true); lastScrollY.current = currentY; return; }
      if (isMenuOpen) { lastScrollY.current = currentY; return; }
      if (currentY < 10) setHeaderVisible(true);
      else if (currentY < lastScrollY.current) setHeaderVisible(true);
      else if (currentY > lastScrollY.current + 5) setHeaderVisible(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigateToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 backdrop-blur-sm bg-background border-b border-border/50 transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center flex-shrink-0 h-10 overflow-hidden -ml-2 cursor-pointer">
            <img src={mendigoLogo} alt="Mendigo Logo" width={656} height={160} className="h-[160px] w-auto object-contain object-left" />
          </button>
          
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              <button onClick={() => navigateToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t.nav.features}</button>
              <button onClick={() => navigateToSection('benefits')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t.nav.benefits}</button>
              <button onClick={() => navigateToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t.nav.pricing}</button>
              <button onClick={() => navigateToSection('industries')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t.nav.industries}</button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <LanguageToggle />
            <div className="h-4 w-px bg-border"></div>
            <button onClick={openDemoModal} className="text-muted-foreground hover:text-foreground transition-colors text-sm min-w-[80px] text-center">{t.contact.demo}</button>
            <Button variant="outline" onClick={() => openAuthModal("login")} className="border-border bg-background/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground min-w-[100px] text-sm">{t.nav.login}</Button>
            <Button onClick={() => openAuthModal("register")} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] text-sm">{t.nav.tryFree}</Button>
          </div>
          
          <button className="md:hidden text-foreground" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 mt-4">
              <button onClick={() => navigateToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors text-left">{t.nav.features}</button>
              <button onClick={() => navigateToSection('benefits')} className="text-muted-foreground hover:text-foreground transition-colors text-left">{t.nav.benefits}</button>
              <button onClick={() => navigateToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors text-left">{t.nav.pricing}</button>
              <button onClick={() => navigateToSection('industries')} className="text-muted-foreground hover:text-foreground transition-colors text-left">{t.nav.industries}</button>
              <button onClick={openDemoModal} className="text-muted-foreground hover:text-foreground transition-colors text-left flex items-center min-w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />{t.contact.demo}
              </button>
              <div className="pt-4 border-t border-border mt-4"><LanguageToggle /></div>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" onClick={() => openAuthModal("login")} className="border-border bg-background/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full min-w-[140px] text-sm">{t.nav.login}</Button>
                <Button onClick={() => openAuthModal("register")} className="bg-blue-600 hover:bg-blue-700 text-white w-full min-w-[140px] text-sm">{t.nav.tryFree}</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialModal={authModalType} />
    </header>
  );
}