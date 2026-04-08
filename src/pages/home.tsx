import { useEffect, useState, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCurrentUserQuery } from '@/hooks/queries';
import Header from '@/components/header';
import Hero from '@/components/hero';
import { AuthModals } from '@/components/modals';

const ProblemSection = lazy(() => import('@/components/problem-section'));
const Features = lazy(() => import('@/components/features'));
const QrDemo = lazy(() => import('@/components/qr-demo'));
const DashboardPreview = lazy(() => import('@/components/dashboard-preview'));
const Testimonials = lazy(() => import('@/components/testimonials'));
const Pricing = lazy(() => import('@/components/pricing'));
const Benefits = lazy(() => import('@/components/benefits'));
const Industries = lazy(() => import('@/components/industries'));
const FAQ = lazy(() => import('@/components/faq'));
const CTA = lazy(() => import('@/components/cta'));
const Footer = lazy(() => import('@/components/footer'));

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register" | "forgot-password" | "reset-password">("register");
  const { data: currentUser, isLoading: isUserLoading, error } = useCurrentUserQuery();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo && !isUserLoading) {
      if (error) { localStorage.removeItem("userInfo"); return; }
      if (currentUser) navigate("/dashboard", { replace: true });
    }
  }, [navigate, currentUser, isUserLoading, error]);

  useEffect(() => {
    const hasSignupParam = searchParams.has('signup');
    const hasToken = searchParams.has('token');
    const resetParam = searchParams.get('reset');
    if (resetParam === 'password' && hasToken) { setAuthModalType("reset-password"); setIsAuthModalOpen(true); }
    else if (resetParam === 'request') { setAuthModalType("forgot-password"); setIsAuthModalOpen(true); }
    else if (hasToken && !resetParam) {
      // Invitation link — redirect to dedicated signup page
      const params = new URLSearchParams(searchParams);
      navigate(`/signup?${params.toString()}`, { replace: true });
      return;
    }
    else if (hasSignupParam) { setAuthModalType("register"); setIsAuthModalOpen(true); }
  }, [searchParams, navigate]);

  useEffect(() => {
    document.title = 'Mendigo - Intelligente Facility-Management-Plattform';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Optimieren Sie Facility-Management-Prozesse mit QR-Code-Meldungen, Workflow-Management und Anlagenverfolgung.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <ProblemSection />
          <DashboardPreview />
          <QrDemo />
          <Features />
          <Testimonials />
          <Pricing />
          <Benefits />
          <Industries />
          <FAQ />
          <CTA />
        </Suspense>
      </main>
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialModal={authModalType} />
    </div>
  );
}