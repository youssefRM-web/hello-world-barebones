import { useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/components/language-provider';

export default function Datenschutz() {
  const { language } = useLanguage();
  const isDE = language === 'de';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = isDE ? 'Datenschutzerklärung - Mendigo' : 'Privacy Policy - Mendigo';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content = isDE
      ? 'Datenschutzerklärung der R&M Software GmbH für die Nutzung von Mendigo.'
      : 'Privacy Policy of R&M Software GmbH for the use of Mendigo.';
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
            {isDE ? 'Datenschutzerklärung' : 'Privacy Policy'}
          </h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '1. Allgemeine Hinweise' : '1. General Information'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen. In dieser Datenschutzerklärung informieren wir Sie umfassend, transparent und verständlich darüber, welche personenbezogenen Daten wir erheben, verarbeiten und speichern, zu welchen Zwecken dies geschieht, auf welcher rechtlichen Grundlage die Verarbeitung erfolgt und welche Rechte Ihnen als betroffene Person zustehen.'
                    : 'The protection of your personal data is important to us. In this privacy policy, we inform you comprehensively, transparently and understandably about which personal data we collect, process and store, for what purposes, on what legal basis, and what rights you have as a data subject.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen. Dazu zählen insbesondere Name, E-Mail-Adresse, Telefonnummer, Standortdaten, Bild- oder Videomaterial sowie technische Kennungen.'
                    : 'Personal data is any information relating to an identified or identifiable natural person. This includes in particular name, email address, telephone number, location data, image or video material, and technical identifiers.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Diese Datenschutzerklärung richtet sich an alle Personen, die unsere Website oder unsere Software-Plattform Mendigo sowie der dazugehörigen mobilen Apps für iOS und Android nutzen oder mit ihr in Berührung kommen, insbesondere meldende Personen, registrierte Nutzer, externe Dienstleister sowie Besucher unserer Website.'
                    : 'This privacy policy applies to all persons who use or come into contact with our website or our software platform Mendigo and the associated mobile apps for iOS and Android, in particular reporting persons, registered users, external service providers and visitors to our website.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die Verarbeitung personenbezogener Daten erfolgt ausschließlich im Einklang mit der Datenschutz-Grundverordnung (DSGVO), dem Bundesdatenschutzgesetz (BDSG) sowie allen weiteren anwendbaren datenschutzrechtlichen Vorschriften.'
                    : 'The processing of personal data is carried out exclusively in accordance with the General Data Protection Regulation (GDPR), the German Federal Data Protection Act (BDSG) and all other applicable data protection regulations.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '2. Änderung und Aktualisierung dieser Datenschutzerklärung' : '2. Changes and Updates to this Privacy Policy'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu ändern oder zu aktualisieren, insbesondere wenn sich rechtliche Anforderungen, technische Rahmenbedingungen oder der Funktionsumfang unserer Services ändern.'
                    : 'We reserve the right to change or update this privacy policy as needed, particularly when legal requirements, technical conditions, or the scope of our services change.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Änderungen werden in dieser Datenschutzerklärung kenntlich gemacht. Sofern gesetzlich erforderlich, werden wir Sie über wesentliche Änderungen gesondert informieren (z. B. über die Website oder per E-Mail).'
                    : 'Changes will be indicated in this privacy policy. If legally required, we will inform you separately about significant changes (e.g., via the website or by email).'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die jeweils aktuelle Version ist jederzeit auf unserer Website abrufbar.'
                    : 'The current version is always available on our website.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '3. Verantwortlicher im Sinne der DSGVO' : '3. Controller under GDPR'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <div className="ml-0 space-y-1">
                  <p className="text-base font-medium text-foreground">R&M Software GmbH</p>
                  <p className="text-base text-muted-foreground">Vossem 26</p>
                  <p className="text-base text-muted-foreground">41812 Erkelenz</p>
                  <p className="text-base text-muted-foreground">{isDE ? 'Deutschland' : 'Germany'}</p>
                </div>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? 'Vertreten durch:' : 'Represented by:'}</span><br />
                  {isDE ? 'Geschäftsführer: Sami Magri' : 'Managing Director: Sami Magri'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? 'Kontakt:' : 'Contact:'}</span>{' '}
                  <a href="mailto:mendigo@rmsoftware.de" className="text-foreground hover:text-muted-foreground underline transition-colors">mendigo@rmsoftware.de</a>
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? 'Registereintrag:' : 'Register Entry:'}</span><br />
                  {isDE ? 'Handelsregister: HRB 19442' : 'Commercial Register: HRB 19442'}<br />
                  {isDE ? 'Registergericht: Amtsgericht Mönchengladbach' : 'Registry Court: Local Court of Mönchengladbach'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? 'Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:' : 'VAT Identification Number according to § 27a UStG:'}</span><br />
                  DE331574633
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Für alle datenschutzrechtlichen Anliegen können Sie sich jederzeit an die oben genannte Kontaktadresse wenden.'
                    : 'For all data protection matters, you can contact the above address at any time.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '4. Zustimmung zur Datenschutzerklärung und Bereitstellung von Daten' : '4. Consent to Privacy Policy and Data Provision'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die Nutzung unserer Website und unserer Services setzt voraus, dass Sie diese Datenschutzerklärung zur Kenntnis genommen haben.'
                    : 'The use of our website and services requires that you have taken note of this privacy policy.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Sie sind grundsätzlich nicht verpflichtet, uns personenbezogene Daten bereitzustellen. Bitte beachten Sie jedoch, dass bestimmte Funktionen und Services ohne die Bereitstellung erforderlicher personenbezogener Daten nicht oder nur eingeschränkt genutzt werden können (z. B. Nutzerkonten, Ticketbearbeitung oder Kommunikation).'
                    : 'You are generally not obligated to provide us with personal data. However, please note that certain functions and services cannot be used or can only be used to a limited extent without the provision of required personal data (e.g., user accounts, ticket processing, or communication).'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Sie behalten jederzeit das Eigentum und die Kontrolle über Ihre personenbezogenen Daten.'
                    : 'You retain ownership and control of your personal data at all times.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Wir verarbeiten diese ausschließlich zu den in dieser Datenschutzerklärung beschriebenen Zwecken und nur im hierfür erforderlichen Umfang.'
                    : 'We process this data exclusively for the purposes described in this privacy policy and only to the extent necessary.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '5. Rollenverteilung bei der Datenverarbeitung' : '5. Role Distribution in Data Processing'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Mendigo ist eine Software-Plattform, die von Unternehmen und Organisationen eingesetzt wird, um Probleme, Aufgaben, Assets und Wartungen zu melden, zu verwalten und zu dokumentieren.'
                    : 'Mendigo is a software platform used by companies and organizations to report, manage, and document problems, tasks, assets, and maintenance.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? '5.1 Mendigo als Verantwortlicher' : '5.1 Mendigo as Controller'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Mendigo ist Verantwortlicher im Sinne der DSGVO für die Verarbeitung personenbezogener Daten im Zusammenhang mit:'
                    : 'Mendigo is the controller under GDPR for the processing of personal data in connection with:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE ? 'dem Betrieb dieser Website' : 'the operation of this website'}</li>
                  <li>{isDE ? 'der Registrierung, Verwaltung und Authentifizierung von Nutzerkonten' : 'registration, management, and authentication of user accounts'}</li>
                  <li>{isDE ? 'Vertrags- und Abrechnungsprozessen' : 'contract and billing processes'}</li>
                  <li>{isDE ? 'dem technischen Betrieb der Plattform' : 'technical operation of the platform'}</li>
                  <li>{isDE ? 'dem Versand von System- und Benachrichtigungs-E-Mails' : 'sending system and notification emails'}</li>
                  <li>{isDE ? 'Sicherheitsmaßnahmen, Server-Logs und Fehleranalyse' : 'security measures, server logs, and error analysis'}</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? '5.2 Mendigo als Auftragsverarbeiter' : '5.2 Mendigo as Processor'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Soweit Mendigo von Unternehmenskunden zur Bearbeitung von Meldungen, Tickets, Gebäuden, Räumen, Assets oder Wartungen eingesetzt wird, verarbeitet Mendigo personenbezogene Daten ausschließlich im Auftrag des jeweiligen Unternehmenskunden.'
                    : 'When Mendigo is used by business customers to process reports, tickets, buildings, rooms, assets, or maintenance, Mendigo processes personal data exclusively on behalf of the respective business customer.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'In diesen Fällen ist der jeweilige Unternehmenskunde der Verantwortliche im Sinne der DSGVO. Mendigo handelt als Auftragsverarbeiter gemäß Art. 28 DSGVO auf Grundlage eines Auftragsverarbeitungsvertrags (AVV). Der entsprechende Auftragsverarbeitungsvertrag ist in Anlage 1 zu unseren Allgemeinen Geschäftsbedingungen (AGB) geregelt.'
                    : 'In these cases, the respective business customer is the controller under GDPR. Mendigo acts as a processor in accordance with Art. 28 GDPR based on a data processing agreement (DPA). The corresponding data processing agreement is set out in Annex 1 to our General Terms and Conditions (GTC).'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die Kommunikation mit meldenden Personen erfolgt grundsätzlich durch die jeweilige Organisation. Mendigo stellt lediglich die technische Plattform bereit und verarbeitet die Daten ausschließlich im Auftrag der verantwortlichen Organisation.'
                    : 'Communication with reporting persons is generally carried out by the respective organization. Mendigo merely provides the technical platform and processes the data exclusively on behalf of the responsible organization.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '6. Kategorien betroffener Personen und personenbezogener Daten' : '6. Categories of Data Subjects and Personal Data'}
              </h2>
              <div className="space-y-4 leading-relaxed">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {isDE ? '6.1 Kategorie 1 – Meldende Personen („Reporter")' : '6.1 Category 1 – Reporting Persons ("Reporters")'}
                  </h3>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE
                      ? 'Personen, die über QR-Codes, Web-Formulare oder Links ein Problem melden (z. B. Besucher, Mieter, Mitarbeitende).'
                      : 'Persons who report a problem via QR codes, web forms, or links (e.g., visitors, tenants, employees).'}
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE ? 'Verarbeitete Daten können sein:' : 'Processed data may include:'}
                  </p>
                  <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                    <li>{isDE ? 'Kontaktdaten (z. B. Name, E-Mail-Adresse, Telefonnummer)' : 'Contact data (e.g., name, email address, telephone number)'}</li>
                    <li>{isDE ? 'Standort-, Gebäude-, Raum- oder Asset-Informationen' : 'Location, building, room, or asset information'}</li>
                    <li>{isDE ? 'Beschreibung des gemeldeten Problems' : 'Description of the reported problem'}</li>
                    <li>{isDE ? 'hochgeladene Fotos oder Videos' : 'Uploaded photos or videos'}</li>
                    <li>{isDE ? 'Nutzungs- und Cookie-Daten' : 'Usage and cookie data'}</li>
                    <li>{isDE ? 'technische Log-Daten' : 'Technical log data'}</li>
                  </ul>
                  <p className="text-base text-muted-foreground mt-3">
                    <span className="font-medium text-foreground">
                      {isDE ? 'Angabe von Kontaktdaten im Rahmen von Problemmeldungen:' : 'Provision of contact data in the context of problem reports:'}
                    </span><br />
                    {isDE
                      ? 'Wenn Sie im Rahmen einer Problemmeldung Ihre E-Mail-Adresse oder andere Kontaktdaten angeben oder diese im jeweiligen Kontext erforderlich sind, werden diese Daten verwendet, um Informationen zum Bearbeitungsstatus der Meldung bereitzustellen und um Rückfragen zur gemeldeten Angelegenheit zu ermöglichen.'
                      : 'If you provide your email address or other contact data in the context of a problem report, or if such data is required in the respective context, this data will be used to provide information on the processing status of the report and to enable follow-up inquiries regarding the reported matter.'}
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE
                      ? 'Die Verarbeitung dieser Kontaktdaten erfolgt zur Durchführung der jeweiligen Meldung sowie zur sachgerechten Bearbeitung durch die zuständige Organisation und basiert auf Art. 6 Abs. 1 lit. b DSGVO (vertragliche bzw. vorvertragliche Maßnahmen) sowie – soweit einschlägig – auf Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer effizienten und nachvollziehbaren Bearbeitung der Meldung).'
                      : 'The processing of this contact data is carried out for the purpose of executing the respective report and for proper handling by the responsible organization, and is based on Art. 6 (1) lit. b GDPR (contractual or pre-contractual measures) and – where applicable – on Art. 6 (1) lit. f GDPR (legitimate interest in efficient and traceable processing of the report).'}
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE
                      ? 'Die Kontaktaufnahme mit der meldenden Person erfolgt grundsätzlich durch die jeweilige Organisation, an die die Meldung gerichtet ist. Mendigo verarbeitet diese Daten ausschließlich im Auftrag dieser Organisation.'
                      : 'Contact with the reporting person is generally made by the respective organization to which the report is directed. Mendigo processes this data exclusively on behalf of this organization.'}
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE
                      ? 'Eine Nutzung der angegebenen Kontaktdaten zu Werbezwecken findet nicht statt.'
                      : 'The contact data provided will not be used for advertising purposes.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {isDE ? '6.2 Kategorie 2 – Interne Nutzer („Manager / Bearbeiter")' : '6.2 Category 2 – Internal Users ("Managers / Processors")'}
                  </h3>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE
                      ? 'Personen, die Meldungen verwalten oder bearbeiten (z. B. Facility-Manager, Techniker, Administratoren).'
                      : 'Persons who manage or process reports (e.g., facility managers, technicians, administrators).'}
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE ? 'Verarbeitete Daten können sein:' : 'Processed data may include:'}
                  </p>
                  <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                    <li>{isDE ? 'Identifikationsdaten (Name, E-Mail-Adresse)' : 'Identification data (name, email address)'}</li>
                    <li>{isDE ? 'Account-Daten (Passwort-Hash, systemgenerierte ID)' : 'Account data (password hash, system-generated ID)'}</li>
                    <li>{isDE ? 'Rollen und Berechtigungen' : 'Roles and permissions'}</li>
                    <li>{isDE ? 'Bearbeitungs- und Kommunikationsdaten' : 'Processing and communication data'}</li>
                    <li>{isDE ? 'Nutzungs-, Cookie- und Log-Daten' : 'Usage, cookie, and log data'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {isDE ? '6.3 Kategorie 3 – Externe Dienstleister' : '6.3 Category 3 – External Service Providers'}
                  </h3>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE
                      ? 'Externe Personen oder Unternehmen, die im Auftrag eines Kunden Aufgaben bearbeiten (z. B. Handwerker, Reinigungsdienste).'
                      : 'External persons or companies that process tasks on behalf of a customer (e.g., craftsmen, cleaning services).'}
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isDE ? 'Verarbeitete Daten können sein:' : 'Processed data may include:'}
                  </p>
                  <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                    <li>{isDE ? 'Identifikations- und Kontaktdaten' : 'Identification and contact data'}</li>
                    <li>{isDE ? 'Account-Daten (sofern vorhanden)' : 'Account data (if applicable)'}</li>
                    <li>{isDE ? 'Bearbeitungs- und Kommunikationsdaten' : 'Processing and communication data'}</li>
                    <li>{isDE ? 'Nutzungs- und Log-Daten' : 'Usage and log data'}</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '7. Zwecke und Rechtsgrundlagen der Verarbeitung' : '7. Purposes and Legal Bases of Processing'}
              </h2>
              <div className="space-y-4 leading-relaxed">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {isDE ? '7.1 Zwecke & Rechtsgrundlagen der Verarbeitung' : '7.1 Purposes & Legal Bases of Processing'}
                  </h3>
                  <ul className="ml-6 space-y-3 text-base text-muted-foreground list-disc mt-2">
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Bereitstellung und Betrieb der Mendigo-Plattform:' : 'Provision and operation of the Mendigo platform:'}
                      </span>{' '}
                      {isDE
                        ? 'Technischer Betrieb, Hosting, Updates. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.'
                        : 'Technical operation, hosting, updates. Legal basis: Art. 6 (1) lit. b GDPR.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Erfassung, Bearbeitung und Dokumentation von Meldungen:' : 'Recording, processing, and documentation of reports:'}
                      </span>{' '}
                      {isDE
                        ? 'Verarbeitung gemeldeter Probleme, Tickets, Assets durch Kunden. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, f DSGVO.'
                        : 'Processing of reported problems, tickets, assets by customers. Legal basis: Art. 6 (1) lit. b, f GDPR.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Verwaltung von Nutzerkonten und Berechtigungen:' : 'Management of user accounts and permissions:'}
                      </span>{' '}
                      {isDE
                        ? 'Registrierung, Authentifizierung, Rollenverwaltung. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.'
                        : 'Registration, authentication, role management. Legal basis: Art. 6 (1) lit. b GDPR.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Kommunikation zwischen beteiligten Personen:' : 'Communication between involved persons:'}
                      </span>{' '}
                      {isDE
                        ? 'Tickets, Kommentare, Benachrichtigungen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.'
                        : 'Tickets, comments, notifications. Legal basis: Art. 6 (1) lit. b GDPR.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Geschäftliche Kundenkommunikation:' : 'Business customer communication:'}
                      </span>{' '}
                      {isDE
                        ? 'Die bei Registrierung oder später in den Kunden-Einstellungen hinterlegten Kontaktdaten unserer Unternehmenskunden werden genutzt für Plattform-Status, Systemnachrichten, Features, Support, Zufriedenheitsrückfragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, f DSGVO. Abwahl optional im Portal.'
                        : 'The contact data provided during registration or later in customer settings of our business customers is used for platform status, system messages, features, support, satisfaction inquiries. Legal basis: Art. 6 (1) lit. b, f GDPR. Opt-out available in the portal.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Abrechnung und Zahlungsabwicklung:' : 'Billing and payment processing:'}
                      </span>{' '}
                      {isDE
                        ? 'Tarifabrechnung, Rechnungsstellung, Zahlungsverkehr. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, c DSGVO.'
                        : 'Tariff billing, invoicing, payment transactions. Legal basis: Art. 6 (1) lit. b, c GDPR.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Gewährleistung von Sicherheit, Stabilität und Fehlerfreiheit:' : 'Ensuring security, stability, and error-free operation:'}
                      </span>{' '}
                      {isDE
                        ? 'Logs, Monitoring, Sicherheitsmaßnahmen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.'
                        : 'Logs, monitoring, security measures. Legal basis: Art. 6 (1) lit. f GDPR.'}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        {isDE ? 'Erfüllung gesetzlicher Verpflichtungen:' : 'Fulfillment of legal obligations:'}
                      </span>{' '}
                      {isDE
                        ? 'Buchführung, Rechnungsarchivierung. Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO.'
                        : 'Bookkeeping, invoice archiving. Legal basis: Art. 6 (1) lit. c GDPR.'}
                    </li>
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {isDE ? 'Strukturierte Übersicht' : 'Structured Overview'}
                  </h3>
                  <div className="overflow-x-auto mt-3">
                    <table className="min-w-full text-sm text-muted-foreground border border-border rounded">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                            {isDE ? 'Betroffene Personengruppe' : 'Affected Group of Persons'}
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                            {isDE ? 'Zweck der Verarbeitung' : 'Purpose of Processing'}
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                            {isDE ? 'Verarbeitete Datenarten' : 'Processed Data Types'}
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                            {isDE ? 'Rechtsgrundlage' : 'Legal Basis'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-4 py-2">{isDE ? 'Meldende Personen' : 'Reporting persons'}</td>
                          <td className="px-4 py-2">{isDE ? 'Bearbeitung von Meldungen' : 'Processing of reports'}</td>
                          <td className="px-4 py-2">{isDE ? 'Kontaktdaten, Standortdaten, Fotos/Videos' : 'Contact data, location data, photos/videos'}</td>
                          <td className="px-4 py-2">{isDE ? 'Art. 6 Abs. 1 lit. b, f DSGVO' : 'Art. 6 (1) lit. b, f GDPR'}</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-4 py-2">{isDE ? 'Interne Nutzer' : 'Internal users'}</td>
                          <td className="px-4 py-2">{isDE ? 'Nutzer- & Ticketverwaltung' : 'User & ticket management'}</td>
                          <td className="px-4 py-2">{isDE ? 'Account- & Kommunikationsdaten' : 'Account & communication data'}</td>
                          <td className="px-4 py-2">{isDE ? 'Art. 6 Abs. 1 lit. b DSGVO' : 'Art. 6 (1) lit. b GDPR'}</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-4 py-2">{isDE ? 'Externe Dienstleister' : 'External service providers'}</td>
                          <td className="px-4 py-2">{isDE ? 'Koordination externer Leistungen' : 'Coordination of external services'}</td>
                          <td className="px-4 py-2">{isDE ? 'Kontakt- & Bearbeitungsdaten' : 'Contact & processing data'}</td>
                          <td className="px-4 py-2">{isDE ? 'Art. 6 Abs. 1 lit. b, f DSGVO' : 'Art. 6 (1) lit. b, f GDPR'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">{isDE ? 'Website-Besucher' : 'Website visitors'}</td>
                          <td className="px-4 py-2">{isDE ? 'Betrieb & Sicherheit' : 'Operation & security'}</td>
                          <td className="px-4 py-2">{isDE ? 'Cookie- & Log-Daten' : 'Cookie & log data'}</td>
                          <td className="px-4 py-2">{isDE ? 'Art. 6 Abs. 1 lit. f, a DSGVO' : 'Art. 6 (1) lit. f, a GDPR'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '8. Technische Infrastruktur & Hosting' : '8. Technical Infrastructure & Hosting'}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-muted-foreground border border-border rounded">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                        {isDE ? 'Bereich' : 'Area'}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                        {isDE ? 'Dienstleister' : 'Service Provider'}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                        {isDE ? 'Zweck' : 'Purpose'}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                        {isDE ? 'Serverstandort' : 'Server Location'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Cloud-Hosting</td>
                      <td className="px-4 py-2">{isDE ? 'Amazon Web Services EMEA SARL, Luxemburg' : 'Amazon Web Services EMEA SARL, Luxembourg'}</td>
                      <td className="px-4 py-2">{isDE ? 'Betrieb der Plattform' : 'Platform operation'}</td>
                      <td className="px-4 py-2">Frankfurt (DE)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">{isDE ? 'Datenbank' : 'Database'}</td>
                      <td className="px-4 py-2">MongoDB, Inc., New York, USA</td>
                      <td className="px-4 py-2">{isDE ? 'Datenhaltung' : 'Data storage'}</td>
                      <td className="px-4 py-2">{isDE ? 'EU-Region (Frankfurt)' : 'EU Region (Frankfurt)'}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">{isDE ? 'E-Mail-Versand' : 'Email Delivery'}</td>
                      <td className="px-4 py-2">Amazon Web Services EMEA SARL</td>
                      <td className="px-4 py-2">{isDE ? 'System-E-Mails' : 'System emails'}</td>
                      <td className="px-4 py-2">Frankfurt (DE)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">{isDE ? 'Zahlung' : 'Payment'}</td>
                      <td className="px-4 py-2">Mollie B.V., Amsterdam, NL</td>
                      <td className="px-4 py-2">{isDE ? 'Zahlungsabwicklung' : 'Payment processing'}</td>
                      <td className="px-4 py-2">{isDE ? 'Niederlande (EU)' : 'Netherlands (EU)'}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">{isDE ? 'Zahlung' : 'Payment'}</td>
                      <td className="px-4 py-2">{isDE ? 'PayPal (Europe) S.à r.l. et Cie, Luxemburg' : 'PayPal (Europe) S.à r.l. et Cie, Luxembourg'}</td>
                      <td className="px-4 py-2">{isDE ? 'Zahlungsabwicklung' : 'Payment processing'}</td>
                      <td className="px-4 py-2">Luxembourg (EU)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">{isDE ? 'Terminbuchung' : 'Appointment Booking'}</td>
                      <td className="px-4 py-2">Zeeg GmbH, Friedrichstr. 114A, 10117 Berlin, Germany</td>
                      <td className="px-4 py-2">{isDE ? 'Terminplanung (Demo)' : 'Scheduling (Demo)'}</td>
                      <td className="px-4 py-2">{isDE ? 'Deutschland (EU)' : 'Germany (EU)'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">{isDE ? 'CDN / Sicherheit' : 'CDN / Security'}</td>
                      <td className="px-4 py-2">Cloudflare, Inc., San Francisco, USA</td>
                      <td className="px-4 py-2">{isDE ? 'DDoS-Schutz, CDN, WAF' : 'DDoS protection, CDN, WAF'}</td>
                      <td className="px-4 py-2">{isDE ? 'EU-Region' : 'EU Region'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '9. Nutzung der mobilen Apps von Mendigo' : '9. Use of Mendigo Mobile Apps'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Mendigo bietet mobile Apps für iOS und Android an, die ausschließlich registrierten Teammitgliedern mit gültigem Login zur Verfügung stehen. Die Apps nutzen dieselbe technische Infrastruktur wie die Web-Anwendung. Es werden keine zusätzlichen personenbezogenen Daten erhoben, die über die in dieser Datenschutzerklärung beschriebenen Kategorien hinausgehen.'
                    : 'Mendigo offers mobile apps for iOS and Android that are available exclusively to registered team members with a valid login. The apps use the same technical infrastructure as the web application. No additional personal data is collected beyond the categories described in this privacy policy.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Berechtigungen und Zugriff auf Gerätefunktionen' : 'Permissions and Access to Device Functions'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die mobilen Apps greifen auf Gerätefunktionen (z. B. Kamera, Push-Benachrichtigungen) nur dann zu, wenn dies für die jeweilige Funktion erforderlich ist und der Nutzer die entsprechende Berechtigung erteilt hat. Erteilte Berechtigungen können jederzeit in den Geräteeinstellungen widerrufen werden.'
                    : 'The mobile apps access device functions (e.g., camera, push notifications) only when this is necessary for the respective function and the user has granted the corresponding permission. Granted permissions can be revoked at any time in the device settings.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Nutzung der Kamera in den mobilen Apps' : 'Use of the Camera in the Mobile Apps'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die Kamera wird genutzt, um Fotos oder Videos im Rahmen der Ticketbearbeitung aufzunehmen. Ein automatischer Zugriff auf die Kamera erfolgt nicht. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, f DSGVO.'
                    : 'The camera is used to take photos or videos as part of ticket processing. No automatic access to the camera takes place. Legal basis: Art. 6 (1) lit. b, f GDPR.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Nutzung der Kamera zur QR-Code-Erkennung' : 'Use of the Camera for QR Code Recognition'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Die Kamera kann zur Erkennung von QR-Codes verwendet werden. Während des Scanvorgangs werden keine Fotos oder Videos gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, f DSGVO.'
                    : 'The camera can be used to recognize QR codes. No photos or videos are stored during the scanning process. Legal basis: Art. 6 (1) lit. b, f GDPR.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Offline-Speicherung und spätere Synchronisation' : 'Offline Storage and Subsequent Synchronization'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Daten können vorübergehend lokal auf dem Gerät gespeichert und bei bestehender Internetverbindung synchronisiert werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, f DSGVO.'
                    : 'Data may be temporarily stored locally on the device and synchronized when an internet connection is available. Legal basis: Art. 6 (1) lit. b, f GDPR.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Push-Benachrichtigungen' : 'Push Notifications'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Push-Benachrichtigungen werden für Statusänderungen und relevante Ereignisse versendet. Es erfolgt kein Marketing über Push-Benachrichtigungen. Der Versand erfolgt über Apple Push Notification Service bzw. Google Firebase Cloud Messaging. Rechtsgrundlage: Art. 6 Abs. 1 lit. b, f DSGVO.'
                    : 'Push notifications are sent for status changes and relevant events. No marketing is conducted via push notifications. Delivery is carried out via Apple Push Notification Service or Google Firebase Cloud Messaging. Legal basis: Art. 6 (1) lit. b, f GDPR.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Zusammenfassung zur App-Nutzung' : 'Summary of App Usage'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Es findet keine verdeckte Datenerhebung statt. Es wird kein Marketing-Tracking in den Apps eingesetzt.'
                    : 'No covert data collection takes place. No marketing tracking is used in the apps.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '10. Cookies, Website-Nutzung & Logs' : '10. Cookies, Website Usage & Logs'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Bei der Nutzung unserer Website werden Cookie-Technologien eingesetzt, um die Funktionalität, Sicherheit und Nutzerfreundlichkeit zu gewährleisten sowie Nutzungsdaten für Analyse und Verbesserung zu erfassen.'
                    : 'When using our website, cookie technologies are used to ensure functionality, security, and user-friendliness, as well as to collect usage data for analysis and improvement.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? <>Zur Einholung und Verwaltung von Cookie-Einwilligungen nutzen wir die <strong>Cookiebot Consent Management Platform (CMP)</strong> von <strong>Usercentrics A/S</strong> (Havnegade 39, 1058 Kopenhagen, Dänemark) als Auftragsverarbeiter. Ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO besteht. Cookiebot scannt unsere Website automatisch, kategorisiert alle Cookies in die Kategorien „notwendig", „Präferenzen", „Statistiken" und „Marketing" und zeigt Nutzern einen Consent-Banner zur granularen Einwilligung.</>
                    : <>For obtaining and managing cookie consents, we use the <strong>Cookiebot Consent Management Platform (CMP)</strong> from <strong>Usercentrics A/S</strong> (Havnegade 39, 1058 Copenhagen, Denmark) as a processor. A data processing agreement (DPA) according to Art. 28 GDPR is in place. Cookiebot automatically scans our website, categorizes all cookies into the categories "necessary", "preferences", "statistics" and "marketing", and displays a consent banner to users for granular consent.</>}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE ? 'Cookiebot verarbeitet dabei:' : 'Cookiebot processes the following data:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE ? 'IP-Adressen' : 'IP addresses'}</li>
                  <li>{isDE ? 'Zeitstempel der Einwilligung' : 'Consent timestamps'}</li>
                  <li>{isDE ? 'Cookie-Kategorien' : 'Cookie categories'}</li>
                  <li>{isDE ? 'Browser-Informationen' : 'Browser information'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? <>Die Rechtsgrundlage für die CMP-Nutzung ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung für optionale Cookies) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse für den technischen CMP-Betrieb). Die Einwilligungsdaten werden bis zum Widerruf oder zur Löschung gespeichert. Die Datenschutzerklärung von Cookiebot finden Sie unter{' '}<a href="https://usercentrics.com/de/datenschutzerklaerung/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline transition-colors">https://usercentrics.com/de/datenschutzerklaerung/</a>.</>
                    : <>The legal basis for the use of the CMP is Art. 6 (1) lit. a GDPR (consent for optional cookies) and Art. 6 (1) lit. f GDPR (legitimate interest for the technical CMP operation). Consent data is stored until revocation or deletion. The privacy policy of Cookiebot can be found at{' '}<a href="https://usercentrics.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline transition-colors">https://usercentrics.com/privacy-policy/</a>.</>}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Nutzer können Einwilligungen jederzeit über den Cookiebot-Banner widerrufen. Die Ablehnung ist genauso einfach wie die Zustimmung. Technisch notwendige Cookies werden ohne Einwilligung gesetzt (Art. 6 Abs. 1 lit. f DSGVO). Wir speichern zudem Server-Logs mit Zugriffsdaten (IP-Adresse, Browser, Zeitpunkt, besuchte Seiten) für 7 Tage zur Sicherstellung der Sicherheit und Fehlerbehebung (Art. 6 Abs. 1 lit. f DSGVO).'
                    : 'Users can revoke their consent at any time via the Cookiebot banner. Rejection is just as easy as consent. Technically necessary cookies are set without consent (Art. 6 (1) lit. f GDPR). We also store server logs with access data (IP address, browser, time, visited pages) for 7 days to ensure security and troubleshooting (Art. 6 (1) lit. f GDPR).'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">Microsoft Clarity</h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Wir nutzen Microsoft Clarity zur Analyse der Nutzung und Interaktion mit unserer Website durch Verhaltensmetriken, Heatmaps und Session Recordings.'
                    : 'We use Microsoft Clarity to analyze usage and interaction with our website through behavioral metrics, heatmaps, and session recordings.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE ? 'Verarbeitete Daten:' : 'Processed data:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE ? 'IP-Adresse' : 'IP address'}</li>
                  <li>{isDE ? 'Zugriffszeiten' : 'Access times'}</li>
                  <li>{isDE ? 'Cursor-/Scroll-Bewegungen' : 'Cursor/scroll movements'}</li>
                  <li>{isDE ? 'Klicks' : 'Clicks'}</li>
                  <li>{isDE ? 'Session-Aufzeichnungen (maskiert)' : 'Session recordings (masked)'}</li>
                  <li>{isDE ? 'Browserdaten' : 'Browser data'}</li>
                  <li>{isDE ? 'Geräteinformationen' : 'Device information'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO; Speicherung von Cookies nur nach Einwilligung gem. § 25 TDDDG (Opt-in über Cookie-Banner).'
                    : 'Legal basis: Art. 6 (1) lit. f GDPR; cookies are only stored after consent pursuant to § 25 TDDDG (opt-in via cookie banner).'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Datenübermittlung: USA (Microsoft Corporation). Microsoft Clarity ist DPF-zertifiziert (EU-US Data Privacy Framework) und nutzt Standardvertragsklauseln (SCCs).'
                    : 'Data transfer: USA (Microsoft Corporation). Microsoft Clarity is DPF-certified (EU-US Data Privacy Framework) and uses Standard Contractual Clauses (SCCs).'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Speicherdauer: Bis zu 12 Monate; Löschung nach Widerruf.'
                    : 'Storage duration: Up to 12 months; deletion after revocation.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Widerspruch: Per Cookie-Banner (Opt-out); Consent Mode v2 aktiviert – Tracking nur bei Einwilligung.'
                    : 'Objection: Via cookie banner (opt-out); Consent Mode v2 activated – tracking only with consent.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? <>Weitere Informationen:{' '}<a href="https://privacy.microsoft.com/de-de/privacystatement" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline transition-colors">https://privacy.microsoft.com/de-de/privacystatement</a></>
                    : <>Further information:{' '}<a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline transition-colors">https://privacy.microsoft.com/en-us/privacystatement</a></>}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '11. Kontaktformular für Vertriebsanfragen' : '11. Contact Form for Sales Inquiries'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Auf unserer Website bieten wir ein Kontaktformular für geschäftliche Anfragen an. Im Rahmen der Nutzung dieses Formulars werden folgende Daten verarbeitet:'
                    : 'On our website, we offer a contact form for business inquiries. The following data is processed when using this form:'}
                </p>
                <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc">
                  <li>{isDE ? 'Unternehmensname' : 'Company name'}</li>
                  <li>{isDE ? 'Vorname und Nachname' : 'First name and last name'}</li>
                  <li>{isDE ? 'Geschäftliche E-Mail-Adresse' : 'Business email address'}</li>
                  <li>{isDE ? 'Telefonnummer (optional)' : 'Telephone number (optional)'}</li>
                  <li>{isDE ? 'Unternehmensgröße' : 'Company size'}</li>
                  <li>{isDE ? 'Branche' : 'Industry'}</li>
                  <li>{isDE ? 'Anzahl der Standorte oder Objekte' : 'Number of locations or properties'}</li>
                  <li>{isDE ? 'Auswahl relevanter Funktionen (QR-Code-Meldungen, Asset-Verwaltung, Ticket-Management, präventive Wartung, Dokumentenverwaltung, Smart Insights)' : 'Selection of relevant features (QR code reports, asset management, ticket management, preventive maintenance, document management, smart insights)'}</li>
                  <li>{isDE ? 'Kurzbeschreibung der Anfrage' : 'Brief description of the inquiry'}</li>
                  <li>{isDE ? 'Angaben zum geplanten Einsatz und zur Zielsetzung' : 'Information about planned use and objectives'}</li>
                  <li>{isDE ? 'Geplanter Zeitpunkt der Einführung' : 'Planned implementation date'}</li>
                </ul>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? 'Zweck:' : 'Purpose:'}</span>{' '}
                  {isDE
                    ? 'Bearbeitung der Anfrage, Kontaktaufnahme, Bedarfseinschätzung, Vorbereitung vertraglicher Zusammenarbeit.'
                    : 'Processing of the inquiry, contact, needs assessment, preparation of contractual cooperation.'}
                </p>
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{isDE ? 'Rechtsgrundlage:' : 'Legal basis:'}</span>{' '}
                  {isDE
                    ? 'Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen). Freiwillige Angaben: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).'
                    : 'Art. 6 (1) lit. b GDPR (pre-contractual measures). Voluntary information: Art. 6 (1) lit. f GDPR (legitimate interest).'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Es erfolgt keine Weitergabe an Dritte. Die Daten werden bis zum Abschluss der Bearbeitung oder bis zur Begründung eines Vertragsverhältnisses gespeichert.'
                    : 'No disclosure to third parties takes place. The data is stored until the processing is completed or until a contractual relationship is established.'}
                </p>

                <h3 className="text-lg font-medium text-foreground mt-4">
                  {isDE ? 'Einwilligung im Vertriebs-Kontaktformular' : 'Consent in the Sales Contact Form'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Vor dem Absenden des Kontaktformulars ist eine ausdrückliche Bestätigung der Datenschutzerklärung erforderlich. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Ein Widerruf ist jederzeit möglich.'
                    : 'Before submitting the contact form, explicit confirmation of the privacy policy is required. Legal basis: Art. 6 (1) lit. a GDPR (consent). Revocation is possible at any time.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '12. Direktmarketing' : '12. Direct Marketing'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Eine Nutzung personenbezogener Daten zu Direktmarketing-Zwecken erfolgt ausschließlich auf Grundlage einer ausdrücklichen Einwilligung (Opt-in). Ohne Einwilligung findet kein Direktmarketing statt.'
                  : 'The use of personal data for direct marketing purposes is only carried out on the basis of explicit consent (opt-in). Without consent, no direct marketing takes place.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '13. Weitergabe an Dritte & Unternehmensübertragungen' : '13. Disclosure to Third Parties & Business Transfers'}
              </h2>
              <div className="space-y-3 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Eine Weitergabe erfolgt ausschließlich an sorgfältig ausgewählte Dienstleister oder im Rahmen gesetzlicher Verpflichtungen.'
                    : 'Disclosure is only made to carefully selected service providers or in the context of legal obligations.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Im Falle einer Unternehmensübertragung bleiben die Datenschutzstandards gewahrt.'
                    : 'In the event of a business transfer, data protection standards are maintained.'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '14. Speicherdauer' : '14. Storage Duration'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Nutzungs-, Ticket-, Identifikations-, Account- und Kommunikationsdaten der in dieser Datenschutzerklärung genannten betroffenen Personengruppen (meldende Personen, interne Nutzer und externe Dienstleister) werden grundsätzlich für die Dauer des jeweiligen Vertrags- bzw. Nutzungsverhältnisses mit dem jeweiligen Kunden gespeichert und darüber hinaus für bis zu 5 Jahre nach dessen Beendigung aufbewahrt, soweit dies zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist. Nach Ablauf dieser Frist werden die Daten gelöscht, sofern keine längeren gesetzlichen Aufbewahrungspflichten bestehen (insbesondere für abrechnungs- und steuerrelevante Daten bis zu 10 Jahre).'
                  : 'Usage, ticket, identification, account, and communication data of the data subject groups mentioned in this privacy policy (reporting persons, internal users, and external service providers) are generally stored for the duration of the respective contractual or usage relationship with the respective customer and retained for up to 5 years after its termination, insofar as this is necessary for the assertion, exercise, or defense of legal claims. After this period expires, the data is deleted, unless longer statutory retention obligations exist (in particular for billing and tax-relevant data up to 10 years).'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '15. Welche Datenschutzrechte haben Sie?' : '15. What Data Protection Rights Do You Have?'}
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Soweit durch Mendigo personenbezogene Daten verarbeitet werden, stehen Ihnen als betroffene Person umfangreiche Rechte nach der Datenschutz-Grundverordnung (DSGVO) zu. Diese Rechte sollen sicherstellen, dass Sie jederzeit nachvollziehen können, wie Ihre Daten verarbeitet werden, und dass Sie Einfluss auf diese Verarbeitung nehmen können.'
                    : 'As a data subject, you have extensive rights under the General Data Protection Regulation (GDPR) when personal data is processed by Mendigo. These rights are designed to ensure that you can understand how your data is processed at any time and that you can influence this processing.'}
                </p>
                <p className="text-base text-muted-foreground">
                  {isDE
                    ? 'Im Folgenden erläutern wir Ihnen Ihre Datenschutzrechte ausführlich und verständlich:'
                    : 'Below we explain your data protection rights in detail and in an understandable manner:'}
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'DSGVO, Art. 15 – Auskunftsrecht' : 'GDPR, Art. 15 – Right of Access'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Sie haben das Recht, von dem Verantwortlichen eine Bestätigung darüber zu verlangen, ob personenbezogene Daten verarbeitet werden, die Sie betreffen.'
                        : 'You have the right to obtain confirmation from the controller as to whether personal data concerning you is being processed.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Ist dies der Fall, haben Sie das Recht auf Auskunft über diese personenbezogenen Daten sowie auf weitere Informationen, insbesondere:'
                        : 'If this is the case, you have the right to access this personal data and to obtain further information, in particular:'}
                    </p>
                    <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc mt-2">
                      <li>{isDE ? 'welche personenbezogenen Daten verarbeitet werden,' : 'which personal data is being processed,'}</li>
                      <li>{isDE ? 'zu welchen Zwecken diese verarbeitet werden,' : 'for what purposes it is being processed,'}</li>
                      <li>{isDE ? 'welche Kategorien personenbezogener Daten betroffen sind,' : 'which categories of personal data are affected,'}</li>
                      <li>{isDE ? 'an welche Empfänger oder Kategorien von Empfängern die Daten weitergegeben wurden oder werden,' : 'to which recipients or categories of recipients the data has been or will be disclosed,'}</li>
                      <li>{isDE ? 'wie lange die Daten gespeichert werden oder nach welchen Kriterien diese Dauer bestimmt wird,' : 'how long the data will be stored or according to which criteria this period is determined,'}</li>
                      <li>{isDE ? 'welche Rechte Ihnen im Zusammenhang mit der Verarbeitung zustehen,' : 'what rights you have in connection with the processing,'}</li>
                      <li>{isDE ? 'ob die Daten nicht direkt bei Ihnen erhoben wurden und aus welcher Quelle sie stammen,' : 'whether the data was not collected directly from you and from which source it originates,'}</li>
                      <li>{isDE ? 'ob eine automatisierte Entscheidungsfindung stattfindet.' : 'whether automated decision-making takes place.'}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'DSGVO, Art. 16 – Recht auf Berichtigung' : 'GDPR, Art. 16 – Right to Rectification'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Sie haben das Recht, vom Verantwortlichen unverzüglich die Berichtigung Sie betreffender unrichtiger personenbezogener Daten zu verlangen.'
                        : 'You have the right to request the controller to rectify inaccurate personal data concerning you without undue delay.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Darüber hinaus haben Sie unter Berücksichtigung der Zwecke der Verarbeitung das Recht, die Vervollständigung unvollständiger personenbezogener Daten zu verlangen.'
                        : 'Furthermore, taking into account the purposes of the processing, you have the right to request the completion of incomplete personal data.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'DSGVO, Art. 17 – Recht auf Löschung („Recht auf Vergessenwerden")' : 'GDPR, Art. 17 – Right to Erasure ("Right to be Forgotten")'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Unter bestimmten Voraussetzungen haben Sie das Recht, vom Verantwortlichen zu verlangen, dass Sie betreffende personenbezogene Daten unverzüglich gelöscht werden, insbesondere wenn:'
                        : 'Under certain conditions, you have the right to request the controller to erase personal data concerning you without undue delay, in particular if:'}
                    </p>
                    <ul className="ml-6 space-y-1 text-base text-muted-foreground list-disc mt-2">
                      <li>{isDE ? 'die personenbezogenen Daten für die Zwecke nicht mehr notwendig sind,' : 'the personal data is no longer necessary for the purposes,'}</li>
                      <li>{isDE ? 'Sie Ihre Einwilligung widerrufen haben,' : 'you have withdrawn your consent,'}</li>
                      <li>{isDE ? 'Sie Widerspruch gegen die Verarbeitung eingelegt haben,' : 'you have objected to the processing,'}</li>
                      <li>{isDE ? 'die Daten unrechtmäßig verarbeitet wurden,' : 'the data was processed unlawfully,'}</li>
                      <li>{isDE ? 'eine gesetzliche Löschpflicht besteht.' : 'a legal obligation to delete exists.'}</li>
                    </ul>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Das Recht auf Löschung besteht nicht, soweit gesetzliche Aufbewahrungspflichten entgegenstehen.'
                        : 'The right to erasure does not exist insofar as legal retention obligations prevent this.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'DSGVO, Art. 18 – Recht auf Einschränkung der Verarbeitung' : 'GDPR, Art. 18 – Right to Restriction of Processing'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Unter bestimmten Voraussetzungen haben Sie das Recht, vom Verantwortlichen die Einschränkung der Verarbeitung zu verlangen.'
                        : 'Under certain conditions, you have the right to request the controller to restrict the processing.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Dies bedeutet, dass Ihre Daten – abgesehen von ihrer Speicherung – nur noch eingeschränkt verarbeitet werden dürfen.'
                        : 'This means that your data – apart from its storage – may only be processed in a limited manner.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'DSGVO, Art. 20 – Recht auf Datenübertragbarkeit' : 'GDPR, Art. 20 – Right to Data Portability'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie dem Verantwortlichen bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.'
                        : 'You have the right to receive the personal data concerning you that you have provided to the controller in a structured, commonly used and machine-readable format.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Sie haben außerdem das Recht, diese Daten einem anderen Verantwortlichen zu übermitteln.'
                        : 'You also have the right to transmit this data to another controller.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'DSGVO, Art. 21 – Recht auf Widerspruch' : 'GDPR, Art. 21 – Right to Object'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Widerspruch einzulegen, sofern diese auf Art. 6 Abs. 1 lit. e oder f DSGVO beruht.'
                        : 'You have the right to object at any time, on grounds relating to your particular situation, to the processing if it is based on Art. 6 (1) lit. e or f GDPR.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'Beschwerderecht bei einer Aufsichtsbehörde' : 'Right to Lodge a Complaint with a Supervisory Authority'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.'
                        : 'You have the right to lodge a complaint with a data protection supervisory authority if you believe that the processing of your personal data violates the GDPR.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE ? 'Zuständig ist insbesondere:' : 'The competent authority is in particular:'}
                    </p>
                    <div className="ml-0 mt-2 space-y-1">
                      <p className="text-base font-medium text-foreground">
                        {isDE
                          ? 'Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen'
                          : 'State Commissioner for Data Protection and Freedom of Information North Rhine-Westphalia'}
                      </p>
                      <p className="text-base text-muted-foreground">Postfach 20 04 44</p>
                      <p className="text-base text-muted-foreground">
                        {isDE ? '40102 Düsseldorf' : '40102 Düsseldorf, Germany'}
                      </p>
                      <p className="text-base text-muted-foreground">
                        {isDE ? 'E-Mail: ' : 'Email: '}
                        <a href="mailto:poststelle@ldi.nrw.de" className="text-foreground hover:text-muted-foreground underline transition-colors">poststelle@ldi.nrw.de</a>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'Hinweis zur Zuordnung Ihrer Daten' : 'Note on Identification of Your Data'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Ihre Datenschutzrechte können nur erfüllt werden, wenn wir die Daten eindeutig Ihrer Person zuordnen können.'
                        : 'Your data protection rights can only be fulfilled if we can clearly assign the data to your person.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Dies ist z. B. möglich, wenn Sie ein Nutzerkonto besitzen oder freiwillig Kontaktdaten angegeben haben.'
                        : 'This is possible, for example, if you have a user account or have voluntarily provided contact data.'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Bei vollständig anonymen Meldungen ist eine Zuordnung in der Regel nicht möglich.'
                        : 'For completely anonymous reports, assignment is generally not possible.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'Ausübung Ihrer Rechte' : 'Exercising Your Rights'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Zur Ausübung Ihrer Datenschutzrechte genügt eine formlose Mitteilung an:'
                        : 'To exercise your data protection rights, an informal notification is sufficient:'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      <a href="mailto:mendigo@rmsoftware.de" className="text-foreground hover:text-muted-foreground underline transition-colors">mendigo@rmsoftware.de</a>
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Wir bearbeiten Ihr Anliegen unverzüglich im gesetzlichen Rahmen.'
                        : 'We will process your request promptly within the legal framework.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isDE ? 'Weiterführende Informationen' : 'Further Information'}
                    </h3>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? 'Alle Ihre Datenschutzrechte im Detail können Sie unter den oben genannten Artikeln in der Datenschutz-Grundverordnung (DSGVO) nachlesen.'
                        : 'You can read all your data protection rights in detail under the above-mentioned articles in the General Data Protection Regulation (GDPR).'}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">
                      {isDE
                        ? <>Den vollständigen Gesetzestext finden Sie unter folgendem offiziellen Link der Europäischen Union:{' '}<a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679#d1e40-1-1" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline transition-colors break-all">https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679</a></>
                        : <>The complete legal text can be found at the following official link of the European Union:{' '}<a href="https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-muted-foreground underline transition-colors break-all">https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679</a></>}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '16. Sicherheit' : '16. Security'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Wir setzen technische und organisatorische Maßnahmen gemäß Art. 32 DSGVO ein.'
                  : 'We implement technical and organizational measures in accordance with Art. 32 GDPR.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '17. Minderjährige' : '17. Minors'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Unsere Dienste richten sich nicht an Personen unter 16 Jahren.'
                  : 'Our services are not directed at persons under 16 years of age.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {isDE ? '18. Schlussbemerkung' : '18. Final Remarks'}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isDE
                  ? 'Wir verkaufen keine personenbezogenen Daten und nutzen sie nicht zu Werbezwecken ohne Einwilligung.'
                  : 'We do not sell personal data and do not use it for advertising purposes without consent.'}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
