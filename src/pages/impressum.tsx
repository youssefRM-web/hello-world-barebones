import { useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/components/language-provider';

export default function Impressum() {
  const { language } = useLanguage();
  const isDE = language === 'de';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = isDE ? 'Impressum - Mendigo' : 'Imprint - Mendigo';
  }, [isDE]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">{isDE ? 'Impressum' : 'Imprint'}</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}</h2>
              <div className="space-y-2 leading-relaxed">
                <p className="text-base font-medium text-foreground">R&M Software GmbH</p>
                <p className="text-base text-muted-foreground">Vossem 26</p>
                <p className="text-base text-muted-foreground">{isDE ? '41812 Erkelenz' : '41812 Erkelenz, Germany'}</p>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'Vertreten durch' : 'Represented by'}</h2>
              <p className="text-base text-muted-foreground">{isDE ? 'Geschäftsführer: Sami Magri' : 'Managing Director: Sami Magri'}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'Kontakt' : 'Contact'}</h2>
              <p className="text-base"><span className="font-medium text-foreground">{isDE ? 'E-Mail:' : 'Email:'}</span> <a href="mailto:mendigo@rmsoftware.de" className="text-foreground hover:text-muted-foreground underline">mendigo@rmsoftware.de</a></p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'Registereintrag' : 'Trade Register Entry'}</h2>
              <p className="text-base"><span className="font-medium text-foreground">{isDE ? 'Eintragung im Handelsregister:' : 'Commercial Register:'}</span> <span className="text-muted-foreground">HRB 19442</span></p>
              <p className="text-base"><span className="font-medium text-foreground">{isDE ? 'Registergericht:' : 'Registry Court:'}</span> <span className="text-muted-foreground">{isDE ? 'Amtsgericht Mönchengladbach' : 'Local Court of Mönchengladbach'}</span></p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'Umsatzsteuer-ID' : 'VAT ID'}</h2>
              <p className="text-base text-muted-foreground">
                {isDE ? 'Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:' : 'VAT identification number according to § 27 a of the German VAT Act:'}
              </p>
              <p className="text-base text-muted-foreground">DE331574633</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'EU-Streitschlichtung' : 'EU Dispute Resolution'}</h2>
              <p className="text-base text-muted-foreground">
                {isDE 
                  ? 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: '
                  : 'The European Commission provides a platform for online dispute resolution (ODR): '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-base text-muted-foreground mt-2">
                {isDE 
                  ? 'Unsere E-Mail-Adresse finden Sie oben im Impressum.'
                  : 'You can find our email address in the imprint above.'}
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isDE ? 'Verbraucherstreitbeilegung/Universalschlichtungsstelle' : 'Consumer Dispute Resolution/Universal Arbitration Board'}</h2>
              <p className="text-base text-muted-foreground">
                {isDE 
                  ? 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
                  : 'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.'}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}