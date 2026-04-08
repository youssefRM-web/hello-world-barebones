import { useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/components/language-provider';

export default function AGB() {
  const { language } = useLanguage();
  const isDE = language === 'de';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = isDE ? 'AGB - Mendigo' : 'Terms of Service - Mendigo';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content = isDE
      ? 'Allgemeine Geschäftsbedingungen der R&M Software GmbH für die Nutzung von Mendigo.'
      : 'Terms of Service of R&M Software GmbH for the use of Mendigo.';
    if (metaDescription) {
      metaDescription.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, [isDE]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
            {isDE ? 'Allgemeine Geschäftsbedingungen (AGB)' : 'General Terms and Conditions (GTC)'}
          </h1>
          
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '1. Geltungsbereich und Anbieter' : '1. Scope and Provider'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Diese Allgemeinen Geschäftsbedingungen („AGB") gelten für sämtliche Verträge über die Nutzung der cloudbasierten Software-as-a-Service-Plattform Mendigo zwischen der'
                    : 'These General Terms and Conditions ("GTC") apply to all contracts for the use of the cloud-based Software-as-a-Service platform Mendigo between'}
                </p>
                <div className="ml-6 space-y-1">
                  <p className="text-base font-medium text-foreground">R&M Software GmbH</p>
                  <p className="text-base text-muted-foreground">
                    {isDE ? 'Vossem 26, 41812 Erkelenz, Deutschland' : 'Vossem 26, 41812 Erkelenz, Germany'}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {isDE ? 'Handelsregister: HRB 19442, Amtsgericht Mönchengladbach' : 'Commercial Register: HRB 19442, Local Court of Mönchengladbach'}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {isDE ? 'Geschäftsführer: Sami Magri' : 'Managing Director: Sami Magri'}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {isDE ? 'USt-IdNr.: DE331574633' : 'VAT ID: DE331574633'}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {isDE ? 'E-Mail: ' : 'Email: '}<a href="mailto:mendigo@rmsoftware.de" className="text-foreground hover:text-muted-foreground underline transition-colors" data-testid="link-email">mendigo@rmsoftware.de</a>
                  </p>
                  <p className="text-base text-muted-foreground">
                    {isDE ? '– nachfolgend „Anbieter" –' : '– hereinafter "Provider" –'}
                  </p>
                </div>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'und Unternehmern im Sinne von § 14 BGB – nachfolgend „Kunde".'
                    : 'and entrepreneurs within the meaning of § 14 BGB – hereinafter "Customer".'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Diese AGB gelten ausschließlich. Entgegenstehende, abweichende oder ergänzende Geschäftsbedingungen des Kunden finden keine Anwendung, auch wenn der Anbieter ihnen nicht ausdrücklich widerspricht.'
                    : 'These GTC apply exclusively. Conflicting, deviating or supplementary terms and conditions of the Customer shall not apply, even if the Provider does not expressly object to them.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Die Nutzung der Plattform durch Verbraucher im Sinne von § 13 BGB ist ausgeschlossen. Ein Widerrufsrecht besteht nicht.'
                    : 'The use of the platform by consumers within the meaning of § 13 BGB is excluded. No right of withdrawal exists.'}
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '2. Vertragsgegenstand und Leistungsumfang' : '2. Subject Matter of the Contract and Scope of Services'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Anbieter stellt dem Kunden mit Mendigo eine webbasierte Plattform zur Verfügung, die insbesondere folgende Funktionen umfasst:'
                    : 'The Provider makes available to the Customer with Mendigo a web-based platform that includes in particular the following functions:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE ? 'QR-Code-basierte Problemmeldungen' : 'QR code-based issue reporting'}</li>
                  <li>{isDE ? 'Aufgaben- und Ticketmanagement' : 'Task and ticket management'}</li>
                  <li>{isDE ? 'Asset-, Gebäude- und Standortverwaltung' : 'Asset, building and location management'}</li>
                  <li>{isDE ? 'Planung und Dokumentation präventiver Wartungen' : 'Planning and documentation of preventive maintenance'}</li>
                  <li>{isDE ? 'Dokumentenmanagement' : 'Document management'}</li>
                  <li>{isDE ? 'Analyse-, Auswertungs- und Reportingfunktionen' : 'Analysis, evaluation and reporting functions'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Der konkrete Funktionsumfang ergibt sich aus dem jeweils gebuchten Tarif sowie der aktuellen Produkt- und Leistungsbeschreibung auf der Website oder im Angebot.'
                    : 'The specific scope of functions is determined by the respective booked tariff as well as the current product and service description on the website or in the offer.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Der Anbieter ist berechtigt, die Plattform fortzuentwickeln, technisch anzupassen oder zu verändern, soweit dies aus sachlichen Gründen erforderlich ist (z. B. Sicherheit, Performance, Skalierung, rechtliche Anforderungen) und den Kunden nicht unangemessen benachteiligt.'
                    : 'The Provider is entitled to further develop, technically adapt or modify the platform insofar as this is necessary for objective reasons (e.g. security, performance, scaling, legal requirements) and does not unreasonably disadvantage the Customer.'}
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '3. Nutzerrollen, Zugänge und Verantwortlichkeiten' : '3. User Roles, Access and Responsibilities'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(1) Kunden-Accounts' : '(1) Customer Accounts'}</span><br />
                  {isDE
                    ? 'Der Kunde erhält Benutzerkonten für sich und von ihm autorisierte Nutzer (z. B. Mitarbeiter, Dienstleister). Der Kunde ist für die Verwaltung der Nutzer, deren Zugriffsrechte sowie für sämtliche Handlungen verantwortlich, die über diese Konten erfolgen.'
                    : 'The Customer receives user accounts for itself and users authorized by it (e.g. employees, service providers). The Customer is responsible for the management of users, their access rights and all actions that are carried out through these accounts.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(2) Reporter ohne Benutzerkonto' : '(2) Reporters without User Account'}</span><br />
                  {isDE
                    ? 'Dritte (z. B. Mieter, Besucher oder Mitarbeiter des Kunden) können über QR-Codes oder bereitgestellte Links Meldungen abgeben („Reporter"). Reporter sind keine Vertragspartner des Anbieters. Die rechtliche Verantwortung für Inhalt, Bearbeitung, Kommunikation und Folgemaßnahmen liegt ausschließlich beim Kunden.'
                    : 'Third parties (e.g. tenants, visitors or employees of the Customer) can submit reports via QR codes or provided links ("Reporters"). Reporters are not contractual partners of the Provider. The legal responsibility for content, processing, communication and follow-up measures lies exclusively with the Customer.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(3) Zugangssicherheit' : '(3) Access Security'}</span><br />
                  {isDE
                    ? 'Der Kunde ist verpflichtet, Zugangsdaten vertraulich zu behandeln und vor unbefugtem Zugriff zu schützen. Sicherheitsvorfälle sind dem Anbieter unverzüglich mitzuteilen.'
                    : 'The Customer is obligated to treat access credentials confidentially and to protect them from unauthorized access. Security incidents must be reported to the Provider immediately.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(4) Systemvoraussetzungen' : '(4) System Requirements'}</span><br />
                  {isDE
                    ? 'Der Kunde ist dafür verantwortlich, dass seine IT-Infrastruktur (z. B. Internetzugang, Browser, Endgeräte) die folgenden Mindestanforderungen erfüllt:'
                    : 'The Customer is responsible for ensuring that its IT infrastructure (e.g. internet access, browser, devices) meets the following minimum requirements:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-decimal">
                  <li>{isDE
                    ? 'Stabile Internetverbindung mit einer Bandbreite von mindestens 10 Mbit/s im Download und 2 Mbit/s im Upload.'
                    : 'Stable internet connection with a bandwidth of at least 10 Mbit/s download and 2 Mbit/s upload.'}</li>
                  <li>{isDE
                    ? 'Verwendung eines aktuellen Browsers in einer vom Hersteller noch unterstützten Version (z. B. Google Chrome, Mozilla Firefox, Microsoft Edge oder Safari in einer Version, die nicht älter als 12 Monate ist).'
                    : 'Use of a current browser in a version still supported by the manufacturer (e.g. Google Chrome, Mozilla Firefox, Microsoft Edge or Safari in a version no older than 12 months).'}</li>
                  <li>{isDE
                    ? 'Endgeräte (PC, Notebook, Tablet oder Smartphone) mit einem gängigen, vom Hersteller noch unterstützten Betriebssystem (z. B. aktuelle Versionen von Windows, macOS, iOS, Android).'
                    : 'Devices (PC, notebook, tablet or smartphone) with a common operating system still supported by the manufacturer (e.g. current versions of Windows, macOS, iOS, Android).'}</li>
                  <li>{isDE
                    ? 'Aktivierte Unterstützung für Cookies und JavaScript im verwendeten Browser.'
                    : 'Enabled support for cookies and JavaScript in the browser used.'}</li>
                  <li>{isDE
                    ? 'Der Anbieter kann die Systemvoraussetzungen bei technischen Weiterentwicklungen der Plattform anpassen. Kommt es aufgrund unzureichender Systemvoraussetzungen auf Seiten des Kunden zu Störungen, trägt der Kunde hierfür die Verantwortung.'
                    : 'The Provider may adjust the system requirements in the course of technical developments of the platform. If disruptions occur due to insufficient system requirements on the Customer\'s side, the Customer bears responsibility for this.'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(5) Support' : '(5) Support'}</span><br />
                  {isDE
                    ? <>{'Supportleistungen erfolgen über das integrierte Ticketsystem oder per E-Mail an '}<a href="mailto:mendigo@rmsoftware.de" className="text-foreground hover:text-muted-foreground underline transition-colors">mendigo@rmsoftware.de</a>.</>
                    : <>{'Support services are provided via the integrated ticket system or by email to '}<a href="mailto:mendigo@rmsoftware.de" className="text-foreground hover:text-muted-foreground underline transition-colors">mendigo@rmsoftware.de</a>.</>}
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '4. Vertragsschluss und Testphase' : '4. Contract Conclusion and Trial Period'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Vertrag kommt durch Online-Registrierung des Kunden, Akzeptanz dieser AGB und Auswahl eines Tarifs zustande.'
                    : 'The contract is concluded by the Customer\'s online registration, acceptance of these GTC and selection of a tariff.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Der Anbieter kann eine kostenlose Testphase von 14 Tagen gewähren. Nach Ablauf der Testphase ist zur weiteren Nutzung der Abschluss eines kostenpflichtigen Abonnements erforderlich.'
                    : 'The Provider may grant a free trial period of 14 days. After expiry of the trial period, the conclusion of a paid subscription is required for continued use.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Erfolgt nach Ablauf der Testphase keine Tarifwahl oder Zahlung, ist der Anbieter berechtigt, den Zugang nach vorheriger Ankündigung zu sperren oder zu löschen.'
                    : 'If no tariff selection or payment is made after expiry of the trial period, the Provider is entitled to block or delete access after prior notice.'}
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '5. Preise, Abrechnung, Zahlung, Verzug' : '5. Prices, Billing, Payment, Default'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Die Abrechnung erfolgt jährlich im Voraus gemäß dem gebuchten Tarif.'
                    : 'Billing is carried out annually in advance according to the booked tariff.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Zulässige Zahlungsmittel sind Kreditkarte, SEPA-Lastschrift und PayPal.'
                    : 'Permitted payment methods are credit card, SEPA direct debit and PayPal.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Rechnungen gelten als zugegangen, sobald sie elektronisch bereitgestellt wurden.'
                    : 'Invoices are deemed received as soon as they have been made available electronically.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(4)</span> {isDE
                    ? 'Gerät der Kunde in Zahlungsverzug, ist der Anbieter berechtigt:'
                    : 'If the Customer is in default of payment, the Provider is entitled to:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE
                    ? 'Verzugszinsen gemäß § 288 Abs. 2 BGB zu verlangen,'
                    : 'charge default interest in accordance with § 288 para. 2 BGB,'}</li>
                  <li>{isDE
                    ? 'nach vorheriger Mahnung den Zugang zur Plattform ganz oder teilweise zu sperren.'
                    : 'block access to the platform in whole or in part after prior reminder.'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Eine Entsperrung erfolgt nach vollständigem Ausgleich der offenen Forderungen.'
                    : 'Unblocking takes place after full settlement of the outstanding claims.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(5)</span> {isDE
                    ? 'Der Anbieter ist berechtigt, Preise mit einer Ankündigungsfrist von sechs Wochen anzupassen. Im Falle einer Preiserhöhung steht dem Kunden ein Sonderkündigungsrecht zum Zeitpunkt des Wirksamwerdens zu.'
                    : 'The Provider is entitled to adjust prices with a notice period of six weeks. In the event of a price increase, the Customer has a special right of termination at the time the increase takes effect.'}
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '6. Nutzungsrechte an der Plattform' : '6. Usage Rights to the Platform'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Anbieter räumt dem Kunden für die Dauer des Vertrags ein einfaches, nicht ausschließliches, nicht übertragbares und nicht unterlizenzierbares Nutzungsrecht an Mendigo ein.'
                    : 'The Provider grants the Customer for the duration of the contract a simple, non-exclusive, non-transferable and non-sublicensable right of use to Mendigo.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Die Nutzung ist ausschließlich für eigene geschäftliche Zwecke des Kunden gestattet.'
                    : 'Use is permitted exclusively for the Customer\'s own business purposes.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Untersagt sind insbesondere:'
                    : 'The following are prohibited in particular:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE
                    ? 'Reverse Engineering, Dekompilierung oder Umgehung technischer Schutzmaßnahmen'
                    : 'Reverse engineering, decompilation or circumvention of technical protection measures'}</li>
                  <li>{isDE
                    ? 'Weitergabe, Vermietung oder Bereitstellung der Plattform an Dritte'
                    : 'Transfer, rental or provision of the platform to third parties'}</li>
                  <li>{isDE
                    ? 'automatisierte Massenzugriffe, Scraping oder Data-Mining außerhalb freigegebener Schnittstellen'
                    : 'Automated mass access, scraping or data mining outside of released interfaces'}</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '7. Acceptable Use / Nutzungsverbote' : '7. Acceptable Use / Prohibited Uses'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Der Kunde sowie dessen Nutzer und Reporter dürfen die Plattform nicht in einer Weise nutzen, die:'
                    : 'The Customer as well as its users and reporters may not use the platform in any way that:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground">
                  <li>{isDE
                    ? 'a) gegen geltendes Recht verstößt,'
                    : 'a) violates applicable law,'}</li>
                  <li>{isDE
                    ? 'b) Rechte Dritter (Urheber-, Marken-, Persönlichkeits-, Datenschutz- oder Geschäftsgeheimnisse) verletzt,'
                    : 'b) infringes the rights of third parties (copyright, trademark, personality, data protection or trade secrets),'}</li>
                  <li>{isDE
                    ? 'c) beleidigend, diskriminierend, extremistisch, irreführend oder strafbar ist,'
                    : 'c) is insulting, discriminatory, extremist, misleading or punishable by law,'}</li>
                  <li>{isDE
                    ? 'd) Schadsoftware, Viren, Trojaner oder vergleichbare Inhalte enthält,'
                    : 'd) contains malware, viruses, trojans or comparable content,'}</li>
                  <li>{isDE
                    ? 'e) unbefugten Zugriff auf Systeme oder Daten ermöglicht,'
                    : 'e) enables unauthorized access to systems or data,'}</li>
                  <li>{isDE
                    ? 'f) Spam, unerwünschte Werbung oder automatisierte Hochvolumen-Abfragen erzeugt,'
                    : 'f) generates spam, unsolicited advertising or automated high-volume queries,'}</li>
                  <li>{isDE
                    ? 'g) Produktkennzeichnungen, Urhebervermerke oder Schutzmechanismen entfernt oder umgeht,'
                    : 'g) removes or circumvents product labels, copyright notices or protection mechanisms,'}</li>
                  <li>{isDE
                    ? 'h) die Plattform kopiert, modifiziert oder als Grundlage für abgeleitete Produkte nutzt,'
                    : 'h) copies, modifies or uses the platform as a basis for derivative products,'}</li>
                  <li>{isDE
                    ? 'i) andere Personen oder Organisationen imitiert oder'
                    : 'i) impersonates other persons or organizations, or'}</li>
                  <li>{isDE
                    ? 'j) nicht dem Zweck der Störungs- oder Aufgabenmeldung dient.'
                    : 'j) does not serve the purpose of fault or task reporting.'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Der Anbieter ist berechtigt, bei Verstößen Inhalte zu entfernen und Zugänge zu sperren.'
                    : 'The Provider is entitled to remove content and block access in the event of violations.'}
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '8. Upload von Bildern & Inhalten' : '8. Upload of Images & Content'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Kunde sowie dessen Nutzer und Reporter dürfen über die Plattform ausschließlich Inhalte (insbesondere Bilder, Fotos, Dokumente und Texte) hochladen, an denen sie über die erforderlichen Nutzungsrechte verfügen und deren Verwendung keine Rechte Dritter verletzt.'
                    : 'The Customer as well as its users and reporters may only upload content (in particular images, photos, documents and texts) via the platform to which they hold the required usage rights and whose use does not infringe the rights of third parties.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Es ist untersagt, Inhalte hochzuladen, die:'
                    : 'It is prohibited to upload content that:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE
                    ? 'gegen geltendes Recht verstoßen,'
                    : 'violates applicable law,'}</li>
                  <li>{isDE
                    ? 'urheberrechtlich geschützt sind, sofern keine entsprechende Berechtigung vorliegt,'
                    : 'is protected by copyright, unless the corresponding authorization exists,'}</li>
                  <li>{isDE
                    ? 'personenbezogene Daten Dritter ohne Rechtsgrundlage enthalten,'
                    : 'contains personal data of third parties without a legal basis,'}</li>
                  <li>{isDE
                    ? 'beleidigend, diskriminierend, extremistisch oder strafbar sind.'
                    : 'is insulting, discriminatory, extremist or punishable by law.'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Der Anbieter ist berechtigt, Inhalte zu prüfen, zu sperren oder zu entfernen, sofern konkrete Anhaltspunkte für einen Rechtsverstoß bestehen. Eine Verpflichtung zur Vorabprüfung aller Inhalte besteht nicht.'
                    : 'The Provider is entitled to review, block or remove content if there are concrete indications of a legal violation. There is no obligation to pre-screen all content.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(4)</span> {isDE
                    ? 'Der Kunde stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aufgrund der vom Kunden, dessen Nutzern oder Reportern hochgeladenen Inhalte geltend gemacht werden, einschließlich angemessener Rechtsverfolgungs- und Verteidigungskosten.'
                    : 'The Customer shall indemnify the Provider against all claims by third parties that are asserted due to content uploaded by the Customer, its users or reporters, including reasonable prosecution and defense costs.'}
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '9. Rechte an hochgeladenen Inhalten' : '9. Rights to Uploaded Content'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Mit dem Hochladen von Inhalten räumt der Kunde dem Anbieter ein einfaches, zeitlich auf die Vertragslaufzeit beschränktes Nutzungsrecht ein, soweit dies zur technischen Bereitstellung und Abwicklung der Plattform erforderlich ist.'
                    : 'By uploading content, the Customer grants the Provider a simple right of use limited in time to the contract duration, insofar as this is necessary for the technical provision and operation of the platform.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Eine weitergehende Nutzung, insbesondere zu Marketing- oder Referenzzwecken, erfolgt ausschließlich anonymisiert oder mit ausdrücklicher Zustimmung.'
                    : 'Any further use, in particular for marketing or reference purposes, shall only take place in anonymized form or with express consent.'}
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '10. Datenschutz und Auftragsverarbeitung' : '10. Data Protection and Data Processing'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Die Verarbeitung personenbezogener Daten erfolgt gemäß der separaten Datenschutzerklärung des Anbieters.'
                    : 'The processing of personal data is carried out in accordance with the Provider\'s separate privacy policy.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Sofern der Anbieter personenbezogene Daten im Auftrag des Kunden verarbeitet, wird die AVV (Anlage 1) mit Abschluss dieses Vertrages automatisch geschlossen. Durch Akzeptanz der AGB bestätigt der Kunde ausdrücklich den Abschluss der AVV.'
                    : 'Insofar as the Provider processes personal data on behalf of the Customer, the DPA (Annex 1) is automatically concluded upon conclusion of this contract. By accepting the GTC, the Customer expressly confirms the conclusion of the DPA.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Der Kunde bleibt Verantwortlicher im Sinne der DSGVO für die von ihm in die Plattform eingestellten personenbezogenen Daten. Der Anbieter verarbeitet diese Daten ausschließlich als Auftragsverarbeiter im Rahmen der AVV.'
                    : 'The Customer remains the controller within the meaning of the GDPR for the personal data entered by it into the platform. The Provider processes this data exclusively as a processor within the framework of the DPA.'}
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '11. Verfügbarkeit, Wartung und Support' : '11. Availability, Maintenance and Support'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(1) Verfügbarkeit' : '(1) Availability'}</span><br />
                  {isDE
                    ? 'Der Anbieter schuldet eine hohe technische Sorgfalt, sichert jedoch keine bestimmte Mindestverfügbarkeit der Plattform zu, soweit nicht in einem gesonderten Service-Level-Agreement (SLA) abweichende Regelungen getroffen werden.'
                    : 'The Provider owes a high level of technical diligence, but does not guarantee any specific minimum availability of the platform unless otherwise agreed in a separate Service Level Agreement (SLA).'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(2) Wartung' : '(2) Maintenance'}</span><br />
                  {isDE
                    ? 'Wartungsarbeiten, Updates und Weiterentwicklungen können zu vorübergehenden Einschränkungen führen. Der Anbieter bemüht sich um eine angemessene Vorankündigung geplanter Wartungsfenster, sofern die Nutzung der Plattform voraussichtlich nicht nur unerheblich beeinträchtigt wird.'
                    : 'Maintenance work, updates and further developments may lead to temporary restrictions. The Provider endeavors to provide reasonable advance notice of planned maintenance windows, insofar as the use of the platform is expected to be more than insignificantly affected.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(3) Datensicherung durch den Anbieter' : '(3) Data Backup by the Provider'}</span><br />
                  {isDE
                    ? 'Der Anbieter erstellt in regelmäßigen Abständen Datensicherungen der in der Plattform gespeicherten Daten (Backups). Die Backups erfolgen mindestens alle 12 Stunden und werden für einen Zeitraum von mindestens 7 Tagen aufbewahrt. Die Wiederherstellung eines Backup-Standes erfolgt grundsätzlich innerhalb von 4 Stunden nach Feststellung eines erheblichen Datenverlustes.'
                    : 'The Provider creates regular backups of the data stored in the platform. Backups are performed at least every 12 hours and are retained for a period of at least 7 days. The restoration of a backup state is generally carried out within 4 hours of the detection of a significant data loss.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(4) Datensicherungspflicht des Kunden' : '(4) Data Backup Obligation of the Customer'}</span><br />
                  {isDE
                    ? 'Der Kunde ist verpflichtet, wichtige Daten zusätzlich in eigenen Systemen zu sichern, soweit dies zumutbar ist, insbesondere wenn diese Daten außerhalb der Plattform weiterverwendet werden.'
                    : 'The Customer is obligated to additionally back up important data in its own systems insofar as this is reasonable, in particular if this data is used further outside the platform.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(5) Support' : '(5) Support'}</span><br />
                  {isDE
                    ? 'Der Anbieter erbringt Supportleistungen während der auf der Website angegebenen Supportzeiten über das integrierte Ticketsystem oder per E-Mail. Die Reaktionszeiten auf Supportanfragen können in einem gesonderten SLA konkretisiert werden.'
                    : 'The Provider provides support services during the support hours indicated on the website via the integrated ticket system or by email. Response times for support requests may be specified in a separate SLA.'}
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '12. Haftung' : '12. Liability'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Anbieter haftet unbeschränkt bei Vorsatz, grober Fahrlässigkeit sowie bei Schäden aus der Verletzung von Leben, Körper oder Gesundheit.'
                    : 'The Provider is liable without limitation in cases of intent, gross negligence as well as for damages resulting from injury to life, body or health.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(2) Datenverlust' : '(2) Data Loss'}</span><br />
                  {isDE
                    ? 'Der Anbieter übernimmt – vorbehaltlich der in Ziffer 11 (3) geregelten Backups – keine darüber hinausgehende Verpflichtung zur Erstellung von Datensicherungen für den Kunden. Eine Haftung für Datenverlust besteht ausschließlich bei vorsätzlichem oder grob fahrlässigem Verhalten des Anbieters. Eine Haftung für mittelbare Schäden, Folgeschäden oder entgangenen Gewinn infolge von Datenverlusten ist ausgeschlossen, soweit gesetzlich zulässig.'
                    : 'The Provider assumes – subject to the backups regulated in Section 11(3) – no further obligation to create data backups for the Customer. Liability for data loss exists exclusively in the case of intentional or grossly negligent conduct by the Provider. Liability for indirect damages, consequential damages or lost profits as a result of data loss is excluded insofar as legally permissible.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(3) Kardinalpflichten' : '(3) Cardinal Obligations'}</span><br />
                  {isDE
                    ? 'Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die Haftung des Anbieters auf den typischerweise vorhersehbaren Schaden begrenzt. Kardinalpflichten sind solche Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Vertragspartner regelmäßig vertrauen darf.'
                    : 'In cases of slightly negligent breach of essential contractual obligations (cardinal obligations), the Provider\'s liability is limited to the typically foreseeable damage. Cardinal obligations are those obligations whose fulfillment makes the proper performance of the contract possible in the first place and on whose compliance the contractual partner may regularly rely.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(4) Höchsthaftung' : '(4) Maximum Liability'}</span><br />
                  {isDE
                    ? 'Die Haftung des Anbieters für leicht fahrlässig verursachte Schäden ist der Höhe nach begrenzt auf den vertragstypischen, vorhersehbaren Schaden, maximal jedoch auf den Betrag der vom Kunden in den letzten 12 Monaten vor dem Schadensereignis gezahlten Entgelte.'
                    : 'The Provider\'s liability for damages caused by slight negligence is limited in amount to the typical, foreseeable damage, but at most to the amount of the fees paid by the Customer in the last 12 months prior to the damaging event.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(5)</span> {isDE
                    ? 'Zwingende Haftungstatbestände, insbesondere nach dem Produkthaftungsgesetz, bleiben unberührt.'
                    : 'Mandatory liability provisions, in particular under the Product Liability Act, remain unaffected.'}
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '13. Vertraulichkeit' : '13. Confidentiality'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Beide Parteien verpflichten sich, vertrauliche Informationen geheim zu halten und ausschließlich zur Durchführung dieses Vertrages zu verwenden.'
                  : 'Both parties undertake to keep confidential information secret and to use it exclusively for the performance of this contract.'}
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '14. Höhere Gewalt' : '14. Force Majeure'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Keine Partei haftet für Leistungsstörungen, die auf Ereignisse außerhalb ihres Einflussbereichs zurückzuführen sind (z. B. Naturereignisse, Krieg, Streik, Ausfall von Telekommunikations- oder Rechenzentrumsleistungen, behördliche Anordnungen).'
                  : 'Neither party is liable for service disruptions attributable to events beyond its sphere of influence (e.g. natural events, war, strikes, failure of telecommunications or data center services, official orders).'}
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '15. Laufzeit und Kündigung' : '15. Term and Termination'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Vertrag läuft auf unbestimmte Zeit mit einer Mindestlaufzeit von 12 Monaten.'
                    : 'The contract runs for an indefinite period with a minimum term of 12 months.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Der Abrechnungszeitraum beträgt ein Jahr. Das Abrechnungsjahr beginnt mit dem Tag des Vertragsschlusses und endet mit Ablauf des Tages vor dem entsprechenden Kalendertag im Folgejahr.'
                    : 'The billing period is one year. The billing year begins on the day of the contract conclusion and ends at the expiry of the day before the corresponding calendar day in the following year.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Der Vertrag kann vom Kunden jederzeit mit Wirkung zum Ende des laufenden Abrechnungsjahres gekündigt werden. Eine Rückerstattung bereits gezahlter Entgelte erfolgt nicht.'
                    : 'The contract may be terminated by the Customer at any time with effect at the end of the current billing year. No refund of fees already paid will be made.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(4)</span> {isDE
                    ? 'Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.'
                    : 'The right to extraordinary termination for good cause remains unaffected.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? '(5) Daten-Export und Löschung' : '(5) Data Export and Deletion'}</span>
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground">
                  <li>{isDE
                    ? 'a) Nach Beendigung des Vertrages stellt der Anbieter dem Kunden auf Anfrage die in der Plattform gespeicherten exportierbaren produktiven Daten in einem gängigen maschinenlesbaren Format (CSV, XLSX) zur Verfügung.'
                    : 'a) After termination of the contract, the Provider shall make available to the Customer upon request the exportable productive data stored in the platform in a common machine-readable format (CSV, XLSX).'}</li>
                  <li>{isDE
                    ? 'b) Die Anfrage muss innerhalb von 30 Tagen nach Vertragsende erfolgen. Danach entfällt das Recht auf Datenexport.'
                    : 'b) The request must be made within 30 days after the end of the contract. After that, the right to data export lapses.'}</li>
                  <li>{isDE
                    ? 'c) Der Export ist kostenpflichtig gemäß den Preisen der AGB § 5 (Preise für Zusatzleistungen) und erfolgt innerhalb von 15 Werktagen nach Eingang der vollständigen Bezahlung.'
                    : 'c) The export is subject to a fee in accordance with the prices of GTC § 5 (prices for additional services) and is carried out within 15 working days after receipt of full payment.'}</li>
                  <li>{isDE
                    ? 'd) Nicht exportierbare Daten (z. B. Systemlogs, Audit-Trails, anonymisierte Statistiken) verbleiben beim Anbieter und unterliegen der Löschung gemäß gesetzlichen Fristen.'
                    : 'd) Non-exportable data (e.g. system logs, audit trails, anonymized statistics) remain with the Provider and are subject to deletion in accordance with statutory deadlines.'}</li>
                  <li>{isDE
                    ? 'e) Nach Ablauf der 30-Tage-Frist löscht der Anbieter die Daten innerhalb von weiteren 30 Tagen endgültig, vorbehaltlich gesetzlicher Aufbewahrungspflichten.'
                    : 'e) After expiry of the 30-day period, the Provider shall permanently delete the data within a further 30 days, subject to statutory retention obligations.'}</li>
                  <li>{isDE
                    ? 'f) Die Löschung ist unwiderruflich. Eine spätere Wiederherstellung ist ausgeschlossen.'
                    : 'f) Deletion is irrevocable. Subsequent restoration is excluded.'}</li>
                </ul>
              </div>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '16. Änderungen dieser AGB' : '16. Changes to these GTC'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Anbieter ist berechtigt, diese AGB aus sachlichen Gründen (z. B. Gesetzesänderungen, Sicherheits- oder Funktionsanpassungen) zu ändern.'
                    : 'The Provider is entitled to amend these GTC for objective reasons (e.g. changes in law, security or functional adjustments).'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Änderungen werden dem Kunden mindestens sechs Wochen vor Inkrafttreten in Textform mitgeteilt. Widerspricht der Kunde nicht innerhalb von vier Wochen nach Zugang der Änderungsmitteilung, gelten sie als genehmigt.'
                    : 'Amendments shall be communicated to the Customer in text form at least six weeks before they take effect. If the Customer does not object within four weeks of receipt of the amendment notification, they shall be deemed approved.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Im Falle eines fristgerechten Widerspruchs sind beide Parteien berechtigt, den Vertrag zum Zeitpunkt des Inkrafttretens der Änderung ordentlich zu kündigen.'
                    : 'In the event of a timely objection, both parties are entitled to ordinarily terminate the contract at the time the amendment takes effect.'}
                </p>
              </div>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '17. Subunternehmer, Abtretung, Rechtsnachfolge' : '17. Subcontractors, Assignment, Legal Succession'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Der Anbieter ist berechtigt, Subunternehmer einzusetzen, bleibt jedoch für deren Leistung verantwortlich.'
                    : 'The Provider is entitled to use subcontractors, but remains responsible for their performance.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Der Kunde darf Rechte und Pflichten aus diesem Vertrag nur mit vorheriger Zustimmung des Anbieters übertragen.'
                    : 'The Customer may only transfer rights and obligations from this contract with the prior consent of the Provider.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Der Vertrag geht im Falle einer Gesamtrechtsnachfolge auf den jeweiligen Rechtsnachfolger über.'
                    : 'The contract passes to the respective legal successor in the event of universal succession.'}
                </p>
              </div>
            </section>

            {/* Section 18 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '18. Schlussbestimmungen' : '18. Final Provisions'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(1)</span> {isDE
                    ? 'Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.'
                    : 'German law applies to the exclusion of the UN Convention on Contracts for the International Sale of Goods.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(2)</span> {isDE
                    ? 'Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz des Anbieters.'
                    : 'The place of jurisdiction is – insofar as legally permissible – the registered office of the Provider.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">(3)</span> {isDE
                    ? 'Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.'
                    : 'Should individual provisions be invalid, the validity of the remaining provisions shall remain unaffected.'}
                </p>
              </div>
            </section>

            {/* Annex 1 – DPA (kept exactly as-is) */}
            <div className="border-t border-border my-12 pt-12">
              <h2 className="text-2xl font-bold mb-2 text-foreground text-center">
                {isDE ? 'Anlage 1 – Auftragsverarbeitungsvertrag (AVV)' : 'Annex 1 – Data Processing Agreement (DPA)'}
              </h2>
              <p className="text-base text-muted-foreground text-center mb-8">
                {isDE ? 'gemäß Art. 28 DSGVO' : 'pursuant to Art. 28 GDPR'}
              </p>

              <div className="space-y-4 leading-relaxed mb-8">
                <p className="text-base text-muted-foreground">
                  {isDE ? 'zwischen' : 'between'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {isDE ? '[Kunde / Organisation]' : '[Customer / Organization]'}
                  </span><br />
                  {isDE ? '– nachfolgend „Verantwortlicher" –' : '– hereinafter "Controller" –'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE ? 'und' : 'and'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-semibold text-foreground">R&M Software GmbH</span><br />
                  {isDE ? 'Vossem 26, 41812 Erkelenz, Deutschland' : 'Vossem 26, 41812 Erkelenz, Germany'}<br />
                  {isDE ? 'Handelsregister: HRB 19442, Amtsgericht Mönchengladbach' : 'Commercial Register: HRB 19442, Local Court of Mönchengladbach'}<br />
                  {isDE ? 'Geschäftsführer: Sami Magri' : 'Managing Director: Sami Magri'}<br />
                  {isDE ? 'USt-IdNr.: DE331574633' : 'VAT ID: DE331574633'}<br />
                  {isDE ? 'E-Mail: mendigo@rmsoftware.de' : 'Email: mendigo@rmsoftware.de'}<br />
                  {isDE ? '– nachfolgend „Auftragsverarbeiter" –' : '– hereinafter "Processor" –'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE ? 'gemeinsam „Parteien".' : 'collectively "Parties".'}
                </p>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '1. Gegenstand und Dauer der Verarbeitung' : '1. Subject Matter and Duration of Processing'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Gegenstand dieses Vertrages ist die Verarbeitung personenbezogener Daten durch den Auftragsverarbeiter im Auftrag des Verantwortlichen im Rahmen der Nutzung der Software Mendigo (SaaS-Plattform für QR-Code-basierte Problemmeldung, Ticket-, Asset- und Wartungsmanagement).'
                        : 'The subject matter of this agreement is the processing of personal data by the Processor on behalf of the Controller in connection with the use of the Mendigo software (SaaS platform for QR-code-based issue reporting, ticket, asset and maintenance management).'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Die Verarbeitung erfolgt ausschließlich zur Erfüllung der vertraglich vereinbarten Leistungen gemäß den Nutzungsbedingungen (AGB).'
                        : 'Processing is carried out exclusively for the purpose of fulfilling the contractually agreed services in accordance with the Terms of Service.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(3)</span> {isDE
                        ? 'Die Dauer der Verarbeitung entspricht der Laufzeit des Nutzungsvertrages. Nach Vertragsende erfolgt die Verarbeitung nur, soweit gesetzliche Aufbewahrungspflichten bestehen oder gemäß AGB § 15 (5) ein Datenexport angefordert wurde.'
                        : 'The duration of processing corresponds to the term of the usage agreement. After termination, processing only occurs insofar as statutory retention obligations exist or a data export has been requested pursuant to Section 15(5) of the Terms.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '2. Art und Zweck der Verarbeitung' : '2. Nature and Purpose of Processing'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Art der Verarbeitung: Erheben, Erfassen, Organisieren, Speichern, Anpassen oder Verändern, Auslesen, Abfragen, Übermitteln, Bereitstellen, Löschen.'
                        : 'Types of processing: Collection, recording, organization, storage, adaptation or alteration, retrieval, consultation, transmission, provision, erasure.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE ? 'Zweck der Verarbeitung:' : 'Purpose of processing:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'Entgegennahme und Bearbeitung von Problemmeldungen' : 'Receipt and processing of issue reports'}</li>
                      <li>{isDE ? 'Ticket- und Workflow-Management' : 'Ticket and workflow management'}</li>
                      <li>{isDE ? 'Kommunikation zwischen Meldenden, Technikern und Verantwortlichen' : 'Communication between reporters, technicians and responsible parties'}</li>
                      <li>{isDE ? 'Verwaltung von Assets, Standorten, Räumen und Wartungen' : 'Management of assets, locations, rooms and maintenance'}</li>
                      <li>{isDE ? 'Benutzer-, Rollen- und Berechtigungsmanagement' : 'User, role and permission management'}</li>
                      <li>{isDE ? 'Protokollierung (Ticket- und System-Historien)' : 'Logging (ticket and system histories)'}</li>
                      <li>{isDE ? 'Versand von Status- und Systembenachrichtigungen' : 'Sending status and system notifications'}</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '3. Arten personenbezogener Daten' : '3. Types of Personal Data'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      {isDE ? 'Je nach Nutzung insbesondere:' : 'Depending on use, in particular:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'Stammdaten (Name, Vorname)' : 'Master data (first name, last name)'}</li>
                      <li>{isDE ? 'Kontaktdaten (E-Mail-Adresse, optional Telefonnummer)' : 'Contact data (email address, optionally phone number)'}</li>
                      <li>{isDE ? 'Benutzer- und Accountdaten' : 'User and account data'}</li>
                      <li>{isDE ? 'Standort- und Objektzuordnungen' : 'Location and property assignments'}</li>
                      <li>{isDE ? 'Inhalte von Freitextmeldungen und Kommentaren' : 'Content of free-text reports and comments'}</li>
                      <li>{isDE ? 'Foto- und Bilddaten (z. B. Schadensfotos)' : 'Photo and image data (e.g. damage photos)'}</li>
                      <li>{isDE ? 'Protokoll- und Logdaten (Änderungshistorien, Zeitstempel)' : 'Log data (change histories, timestamps)'}</li>
                      <li>{isDE ? 'Kommunikationsdaten (Status-Mails, In-App-Benachrichtigungen)' : 'Communication data (status emails, in-app notifications)'}</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '4. Kategorien betroffener Personen' : '4. Categories of Data Subjects'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'Meldende Personen (z. B. Mitarbeiter, Mieter, Bewohner, Gäste)' : 'Reporting persons (e.g. employees, tenants, residents, guests)'}</li>
                      <li>{isDE ? 'Techniker und Dienstleister' : 'Technicians and service providers'}</li>
                      <li>{isDE ? 'Mitarbeiter des Verantwortlichen' : 'Employees of the Controller'}</li>
                      <li>{isDE ? 'Administratoren und sonstige Nutzer der Plattform' : 'Administrators and other platform users'}</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '5. Pflichten des Auftragsverarbeiters' : '5. Obligations of the Processor'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen. Weisungen erfolgen ausschließlich schriftlich oder in Textform (z. B. E-Mail, Portal).'
                        : 'The Processor shall process personal data exclusively on documented instructions from the Controller. Instructions shall be given exclusively in writing or text form (e.g. email, portal).'}
                    </p>
                    <div className="pl-6 space-y-2">
                      <p className="text-base text-muted-foreground">
                        <span className="font-medium text-foreground">a.</span> {isDE
                          ? 'Die in den AGB und der Produktbeschreibung geregelten Standardprozesse gelten als dokumentierte Weisung.'
                          : 'The standard processes defined in the Terms and the product description shall be deemed documented instructions.'}
                      </p>
                      <p className="text-base text-muted-foreground">
                        <span className="font-medium text-foreground">b.</span> {isDE
                          ? 'Der Auftragsverarbeiter ist berechtigt, Weisungen abzulehnen oder auszusetzen, wenn:'
                          : 'The Processor is entitled to refuse or suspend instructions if:'}
                      </p>
                      <div className="pl-6 space-y-1">
                        <p className="text-base text-muted-foreground">
                          {isDE ? 'i. sie rechtswidrig sind' : 'i. they are unlawful'}
                        </p>
                        <p className="text-base text-muted-foreground">
                          {isDE ? 'ii. ihre Umsetzung technisch unmöglich oder wirtschaftlich unzumutbar ist' : 'ii. their implementation is technically impossible or commercially unreasonable'}
                        </p>
                        <p className="text-base text-muted-foreground">
                          {isDE ? 'iii. sie den vereinbarten Leistungsumfang überschreiten' : 'iii. they exceed the agreed scope of services'}
                        </p>
                      </div>
                      <p className="text-base text-muted-foreground">
                        <span className="font-medium text-foreground">c.</span> {isDE
                          ? 'Bei Ablehnung/Aussetzung informiert der Auftragsverarbeiter den Verantwortlichen umgehend unter Angabe der Gründe. Überschreitet die Weisung den Standardumfang, gelten die vom Auftragsverarbeiter festgelegten Preise.'
                          : 'In case of refusal/suspension, the Processor shall inform the Controller immediately, stating the reasons. If the instruction exceeds the standard scope, the prices set by the Processor shall apply.'}
                      </p>
                    </div>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Der Auftragsverarbeiter verpflichtet alle mit der Verarbeitung befassten Personen auf Vertraulichkeit gemäß Art. 28 Abs. 3 lit. b DSGVO.'
                        : 'The Processor shall obligate all persons involved in processing to confidentiality pursuant to Art. 28(3)(b) GDPR.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(3)</span> {isDE
                        ? 'Der Auftragsverarbeiter ergreift geeignete technische und organisatorische Maßnahmen gemäß Art. 32 DSGVO, die in einem separaten, dem Verantwortlichen auf Anfrage oder im Kundenportal zur Verfügung gestellten TOM-Dokument beschrieben sind.'
                        : 'The Processor shall implement appropriate technical and organizational measures pursuant to Art. 32 GDPR, which are described in a separate TOM document available to the Controller upon request or in the customer portal.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(4)</span> {isDE
                        ? 'Der Auftragsverarbeiter unterstützt den Verantwortlichen bei:'
                        : 'The Processor shall assist the Controller with:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'der Wahrnehmung von Betroffenenrechten (innerhalb von 48 Stunden nach Eingang der Anfrage)' : 'exercising data subject rights (within 48 hours of receipt of the request)'}</li>
                      <li>{isDE ? 'der Einhaltung der Meldepflichten bei Datenschutzverletzungen' : 'compliance with notification obligations in case of data breaches'}</li>
                      <li>{isDE ? 'Datenschutz-Folgenabschätzungen' : 'data protection impact assessments'}</li>
                      <li>{isDE ? 'Anfragen von Aufsichtsbehörden' : 'requests from supervisory authorities'}</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '6. Technische und organisatorische Maßnahmen (TOMs)' : '6. Technical and Organizational Measures (TOMs)'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Die zum Zeitpunkt der Nutzung der Plattform geltenden technischen und organisatorischen Maßnahmen (TOMs) sind in einem gesonderten Dokument beschrieben, das Bestandteil dieses Vertrages ist und dem Verantwortlichen vor Aufnahme der produktiven (kostenpflichtigen) Nutzung über das Kundenportal oder auf Anfrage zur Verfügung gestellt wird.'
                        : 'The technical and organizational measures (TOMs) applicable at the time of use of the platform are described in a separate document, which forms part of this agreement and is made available to the Controller via the customer portal or upon request before commencing productive (paid) use.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Der Auftragsverarbeiter ist berechtigt, die TOMs weiterzuentwickeln, sofern das Sicherheitsniveau nach Art. 32 DSGVO nicht unterschritten wird. Wesentliche Änderungen werden auf der TOMs-Seite mindestens 14 Tage vor Inkrafttreten veröffentlicht. Der Verantwortliche kann innerhalb dieser Frist aus wichtigem datenschutzrechtlichem Grund schriftlich Einspruch erheben; andernfalls gilt die Änderung als genehmigt.'
                        : 'The Processor is entitled to further develop the TOMs, provided that the security level pursuant to Art. 32 GDPR is not reduced. Material changes will be published on the TOMs page at least 14 days before taking effect. The Controller may raise a written objection within this period for important data protection reasons; otherwise the change is deemed approved.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '7. Unterauftragsverarbeiter' : '7. Sub-processors'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Der Verantwortliche erteilt eine allgemeine Genehmigung zum Einsatz von Unterauftragsverarbeitern.'
                        : 'The Controller grants general authorization for the use of sub-processors.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Aktuelle Unterauftragsverarbeiter werden ausschließlich auf der Website des Auftragsverarbeiters (Datenschutzerklärung) veröffentlicht und laufend aktualisiert. Der Verantwortliche ist verpflichtet, diese Liste selbst zu prüfen.'
                        : 'Current sub-processors are published exclusively on the Processor\'s website (privacy policy) and are continuously updated. The Controller is obligated to review this list independently.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(3)</span> {isDE
                        ? 'Neue/hinzukommende Unterauftragsverarbeiter werden mindestens 14 Tage vor Beginn veröffentlicht. Der Verantwortliche kann innerhalb dieser Frist aus wichtigem datenschutzrechtlichem Grund Einspruch erheben. Andernfalls gilt die Änderung als genehmigt.'
                        : 'New/additional sub-processors will be published at least 14 days before commencement. The Controller may raise an objection within this period for important data protection reasons. Otherwise the change is deemed approved.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '8. Datenübermittlung in Drittländer' : '8. Data Transfers to Third Countries'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Eine Verarbeitung außerhalb der EU / des EWR erfolgt nur, sofern:'
                        : 'Processing outside the EU/EEA shall only take place if:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'ein Angemessenheitsbeschluss vorliegt oder' : 'an adequacy decision exists, or'}</li>
                      <li>{isDE ? 'geeignete Garantien (z. B. Standardvertragsklauseln) bestehen.' : 'appropriate safeguards (e.g. standard contractual clauses) are in place.'}</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '9. Betroffenenrechte' : '9. Data Subject Rights'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Der Auftragsverarbeiter unterstützt den Verantwortlichen bei der Beantwortung von Anträgen auf:'
                        : 'The Processor shall assist the Controller in responding to requests for:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch.' : 'Access, rectification, erasure, restriction, data portability, objection.'}</li>
                    </ul>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Der Auftragsverarbeiter beantwortet Anfragen betroffener Personen nicht eigenständig.'
                        : 'The Processor shall not independently respond to requests from data subjects.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '10. Meldung von Datenschutzverletzungen' : '10. Notification of Data Breaches'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Der Auftragsverarbeiter meldet dem Verantwortlichen unverzüglich, spätestens innerhalb von 48 Stunden nach Kenntnisnahme, Datenschutzverletzungen.'
                        : 'The Processor shall notify the Controller without undue delay, no later than 48 hours after becoming aware, of any data breaches.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Die Meldung enthält alle verfügbaren Informationen gemäß Art. 33 DSGVO, insbesondere:'
                        : 'The notification shall contain all available information pursuant to Art. 33 GDPR, in particular:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-base text-muted-foreground">
                      <li>{isDE ? 'Art der Verletzung' : 'Nature of the breach'}</li>
                      <li>{isDE ? 'betroffene Kategorien/Daten/Anzahl Betroffener' : 'affected categories/data/number of data subjects'}</li>
                      <li>{isDE ? 'empfohlene Maßnahmen' : 'recommended measures'}</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '11. Kontrollrechte' : '11. Audit Rights'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Der Auftragsverarbeiter stellt dem Verantwortlichen alle erforderlichen Informationen zum Nachweis der Einhaltung dieses AVV zur Verfügung (z. B. TOMs, Zertifikate, Audit-Berichte).'
                        : 'The Processor shall make available to the Controller all information necessary to demonstrate compliance with this DPA (e.g. TOMs, certificates, audit reports).'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Physische Audits vor Ort sind nur bei nachweislichem Verdacht auf schwerwiegende Verstöße möglich, maximal einmal alle 24 Monate, auf Kosten des Verantwortlichen und unter NDA (Geheimhaltung). Remote-Audits (Dokumente) haben Vorrang.'
                        : 'On-site physical audits are only possible in case of demonstrable suspicion of serious violations, a maximum of once every 24 months, at the Controller\'s expense and under NDA (confidentiality). Remote audits (documents) take priority.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(3)</span> {isDE
                        ? 'Kosten trägt der Verantwortliche vollständig.'
                        : 'Costs are borne entirely by the Controller.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '12. Rückgabe und Löschung von Daten' : '12. Return and Deletion of Data'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Nach Vertragsende löscht der Auftragsverarbeiter personenbezogene Daten gemäß den vertraglichen Regelungen, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.'
                        : 'After termination, the Processor shall delete personal data in accordance with the contractual provisions, unless statutory retention obligations apply.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Auf Wunsch des Verantwortlichen erfolgt eine vorherige Datenherausgabe innerhalb von 30 Tagen nach Anfrage in einem strukturierten, maschinenlesbaren Format (z. B. CSV, XLSX).'
                        : 'At the Controller\'s request, prior data release shall take place within 30 days of the request in a structured, machine-readable format (e.g. CSV, XLSX).'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '13. Haftung' : '13. Liability'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Für Schäden aus der Verarbeitung personenbezogener Daten gelten die Haftungsregelungen der Nutzungsbedingungen (AGB § 12).'
                        : 'The liability provisions of the Terms of Service (Section 12) apply to damages arising from the processing of personal data.'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Der Auftragsverarbeiter haftet unbeschränkt bei vorsätzlichen oder grob fahrlässigen Datenschutzverstößen.'
                        : 'The Processor shall have unlimited liability in case of intentional or grossly negligent data protection violations.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {isDE ? '14. Schlussbestimmungen' : '14. Final Provisions'}
                  </h3>
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(1)</span> {isDE
                        ? 'Änderungen und Ergänzungen bedürfen der Textform (E-Mail reicht).'
                        : 'Amendments and supplements require text form (email is sufficient).'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">(2)</span> {isDE
                        ? 'Sollte eine Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen wirksam. Die Parteien verpflichten sich, die unwirksame Bestimmung durch eine wirksame zu ersetzen.'
                        : 'Should any provision be invalid, the remainder of the agreement shall remain effective. The Parties undertake to replace the invalid provision with a valid one.'}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
