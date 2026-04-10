/**
 * =============================================================================
 * TRANSLATIONS - Internationalization (i18n) Content
 * =============================================================================
 * 
 * Contains all translatable text content for the application.
 * Supports German (de) and English (en) languages.
 * 
 * Structure:
 * - Organized by page section (nav, hero, features, etc.)
 * - Each section has the same keys in both languages
 * - Access via useTranslation(language).t.section.key
 * 
 * Usage:
 * ```tsx
 * const { language } = useLanguage();
 * const { t } = useTranslation(language);
 * return <h1>{t.hero.title}</h1>;
 * ```
 * 
 * Adding New Translations:
 * 1. Add key to both 'de' and 'en' objects
 * 2. Keep the same nesting structure
 * 3. Use descriptive keys (e.g., hero.cta, not hero.btn1)
 * =============================================================================
 */

export const translations = {
  de: {
    // Navigation
    nav: {
      home: 'Start',
      features: 'Funktionen',
      benefits: 'Vorteile',
      testimonials: 'Referenzen',
      industries: 'Branchen',
      pricing: 'Preise',
      contact: 'Kontakt',
      login: 'Anmelden',
      tryFree: 'Kostenlos testen'
    },
    // Hero Section
    hero: {
      title: 'Intelligentes Facility Management',
      subtitle: 'Schluss mit Chaos - Unser intelligentes Meldesystem verwandelt Probleme in klare Abläufe und sorgt für neue Effizienz.',
      cta: 'Kostenlos testen',
      learnMore: 'Mehr erfahren'
    },
    // Features
    features: {
      badge: 'LEISTUNGSSTARKE FUNKTIONEN',
      title: 'Bringen Sie Struktur in alle Prozesse Ihrer Instandhaltung',
      subtitle: 'Transformieren Sie Ihre Gebäudeverwaltung mit unserer Facility Management Software. Erleben Sie nahtlose Abläufe und messbaren ROI.',
      instantReporting: {
        title: 'Sofortige Problemmeldung',
        description: 'Ermöglichen Sie den automatischen Übergang von der Problemerkennung zur Lösung – mit personalisierten QR-Code-Workflows.',
        metric: 'Schnellere Reaktionszeiten'
      },
      smartWorkflow: {
        title: 'Intelligentes Workflow-Management',
        description: 'Optimieren Sie Ihre Abläufe mit automatischer Ticket-Erstellung, intelligenter Zuweisung und umfassendem Tracking von der Meldung bis zur Lösung.',
        features: [
          'Automatische Ticket-Erstellung',
          'Intelligente Aufgabenzuweisung',
          'Prioritätsbasierte Filterung',
          'Echtzeit-Benachrichtigungen'
        ],
        metric: 'Effizienz'
      },
      assetManagement: {
        badge: 'UMFASSENDE NACHVERFOLGUNG',
        title: 'Asset Management Software',
        subtitle: 'Ihr Weg im Facility Management',
        description: 'Umfassende Monitoring- und Steuerungs-Tools schaffen volle Transparenz über Ihre Wartungsprozesse.',
        features: [
          'Gebäude- & Raumverwaltung',
          'Geräte-Tracking',
          'Asset-Ticket-Verknüpfung',
          'Wartungshistorie'
        ],
        dashboard: {
          liveLabel: 'Live-Dashboard',
          building: 'Gebäude A-2',
          total: 'Gesamt',
          active: 'Aktiv',
          issues: 'Störungen'
        }
      }
    },
    // Status Quo Comparison
    statusQuo: {
      badge: 'TRANSFORMATION',
      title: 'Befreien Sie sich vom Status Quo',
      subtitle: 'Schon mal das Gefühl gehabt, die Kaffeemaschine hat es persönlich auf Sie abgesehen? Keine Panik – das liegt nicht an Ihnen. Willkommen in der alten Welt der Instandhaltung. Zeit für ein Upgrade. Mendigo bringt Instandhaltung ins 21. Jahrhundert.',
      problemReporting: {
        category: 'Störungsmeldung',
        traditional: {
          title: 'Traditionelle Methode',
          description: 'Telefonate, E-Mails, Papierformulare',
          problems: [
            'Meldungen gehen verloren oder werden vergessen',
            'Keine visuelle Dokumentation',
            'Unklare Ortsbeschreibungen',
            'Zeitaufwändiger manueller Prozess'
          ],
          timeToReport: '5–15 Minuten',
          accuracy: '60%'
        },
        mendigo: {
          title: 'Mendigo-Methode',
          description: 'QR-Code-Sofortmeldung',
          benefits: [
            'Sofortige digitale Übermittlung',
            'Fotonachweis inklusive',
            'Automatische Standorterkennung',
            '30-Sekunden-Meldeverfahren'
          ],
          timeToReport: '30 Sekunden',
          accuracy: '99%'
        }
      },
      taskManagement: {
        category: 'Aufgabenverwaltung',
        traditional: {
          title: 'Tabellen & Whiteboards',
          description: 'Manuelle Verfolgungssysteme',
          problems: [
            'Keine Echtzeit-Updates',
            'Versionskontrollprobleme',
            'Begrenzte Zusammenarbeit',
            'Manuelle Statusverfolgung'
          ],
          efficiency: 'Begrenzt',
          visibility: 'Schlecht'
        },
        mendigo: {
          title: 'Automatisierte Workflows',
          description: 'Intelligente Aufgabenverwaltung',
          benefits: [
            'Echtzeit-Statusupdates',
            'Automatisierte Zuweisungen',
            'Vollständige Teamzusammenarbeit',
            'Fortschrittsverfolgung'
          ],
          efficiency: '95% Verbesserung',
          visibility: 'Vollständige Transparenz'
        }
      },
      communication: {
        category: 'Kommunikation',
        traditional: {
          title: 'Telefon-Pingpong & E-Mails',
          description: 'Fragmentierte Kommunikation',
          problems: [
            'Informationssilos',
            'Verzögerte Antworten',
            'Kontextverlust',
            'Keine zentrale Historie'
          ],
          responseTime: '2-24 Stunden',
          contextRetention: 'Niedrig'
        },
        mendigo: {
          title: 'Einheitliche Plattform',
          description: 'Zentraler Kommunikations-Hub',
          benefits: [
            'Alle Infos an einem Ort',
            'Sofortige Benachrichtigungen',
            'Vollständige Gesprächshistorie',
            'Rich-Media-Freigabe'
          ],
          responseTime: 'Unter 2 Minuten',
          contextRetention: '100%'
        }
      },
      impactSummary: {
        title: 'Kennzahlen die Überzeugen',
        metrics: {
          reportingTime: {
            title: '30 Sekunden Meldezeit',
            description: 'Probleme melden war noch nie so einfach. Mit einem QR-Code-Scan ist die Störung erfasst - keine Anrufe, kein Papierkram, keine Wartezeit.'
          },
          resolution: {
            title: '10x schneller zur Lösung',
            description: 'Intelligente Priorisierung und automatische Zuweisung sorgen dafür, dass kritische Probleme sofort bearbeitet werden - statt tagelang zu warten.'
          },
          costs: {
            title: '30% weniger Kosten',
            description: 'Durch optimierte Prozesse und weniger Leerläufe reduzieren sich die Kosten pro Wartungsvorgang dramatisch - mehr Budget für wichtige Investitionen.'
          }
        }
      }
    },
    // Benefits
    benefits: {
      badge: 'IHRE VORTEILE',
      title: 'Funktionen, die einfach Sinn ergeben',
      subtitle: 'Erleben Sie messbare Effizienz mit unserer Gebäudemanagement Software. Senken Sie Kosten durch digitales Mängelmanagement und optimierte Gebäudeverwaltung.',
      keyBenefits: [
        {
          title: 'Sofortige QR-Code-Meldungen',
          description: 'Scannen, melden und verfolgen Sie Facility-Probleme in Sekunden mit mobil-optimierten Workflows.'
        },
        {
          title: 'Zentrale Asset Verwaltung',
          description: 'Greifen Sie mit unserer Software für Assetmanagement auf eine vollständige Liste aller Anlagen zu – keine verstreuten Datensätze oder Verwirrung mehr.'
        },
        {
          title: 'Aufgaben Management',
          description: 'Verwalten Sie alle Aufgaben im übersichtlichen Kanban-Board mit Live-Status und vollständiger Nachverfolgung.'
        },
        {
          title: 'Präventive Wartung',
          description: 'Planen Sie Wartungsarbeiten proaktiv und vermeiden Sie kostspielige Ausfälle durch intelligente Wartungszyklen.'
        },
        {
          title: 'Dokumentenverwaltung',
          description: 'Zentrale Speicherung und Verwaltung aller Dokumente, Pläne und Handbücher mit einfacher Suchfunktion.'
        },
        {
          title: 'Smart Insights',
          description: 'Datengetriebene Analysen und Berichte für optimierte Entscheidungen und kontinuierliche Verbesserungen.'
        }
      ],
      additionalBenefits: [
        {
          title: 'Erweiterte Sicherheit',
          description: 'AWS-Hosting in Deutschland mit rollenbasierter Benutzer- und Rechteverwaltung im Mendigo-System.'
        },
        {
          title: 'Mobile First',
          description: 'Vollständig responsives Design optimiert für Mobilgeräte und mobiles Facility Management mit unserer Hausmeister App im App Store und bei Google Play.'
        },
        {
          title: 'Datengesteuerte Erkenntnisse',
          description: 'Treffen Sie fundierte Entscheidungen mit umfassenden Analysen und Leistungsverfolgung.'
        }
      ],
      stats: {
        fasterResponse: 'Schnellere Reaktionszeiten',
        reducedCosts: 'Kostensenkung',
        higherEfficiency: 'Höhere Effizienz',
        betterSatisfaction: 'Benutzerzufriedenheit'
      },
      roiCalculator: {
        badge: 'BERECHNEN SIE IHRE EINSPARUNGEN',
        title: 'ROI-Rechner',
        subtitle: 'Entdecken Sie Ihre potenziellen Einsparungen mit unserem interaktiven Rechner. Passen Sie die Parameter an Ihre Einrichtung an und sehen Sie sofortige Ergebnisse.',
        adjustParameters: 'Passen Sie Ihre Parameter an',
        buildings: 'Anzahl Gebäude',
        employees: 'Mitarbeiter im Facility-Bereich',
        hoursPerTicket: 'Gesparte Zeit pro Ticket',
        ticketsPerMonth: 'Tickets pro Monat',
        ticketsPerMonthPerBuilding: 'Tickets pro Monat (pro Gebäude)',
        travelTimePerTicket: 'Eingesparte Fahrtzeit pro Monat',
        timeSavedTooltipTitle: 'Wie wird Zeit gespart?',
        timeSavedTooltip1: 'Schnellere Kommunikation durch digitale Meldungen',
        timeSavedTooltip2: 'Alle Unterlagen und Historien an einem Platz',
        timeSavedTooltip3: 'Automatische Zeit- und Material-Dokumentation',
        timeSavedTooltip4: 'Keine doppelte Dateneingabe mehr nötig',
        travelTimeTooltipTitle: 'Wie wird Fahrtzeit gespart?',
        travelTimeTooltip: 'Durch klare Problemdokumentation inkl. Fotos wissen Techniker vorab, was sie erwartet. Keine unnötigen Blindfahrten mehr.',
        hourlyRate: 'Stundensatz (€)',
        yourResults: 'Ihre Ergebnisse',
        calculation: 'Berechnung',
        platformCosts: 'Plattformkosten',
        month: 'Monat',
        totalTickets: 'Gesamt-Tickets',
        baseSavings: 'Basis-Ersparnis',
        travelSavings: 'Fahrtzeit-Ersparnis',
        individual: 'Individuell',
        contactSales: 'Vertrieb kontaktieren',
        results: {
          monthlySavings: 'Monatliche Einsparungen',
          annualSavings: 'Jährliche Einsparungen',
          platformCostsAnnual: 'Plattformkosten (Jährlich)',
          netAnnualSavings: 'Netto-Jahreseinsparungen',
          paybackTime: 'Amortisationszeit: Sofort (Keine Vorabkosten)'
        },
        saveNow: 'Jetzt sparen',
        freeTrial: '14-tägige kostenlose Testphase',
        calculationFormula: 'Mitarbeitende',
        hours: 'Std.',
        tickets: 'Tickets',
        netSavings: 'Netto-Einsparungen'
      }
    },
    // Industries
    industries: {
      badge: 'BRANCHEN',
      title: 'Ein System – Vorteile für jede Branche',
      subtitle: 'Entdecken Sie, wie Mendigo Ihre größten Probleme löst und messbare Verbesserungen erzielt.',
      solutionHeadline: 'So lösen wir Ihre größten Probleme:',
      problemLabel: 'Problem:',
      solutionLabel: 'Lösung:',
      freeDemoButton: 'Kostenlose Demo für',
      requestDemoMobile: 'Demo anfordern',
      propertyManagement: {
        title: 'Hausverwaltungen',
        shortTitle: 'Hausverwaltung',
        category: 'Immobilien',
        headline: 'Schluss mit verlorenen Meldungen und unzufriedenen Mietern',
        description: 'Verwandeln Sie chaotische Kommunikation in einen reibungslosen digitalen Workflow.',
        painPoints: [
          {
            problem: 'Mietermeldungen gehen per E-Mail und Telefon verloren',
            solution: 'QR-Code-Meldungen mit automatischer Weiterleitung und Bestätigung',
            metric: '95% weniger verlorene Meldungen'
          },
          {
            problem: 'Handwerker-Koordination dauert Stunden mit zig Telefonaten',
            solution: 'Automatische Benachrichtigungen mit allen Details und Fotos',
            metric: '3x schnellere Handwerker-Einsätze'
          },
          {
            problem: 'Eigentümer verlangen ständig Updates zu Reparaturen',
            solution: 'Transparente Dokumentation mit Live-Status für alle Beteiligten',
            metric: '80% weniger Rückfragen'
          }
        ]
      },
      cleaning: {
        title: 'Hausmeister- & Reinigungsservice',
        shortTitle: 'Hausmeisterdienst',
        category: 'Dienstleistung',
        headline: 'Die Hausmeister App für professionelle Qualitätskontrolle',
        description: 'Dokumentieren Sie Ihre Arbeit lückenlos mit unserer Hausmeisterapp und steigern Sie die Kundenzufriedenheit.',
        painPoints: [
          {
            problem: 'Kunden beschweren sich über nicht erledigte Aufgaben',
            solution: 'Mobile Checklisten mit Foto-Nachweis für jede Tätigkeit',
            metric: '90% weniger Beschwerden'
          },
          {
            problem: 'Mitarbeiter vergessen Aufgaben oder arbeiten ineffizient',
            solution: 'Digitale Aufgabenlisten mit Zeiterfassung',
            metric: '25% höhere Produktivität'
          },
          {
            problem: 'Notfälle werden zu spät erkannt und bearbeitet',
            solution: 'Sofortige Push-Benachrichtigungen für kritische Meldungen',
            metric: '10x schnellere Reaktion'
          }
        ]
      },
      hotels: {
        title: 'Hotels',
        shortTitle: 'Hotels',
        category: 'Gastgewerbe',
        headline: 'Perfekte Gästeerfahrung durch blitzschnelle Problemlösung',
        description: 'Verwandeln Sie Gästebeschwerden in Wow-Momente durch sofortige Reaktion.',
        painPoints: [
          {
            problem: 'Gäste warten stundenlang auf Reparaturen und bewerten schlecht',
            solution: 'QR-Codes in jedem Zimmer für Sofort-Meldungen mit Priorität',
            metric: '5x schnellere Problemlösung'
          },
          {
            problem: 'Housekeeping übersieht Defekte bei der Zimmerreinigung',
            solution: 'Integrierte Checklisten mit sofortiger Meldung an Technik',
            metric: '85% weniger übersehene Defekte'
          },
          {
            problem: 'Nachtschicht kann Notfälle nicht adäquat weiterleiten',
            solution: '24/7 System mit automatischer Eskalation je nach Problem',
            metric: '100% Verfügbarkeit'
          }
        ]
      },
      sports: {
        title: 'Sportstätten',
        shortTitle: 'Sportstätten',
        category: 'Sport & Freizeit',
        headline: 'Sicherheit first – Defekte kosten Reputation',
        description: 'Mit Mendigo melden Spieler, Mitarbeiter und Besucher Probleme schneller als ein Schiri-Pfiff.',
        painPoints: [
          {
            problem: 'Beschädigte Sportgeräte gefährden Nutzer',
            solution: 'Digitale Prüfprotokolle mit Fotodokumentation',
            metric: '100% Haftungsschutz durch Nachweise'
          },
          {
            problem: 'Wartungsteams erhalten Meldungen zu spät',
            solution: 'QR-Scanning mit automatischer Weiterleitung',
            metric: '10x schnellere Reaktionszeiten'
          },
          {
            problem: 'Subdienstleister arbeiten unkoordiniert',
            solution: 'Zentrales Dashboard mit Rollen & Zuständigkeiten',
            metric: 'Weniger Funkchaos, mehr Übersicht'
          }
        ]
      },
      healthcare: {
        title: 'Krankenhäuser & Pflegeheime',
        shortTitle: 'Gesundheitswesen',
        category: 'Gesundheitswesen',
        headline: 'Compliance und Sicherheit – kein Raum für Fehler',
        description: 'Erfüllen Sie höchste Standards mit lückenloser Dokumentation.',
        painPoints: [
          {
            problem: 'Dokumentations-Chaos raubt Zeit für die Pflege',
            solution: 'Digitale Meldung in Sekunden bedeutet mehr Zeit für Patienten',
            metric: '25% mehr Zeit für Pflege'
          },
          {
            problem: 'Überlastete Haustechnik durch Fehlkommunikation',
            solution: 'Zentrales Ticket-System mit klarer Priorisierung',
            metric: '30% schnellere Fehlerbehebung'
          },
          {
            problem: 'Doppelte Arbeit durch mangelnde Absprache',
            solution: 'Echtzeit-Status für alle verhindert teure Doppel-Beauftragungen',
            metric: '15% weniger Betriebskosten'
          }
        ]
      }
    },
    // Testimonials
    testimonials: {
      badge: 'KUNDENERFOLG',
      title: 'Was unsere Kunden sagen',
      testimonials: [
        {
          name: 'Sarah M.',
          title: 'Facility-Managerin',
          company: 'TechnoSoft Deutschland GmbH',
          quote: 'Mendigo hat unseren Umgang mit Facility-Themen vollkommen verändert. Die Reaktionszeiten des gesamten Teams haben sich drastisch verbessert.',
          metrics: '65% schnellere Reaktionszeiten'
        },
        {
          name: 'Marcus W.',
          title: 'Betriebsleiter',
          company: 'Hahn Kunststofftechnik GmbH',
          quote: 'Das QR-Code-System ist genial. Jeder kann Probleme sofort melden und der automatisierte Workflow stellt sicher, dass nichts übersehen wird.',
          metrics: '20.000€ jährliche Einsparungen'
        },
        {
          name: 'Timo R.',
          title: 'Leiter Facility Management',
          company: 'Innotech Solutions',
          quote: 'Das detaillierte Dashboard verschafft uns wertvolle Insights und die präventive Wartung verhindert Geräteausfälle.',
          metrics: '20% weniger Ausfallzeiten'
        }
      ]
    },
    // QR Demo
    qrDemo: {
      badge: 'QR-CODE-INNOVATION',
      title: 'Reporting so einfach – fast wie',
      titleHighlight: 'Magie',
      subtitle: 'Melden Sie Ihre Störungen mit einem einfachen Scan. Keine App-Installation erforderlich, keine Schulung nötig.',
      steps: [
        {
          title: 'QR-Codes generieren & platzieren',
          description: 'Erstellen Sie individuelle QR-Codes für Ihre Gebäude, Räume, Anlagen oder Geräte. Alternativ können Meldungen auch direkt per Standorterkennung übermittelt werden – ganz ohne QR-Code.'
        },
        {
          title: 'Scannen & Probleme melden',
          description: 'Mitarbeiter & Besucher scannen die Codes, um sofort auf zugewiesene Formulare zuzugreifen und Probleme zu melden. Keine App notwendig.'
        },
        {
          title: 'Automatische Ticket-Erstellung',
          description: 'Probleme werden automatisch mit Standortdaten im System erfasst und können den entsprechenden Teams zugewiesen werden.'
        }
      ],
      liveDemo: {
        title: 'Live-Demo ansehen',
        descriptionLine1: 'Sehen Sie, wie Facility-Teams die Meldezeit mit Mendigo von 15 Minuten',
        descriptionLine2: 'auf 30 Sekunden reduzieren.',
        button: 'Demo buchen',
        qrDescriptionPart1: 'Scannen oder ',
        qrDescriptionLink: 'klicken',
        qrDescriptionPart2: ' für ein Demo-Formular'
      }
    },
    // Dashboard Preview
    dashboard: {
      badge: 'INTELLIGENTES DASHBOARD',
      title: 'Doch das war vor',
      titleHighlight: 'Mendigo',
      subtitle: 'Machen Sie Augen und Ohren zu Ihren stärksten Sensoren. Mendigo vernetzt Besucher, Personal und Dienstleister auf einer intuitiven Plattform – für eine nahtlose und effiziente Zusammenarbeit.',
      viewToggle: {
        analytics: 'Analytics-Dashboard',
        board: 'Aufgaben-Board',
        issues: 'Meldungen'
      },
      sidebar: {
        menu: 'MENÜ',
        problems: 'Probleme',
        board: 'Board',
        tasks: 'Aufgaben',
        rooms: 'Räume',
        assets: 'Anlagen',
        documents: 'Dokumente',
        insights: 'Einblicke',
        qrCodes: 'QR-Codes',
        organization: 'Organisation',
        helpSupport: 'Hilfe & Support'
      },
      content: {
        insightsTitle: 'Einblicke',
        stats: {
          toDo: 'Zu erledigen',
          inProgress: 'In Bearbeitung',
          completed: 'Erledigt',
          dueToday: 'Fällig heute',
          overdue: 'Überfällig',
          vsLastMonth: '2 gegenüber dem Vormonat',
          lastWeek: 'Letzte Woche'
        },
        charts: {
          openTasksByPriority: 'Offene Aufgaben nach Priorität',
          highPriorityTicketsByMember: 'Hochprioritäts-Tickets nach Mitglied',
          activityByUser: 'Aktivität nach Benutzer',
          tasksByCategory: 'Aufgaben nach Kategorie',
          tasksByPriority: 'Aufgaben nach Priorität'
        },
        tabs: {
          overview: 'Übersicht',
          spaces: 'Räume',
          areas: 'Bereiche',
          assets: 'Anlagen',
          users: 'Benutzer',
          categories: 'Kategorien',
          category: 'Kategorie',
          groups: 'Gruppen'
        },
        insights: {
          export: 'Exportieren',
          allBuildings: 'Alle Gebäude',
          overall: 'Gesamt',
          lastMonth: 'Letzter Monat',
          lastWeek: 'Letzte Woche',
          search: 'Suchen...',
          name: 'Name',
          building: 'Gebäude',
          totalTickets: 'Gesamt-Tickets',
          lowPriority: 'Niedrige Priorität',
          mediumPriority: 'Mittlere Priorität',
          highPriority: 'Hohe Priorität',
          noPriority: 'Keine Priorität',
          loggedCost: 'Erfasste Kosten',
          loggedCosts: 'Erfasste Kosten',
          loggedTime: 'Erfasste Zeit',
          member: 'Mitglied',
          currentlyAssignedTo: 'Aktuell zugewiesen',
          group: 'Anlagengruppe',
          category: 'Kategorie',
          user: 'Benutzer',
          tasksTotal: 'Aufgaben (gesamt)',
          taskCountTotal: 'Aufgabenanzahl (gesamt)',
          noSpacesFound: 'Keine Räume gefunden',
          noAssetsFound: 'Keine Anlagen gefunden',
          noUsersFound: 'Keine Benutzer gefunden',
          noCategoriesFound: 'Keine Kategorien gefunden',
          noGroupsFound: 'Keine Gruppen gefunden',
          noHighPriorityTickets: 'Keine Hochprioritäts-Tickets zugewiesen',
          noUserActivity: 'Keine Benutzeraktivitätsdaten verfügbar',
          noCategoryData: 'Keine Kategoriedaten verfügbar',
          exportSuccess: 'Einblicke erfolgreich exportiert',
          exportError: 'Export der Einblicke fehlgeschlagen',
          high: 'Hoch',
          medium: 'Mittel',
          low: 'Niedrig',
        },
        categories: {
          electrical: 'Elektro',
          plumbing: 'Sanitär',
          hvac: 'HLK',
          security: 'Sicherheit',
          maintenance: 'Wartung'
        },
        board: {
          title: 'Board',
          tabs: {
            allTasks: 'Alle Aufgaben',
            myTasks: 'Meine Aufgaben',
            highPrio: 'Hohe Priorität'
          },
          columns: {
            toDo: 'ZU ERLEDIGEN',
            inProgress: 'IN BEARBEITUNG',
            done: 'ERLEDIGT'
          },
          createButton: 'Erstellen',
          searchPlaceholder: 'Suchen...',
          floor: 'Etage',
          basement: 'Untergeschoss',
          lobby: 'Lobby',
          completed: 'Abgeschlossen'
        },
        issues: {
          title: 'Gemeldete Störungen',
          tabs: {
            newIssues: 'Neue Störungen',
            accepted: 'Akzeptiert',
            declined: 'Abgelehnt'
          },
          sortBy: 'Sortieren',
          accept: 'Akzeptieren',
          decline: 'Ablehnen'
        }
      },
      cursors: {
        visitor: 'Besucherin Anna',
        technician: 'Techniker Max',
        manager: 'Sarah (Managerin)'
      }
    },
    // Blog
    blog: {
      badge: 'AUS UNSEREM BLOG',
      title: 'Neueste Erkenntnisse & Updates',
      subtitle: 'Bleiben Sie informiert über die neuesten Trends im Facility Management, Technologie-Einblicke und Best Practices von Branchenexperten.',
      posts: [
        {
          category: 'Strategie',
          title: '5 Schlüsselstrategien für modernes Facility Management',
          description: 'Entdecken Sie bewährte Strategien, die führende Unternehmen im Facility Management zur Optimierung ihrer Betriebsabläufe, Kostensenkung und Verbesserung der Mieterzufriedenheit einsetzen.',
          readTime: '5 Min. Lesezeit'
        },
        {
          category: 'Technologie',
          title: 'QR-Codes: Die Zukunft der Störungsmeldungen im Facility Management',
          description: 'Erfahren Sie, wie QR-Code-Technologie die Instandhaltung und Störungsmeldungen im Facility Management branchenweit revolutioniert.',
          readTime: '3 Min. Lesezeit'
        },
        {
          category: 'ROI',
          title: 'ROI-Maximierung durch präventive Instandhaltung',
          description: 'Verstehen Sie, wie präventive Instandhaltungsprogramme Kosten erheblich senken und die Lebensdauer von Anlagen verlängern können.',
          readTime: '7 Min. Lesezeit'
        }
      ],
      moreArticles: 'Weitere Artikel'
    },
    // FAQ
    faq: {
      badge: 'HÄUFIGE FRAGEN',
      title: 'Fragen zu Mendigo',
      subtitle: '',
      items: [
        {
          question: 'Wie schnell ist Mendigo einsatzbereit?',
          answer: 'Die meisten Einrichtungen nutzen Mendigo innerhalb von 24-48 Stunden produktiv. Unser Team unterstützt Sie beim Onboarding und der QR-Code-Generierung.'
        },
        {
          question: 'Kann ich bestehende Daten importieren?',
          answer: 'Ja, per Excel-Liste können alle Räume und Anlagen Ihrer Gebäude schnell importiert werden. So sparen Sie Zeit bei der Einrichtung und können sofort mit Ihren bestehenden Daten arbeiten.'
        },
        {
          question: 'Können externe Dienstleister Zugang bekommen?',
          answer: 'Ja, mit unserer rollenbasierten Benutzerverwaltung können Zugänge per E-Mail vergeben werden. So können Sie Handwerkern, Reinigungsfirmen oder anderen externen Partnern einfach Zugriff auf relevante Bereiche erteilen.'
        },
        {
          question: 'Funktioniert Mendigo auch offline?',
          answer: 'Ja, unsere Smartphone App funktioniert auch offline. Sie können Mängel erfassen und Aufgaben bearbeiten, auch wenn keine Internetverbindung besteht. Sobald Sie wieder online sind, synchronisiert die App automatisch alle Änderungen.'
        },
        {
          question: 'Gibt es Schulungen für mein Team?',
          answer: 'Wir bieten gerne Onboarding-Termine an, um Sie bei der Einrichtung zu unterstützen. Unser Team zeigt Ihnen alle Funktionen und beantwortet Ihre Fragen – damit Sie schnell produktiv arbeiten können.'
        },
        {
          question: 'Funktioniert Mendigo auf Mobilgeräten?',
          answer: 'Absolut! Mendigo ist als Mobile-First konzipiert. Der gesamte Meldevorgang ist ohne App-Installation möglich. Einfach QR-Codes scannen, im Web-Browser das Problem melden, fertig. Zusätzlich bieten wir für alle Team Mitglieder (Techniker, Handwerker etc.) native Apps für iOS und Android im App Store und bei Google Play.'
        },
        {
          question: 'Gibt es eine kostenlose Testphase?',
          answer: 'Ja, Sie können Mendigo 14 Tage lang kostenlos und unverbindlich testen. In dieser Zeit haben Sie vollen Zugriff auf alle Funktionen und können das System mit Ihrem Team ausprobieren – ohne Kreditkarte oder versteckte Kosten.'
        },
        {
          question: 'Wo werden meine Daten gespeichert?',
          answer: 'Alle Daten werden auf AWS-Servern in Deutschland gespeichert und unterliegen damit den strengen deutschen Datenschutzgesetzen und der DSGVO.'
        },
        {
          question: 'Kommen weitere Kosten auf mich zu?',
          answer: 'Nein, unsere Preise sind vollständig transparent. Es gibt keine versteckten Kosten für Onboarding, Schulungen, Support oder Updates. Der angezeigte Preis ist der Preis, den Sie zahlen – ohne Überraschungen.'
        },
        {
          question: 'Wie vereinfacht Mendigo das Melden von Mängeln?',
          answer: 'Mendigo ist mobil optimiert und über jeden Browser zugänglich. Mitarbeiter und Besucher scannen einfach einen QR-Code und können Probleme in unter 30 Sekunden mit Fotos melden – ganz ohne App-Installation. Das digitale Mängelmanagement ersetzt Telefonate und E-Mails vollständig.'
        },
        {
          question: 'Wie unterstützt Mendigo Hausmeister im Alltag?',
          answer: 'Als Hausmeister App im App Store und bei Google Play bietet Mendigo mobile Checklisten, Foto-Dokumentation und Echtzeit-Benachrichtigungen. Die Hausmeisterapp funktioniert auf jedem Smartphone und hilft bei der Priorisierung von Aufgaben, Zeiterfassung und lückenloser Nachweisdokumentation.'
        },
        {
          question: 'Welche Wartungsaufgaben kann ich mit Mendigo verwalten?',
          answer: 'Mendigo ist eine vollständige Wartungssoftware für digitale Wartung und präventives Wartungsmanagement. Sie können wiederkehrende Wartungszyklen planen, Wartungshistorien dokumentieren und mit unserer Wartungsmanagement Software alle Instandhaltungsprozesse zentral steuern.'
        },
        {
          question: 'Wie hilft Mendigo bei der Gebäudeverwaltung?',
          answer: 'Verwalten Sie mehrere Gebäude, Räume und Anlagen in einer Plattform - inklusive Asset Management und Dokumentenverwaltung.'
        },
        {
          question: 'Kann Mendigo auch Anlagen und Geräte verwalten?',
          answer: 'Ja, Mendigo enthält eine vollwertige Asset Management Software. Unsere Asset Management Systeme ermöglichen das Tracking aller Anlagen mit QR-Code-Verknüpfung, Wartungshistorie und Lieferantendaten. Mendigo schafft als Software für Assetmanagement volle Transparenz über Ihren Anlagenbestand.'
        }
      ],
      showMore: 'Weitere Fragen anzeigen',
      showLess: 'Weniger anzeigen'
    },
    // Pricing
    pricing: {
      title: 'Skaliert mit Ihrem Unternehmen',
      subtitle: 'Zusammenarbeit ist der Schlüssel – deshalb zahlen Sie bei uns nicht pro Nutzer. Wählen Sie den passenden Plan und machen Sie Ihre Gebäudeverwaltung nahtlos effizient.',
      billingNote: 'bei jährlicher Abrechnung',
      starter: {
        title: 'Starter',
        price: '247€',
        period: '/Monat',
        description: 'Für Unternehmen mit <strong>einem Gebäude</strong>',
        features: [
          'Unbegrenzte Nutzerzugänge',
          'Alle erweiterten Plattformfunktionen',
          'Analyse-Dashboard',
          'Mobiles Reporting',
          'Mobile App (iOS & Android)',
          'Basis-Support'
        ]
      },
      professional: {
        title: 'Professional',
        price: '447€',
        period: '/Monat',
        description: 'Verwalten Sie <strong>bis zu 5 Gebäude</strong>',
        features: [
          'Unbegrenzte Nutzerzugänge',
          'Alle erweiterten Plattformfunktionen',
          'Analyse-Dashboard',
          'Mobiles Reporting',
          'Mobile App (iOS & Android)',
          'Priorisierter Support'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        
        lets : "Lass uns reden!",
        subb : "Wählen Sie den passenden Tarif und machen Sie Ihr Facility Management nahtlos effizient.",
        price: 'Auf Anfrage',
        period: '',
        description: 'Für mehr als 5 Gebäude',
        features: [
          'Unbegrenzte Nutzerzugänge',
          'Alle erweiterten Plattformfunktionen',
          'Analyse-Dashboard',
          'Mobiles Reporting',
          'Mobile App (iOS & Android)',
          'Priorisierter Support'
        ]
      },
      cta: 'Plan wählen',
      trial: 'Jetzt 14 Tage kostenlos testen'
    },
    // Hero Cards
    heroCards: {
      statuses: {
        open: 'Offenes Problem',
        inProgress: 'In Bearbeitung',
        resolved: 'Gelöst'
      },
      systems: {
        hvac: 'HLK-System',
        lighting: 'Beleuchtungs-​probleme',
        network: 'Netzwerk repariert',
        printer: 'Drucker gewartet'
      },
      descriptions: {
        hvac: 'Temperatursteuerung reagiert nicht',
        lighting: 'Flackernde LED-Lichter',
        network: 'WLAN-Router ersetzt',
        printer: 'Papierstau behoben'
      }
    },
    // Contact
    contact: {
      title: 'Bereit loszulegen?',
      subtitle: 'Kontaktieren Sie uns noch heute für eine persönliche Demo',
      demo: 'Demo vereinbaren',
      sales: 'Vertrieb kontaktieren'
    },
    // Footer
    footer: {
      description: 'Intelligente Facility Management Software für moderne Unternehmen.',
      legal: 'Rechtliches',
      impressum: 'Impressum',
      agb: 'AGB',
      support: 'Support',
      docs: 'Dokumentation',
      api: 'API',
      status: 'Status',
      rights: 'Alle Rechte vorbehalten.'
    },
    printingInstructions: {
      title: 'Druckhinweise für Ihre QR-Codes',
      subtitle: 'Anleitungen für den professionellen Druck Ihrer QR-Codes.',
      intro: 'Sie können Ihre QR-Codes ganz einfach mit Ihrem Drucker ausdrucken.',
      disclaimer: 'Sollten Sie eine beständigere und dauerhaft haltbare Lösung suchen, empfehlen wir den Druck auf Hartschaumplatten oder als Sticker. Wir sind keine Partner der verlinkten Druck-Dienstleister und erhalten keine Provision für Ihren Auftrag.',
      toPrint: 'Zum Druck',
      a4: {
        title: 'A4-Format',
        description: 'Der Link öffnet direkt die passende Bestellseite für A4-Hartschaumplatten. Bitte wählen Sie den Typ abhängig davon, wie viele unterschiedliche QR-Codes (Motive) Ihr PDF enthält.',
        oneMotif: {
          title: 'PDF mit genau 1 QR-Code (1 Motiv)',
          instruction: 'Bitte wählen Sie dort beim Feld Typ folgende Option aus:',
          option: 'Alle Platten gleiches Motiv: hochwertiger Plattendirektdruck auf 2 mm starke Hartschaumplatte weiß'
        },
        multiMotif: {
          title: 'PDF mit 2 oder mehr unterschiedlichen QR-Codes',
          instruction: 'Bitte wählen Sie dort beim Feld Typ folgende Option aus:',
          option: 'Jede Platte anderes Motiv: hochwertiger Plattendirektdruck auf 2 mm starke Hartschaumplatte weiß'
        },
        orderInfo: 'Anschließend können Sie die Menge auf die Seitenzahl des PDFs anpassen und den Druck ganz normal berechnen und bestellen. Die Druckdatei (das generierte PDF) können Sie direkt im Warenkorb hochladen.'
      },
      a5: {
        title: 'A5-Format',
        description: 'Der Link öffnet direkt die Bestellseite für Hartschaumplatten mit freier Größe.',
        typeInstruction: 'Bitte wählen Sie dort beim Feld Typ folgende Option aus:',
        typeOption: 'Jede Platte anderes Motiv: 2mm starke Hartschaumplatte weiß - hochwertiger Plattendirektdruck',
        dimensionsLabel: 'Bitte tragen Sie im Feld Endformat (freies Format) folgende Maße ein:',
        width: 'Breite: 14,8 cm',
        height: 'Höhe: 21,0 cm',
        orderInfo: 'Anschließend können Sie die Menge auf die Seitenzahl des PDFs anpassen und den Druck ganz normal berechnen und bestellen. Sie können die Druckdatei (das generierte PDF) im Warenkorb direkt hochladen.'
      },
      stickers: {
        title: 'Sticker – selbst drucken',
        description: 'Für kleinere QR-Codes empfehlen wir Sticker von Avery Zweckform, die Sie selbst mit einem normalen Drucker bedrucken können.',
        sizes: 'Unsere Vorlagen sind exakt auf diese Etiketten abgestimmt. Bestellen Sie einfach Ihre Wunschgröße (3,5 x 3,5 cm, 4 x 4 cm oder 5 x 5 cm).'
      }
    }
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      features: 'Features',
      benefits: 'Benefits',
      testimonials: 'References', 
      industries: 'Industries',
      pricing: 'Pricing',
      contact: 'Contact',
      login: 'Login',
      tryFree: 'Start free trial'
    },
    // Hero Section
    hero: {
      title: 'Smart Facility Management',
      subtitle: 'No more chaos - our intelligent reporting system transforms problems into clear processes and ensures new efficiency.',
      cta: 'Start free trial',
      learnMore: 'Learn More'
    },
    // Features
    features: {
      badge: 'POWERFUL FEATURES',
      title: 'Streamline all the angles of facility maintenance',
      subtitle: 'Transform your building management with intelligent tools for modern businesses. Experience seamless workflows and measurable ROI.',
      instantReporting: {
        title: 'Instant Problem Reporting',
        description: 'Enable automatic transition from problem detection to solution – with personalized QR code workflows.',
        metric: 'Faster Response Times'
      },
      smartWorkflow: {
        title: 'Smart Workflow Management',
        description: 'Optimize your processes with automatic ticket creation, intelligent assignment, and comprehensive tracking from report to resolution.',
        features: [
          'Automatic ticket creation',
          'Intelligent task assignment',
          'Priority-based filtering',
          'Real-time notifications'
        ],
        metric: 'Efficiency'
      },
      assetManagement: {
        badge: 'COMPREHENSIVE TRACKING',
        title: 'Asset Management',
        subtitle: 'Your Path in Facility Management',
        description: 'Comprehensive monitoring and control tools create full transparency over your maintenance processes.',
        features: [
          'Building & Room Management',
          'Equipment Tracking',
          'Asset-Ticket Linking',
          'Maintenance History'
        ],
        dashboard: {
          liveLabel: 'Live Dashboard',
          building: 'Building A-2',
          total: 'Total',
          active: 'Active',
          issues: 'Issues'
        }
      }
    },
    // Status Quo Comparison
    statusQuo: {
      badge: 'TRANSFORMATION',
      title: 'Break Free from the Status Quo',
      subtitle: 'Ever felt like the coffee machine has a personal vendetta against you? Don\'t panic – it\'s not you. Welcome to the old world of maintenance. Time for an upgrade. Mendigo brings maintenance into the 21st century.',
      problemReporting: {
        category: 'Problem Reporting',
        traditional: {
          title: 'Traditional Method',
          description: 'Phone calls, emails, paper forms',
          problems: [
            'Reports get lost or forgotten',
            'No visual documentation',
            'Unclear location descriptions',
            'Time-consuming manual process'
          ],
          timeToReport: '5–15 minutes',
          accuracy: '60%'
        },
        mendigo: {
          title: 'Mendigo Method',
          description: 'QR Code instant reporting',
          benefits: [
            'Instant digital transmission',
            'Photo evidence included',
            'Automatic location detection',
            '30-second reporting process'
          ],
          timeToReport: '30 seconds',
          accuracy: '99%'
        }
      },
      taskManagement: {
        category: 'Task Management',
        traditional: {
          title: 'Spreadsheets & Whiteboards',
          description: 'Manual tracking systems',
          problems: [
            'No real-time updates',
            'Version control issues',
            'Limited collaboration',
            'Manual status tracking'
          ],
          efficiency: 'Limited',
          visibility: 'Poor'
        },
        mendigo: {
          title: 'Automated Workflows',
          description: 'Smart task management',
          benefits: [
            'Real-time status updates',
            'Automated assignments',
            'Full team collaboration',
            'Progress tracking'
          ],
          efficiency: '95% improvement',
          visibility: 'Complete transparency'
        }
      },
      communication: {
        category: 'Communication',
        traditional: {
          title: 'Phone Tag & Emails',
          description: 'Fragmented communication',
          problems: [
            'Information silos',
            'Delayed responses',
            'Context loss',
            'No central history'
          ],
          responseTime: '2-24 hours',
          contextRetention: 'Low'
        },
        mendigo: {
          title: 'Unified Platform',
          description: 'Central communication hub',
          benefits: [
            'All info in one place',
            'Instant notifications',
            'Complete conversation history',
            'Rich media sharing'
          ],
          responseTime: 'Under 2 minutes',
          contextRetention: '100%'
        }
      },
      impactSummary: {
        title: 'Metrics that Convince',
        metrics: {
          reportingTime: {
            title: '30 Second Reporting',
            description: 'Reporting problems has never been easier. With a QR code scan, the issue is captured - no phone calls, no paperwork, no waiting time.'
          },
          resolution: {
            title: '10x Faster to Solution',
            description: 'Intelligent prioritization and automatic assignment ensure that critical problems are handled immediately - instead of waiting for days.'
          },
          costs: {
            title: '30% Lower Costs',
            description: 'Through optimized processes and reduced downtime, costs per maintenance operation decrease dramatically - more budget for important investments.'
          }
        }
      }
    },
    // Benefits
    benefits: {
      badge: 'YOUR BENEFITS',
      title: 'Features That Simply Make Sense',
      subtitle: 'Experience measurable improvements in efficiency, cost savings, and operational excellence with our comprehensive facility management platform.',
      keyBenefits: [
        {
          title: 'Instant QR Code Reports',
          description: 'Scan, report, and track facility issues in seconds with mobile-optimized workflows.'
        },
        {
          title: 'Central Asset Management',
          description: 'Access a complete list of all assets in one place, including their brands, suppliers, and connected facilities – no more scattered records or confusion.'
        },
        {
          title: 'Task Management',
          description: 'Manage all tasks in the clear Kanban board with live status and complete tracking.'
        },
        {
          title: 'Preventive Maintenance',
          description: 'Plan maintenance work proactively and avoid costly failures through intelligent maintenance cycles.'
        },
        {
          title: 'Document Management',
          description: 'Central storage and management of all documents, plans, and manuals with easy search functionality.'
        },
        {
          title: 'Smart Insights',
          description: 'Data-driven analytics and reports for optimized decisions and continuous improvements.'
        }
      ],
      additionalBenefits: [
        {
          title: 'Advanced Security',
          description: 'Enterprise security with role-based access controls and comprehensive audit logs.'
        },
        {
          title: 'Mobile First',
          description: 'Fully responsive design optimized for mobile devices and mobile facility management.'
        },
        {
          title: 'Data-Driven Insights',
          description: 'Make informed decisions with comprehensive analytics and performance tracking.'
        }
      ],
      stats: {
        fasterResponse: 'Faster Response Times',
        reducedCosts: 'Cost Reduction',
        higherEfficiency: 'Higher Efficiency',
        betterSatisfaction: 'User Satisfaction'
      },
      roiCalculator: {
        badge: 'CALCULATE YOUR SAVINGS',
        title: 'ROI Calculator',
        subtitle: 'Discover your potential savings with our interactive calculator. Adjust the parameters to your facility and see immediate results.',
        adjustParameters: 'Adjust Your Parameters',
        buildings: 'Number of Buildings',
        employees: 'Facility Team Members',
        hoursPerTicket: 'Time Saved per Ticket',
        ticketsPerMonth: 'Tickets per Month',
        ticketsPerMonthPerBuilding: 'Tickets per Month (per Building)',
        travelTimePerTicket: 'Saved Travel Time per Month',
        timeSavedTooltipTitle: 'How is time saved?',
        timeSavedTooltip1: 'Faster communication through digital reports',
        timeSavedTooltip2: 'All documents and history in one place',
        timeSavedTooltip3: 'Automatic time and material logging',
        timeSavedTooltip4: 'No more duplicate data entry',
        travelTimeTooltipTitle: 'How is travel time saved?',
        travelTimeTooltip: 'Clear problem documentation with photos means technicians know what to expect. No more blind trips.',
        hourlyRate: 'Hourly Rate (€)',
        yourResults: 'Your Results',
        calculation: 'Calculation',
        platformCosts: 'Platform Costs',
        month: 'Month',
        totalTickets: 'Total Tickets',
        baseSavings: 'Base Savings',
        travelSavings: 'Travel Time Savings',
        individual: 'Individual',
        contactSales: 'Contact Sales',
        results: {
          monthlySavings: 'Monthly Savings',
          annualSavings: 'Annual Savings',
          platformCostsAnnual: 'Platform Costs (Annual)',
          netAnnualSavings: 'Net Annual Savings',
          paybackTime: 'Payback Time: Immediate (No Upfront Costs)'
        },
        saveNow: 'Save Now',
        freeTrial: '14-day free trial',
        calculationFormula: 'Team Members',
        hours: 'Hours',
        tickets: 'Tickets',
        netSavings: 'Net Savings'
      }
    },
    // Industries
    industries: {
      badge: 'INDUSTRIES',
      title: 'One System – Benefits for Every Industry',
      subtitle: 'Discover how Mendigo solves your biggest problems and achieves measurable improvements.',
      solutionHeadline: 'How we solve your biggest problems:',
      problemLabel: 'Problem:',
      solutionLabel: 'Solution:',
      freeDemoButton: 'Free Demo for',
      requestDemoMobile: 'Request Demo',
      propertyManagement: {
        title: 'Property Management',
        shortTitle: 'Property Mgmt',
        category: 'Real Estate',
        headline: 'End Lost Reports and Dissatisfied Tenants',
        description: 'Transform chaotic communication into smooth digital workflows.',
        painPoints: [
          {
            problem: 'Tenant reports get lost via email and phone',
            solution: 'QR code reports with automatic forwarding and confirmation',
            metric: '95% fewer lost reports'
          },
          {
            problem: 'Contractor coordination takes hours with countless phone calls',
            solution: 'Automatic notifications with all details and photos',
            metric: '3x faster contractor deployment'
          },
          {
            problem: 'Owners constantly demand repair updates',
            solution: 'Transparent documentation with live status for all parties',
            metric: '80% fewer follow-up questions'
          }
        ]
      },
      cleaning: {
        title: 'Cleaning & Maintenance Services',
        shortTitle: 'Facility',
        category: 'Service',
        headline: 'Professional Quality Control Instead of Complaints',
        description: 'Document your work comprehensively and increase customer satisfaction.',
        painPoints: [
          {
            problem: 'Customers complain about incomplete tasks',
            solution: 'Mobile checklists with photo evidence for every activity',
            metric: '90% fewer complaints'
          },
          {
            problem: 'Staff forget tasks or work inefficiently',
            solution: 'Digital task lists with time tracking',
            metric: '25% higher productivity'
          },
          {
            problem: 'Emergencies are detected and handled too late',
            solution: 'Instant push notifications for critical reports',
            metric: '10x faster response'
          }
        ]
      },
      hotels: {
        title: 'Hotels',
        shortTitle: 'Hotels',
        category: 'Hospitality',
        headline: 'Perfect Guest Experience Through Lightning-Fast Problem Solving',
        description: 'Transform guest complaints into wow moments through immediate response.',
        painPoints: [
          {
            problem: 'Guests wait hours for repairs and give bad reviews',
            solution: 'QR codes in every room for instant priority reports',
            metric: '5x faster problem resolution'
          },
          {
            problem: 'Housekeeping overlooks defects during room cleaning',
            solution: 'Integrated checklists with immediate notification to maintenance',
            metric: '85% fewer overlooked defects'
          },
          {
            problem: 'Night shift cannot adequately forward emergencies',
            solution: '24/7 system with automatic escalation based on problem type',
            metric: '100% availability'
          }
        ]
      },
      sports: {
        title: 'Sports Facilities',
        shortTitle: 'Sports',
        category: 'Sports & Recreation',
        headline: 'Safety First – Defects Cost Reputation',
        description: 'With Mendigo, players, staff, and visitors report problems faster than a referee\'s whistle.',
        painPoints: [
          {
            problem: 'Damaged sports equipment endangers users',
            solution: 'Digital inspection protocols with photo documentation',
            metric: '100% liability protection through evidence'
          },
          {
            problem: 'Maintenance teams receive reports too late',
            solution: 'QR scanning with automatic forwarding',
            metric: '10x faster response times'
          },
          {
            problem: 'Subcontractors work uncoordinated',
            solution: 'Central dashboard with roles & responsibilities',
            metric: 'Less radio chaos, more oversight'
          }
        ]
      },
      healthcare: {
        title: 'Hospitals & Care Homes',
        shortTitle: 'Healthcare',
        category: 'Healthcare',
        headline: 'Compliance and Safety – No Room for Error',
        description: 'Meet the highest standards with comprehensive documentation.',
        painPoints: [
          {
            problem: 'Documentation chaos steals time from patient care',
            solution: 'Digital reporting in seconds – more time for patients',
            metric: '25% more time for care'
          },
          {
            problem: 'Overloaded facility team due to miscommunication',
            solution: 'Central ticket system with clear prioritization',
            metric: '30% faster problem resolution'
          },
          {
            problem: 'Duplicate work due to lack of coordination',
            solution: 'Real-time status for everyone – prevents costly double assignments',
            metric: '15% lower operating costs'
          }
        ]
      }
    },
    // Testimonials
    testimonials: {
      badge: 'CUSTOMER SUCCESS',
      title: 'What Our Customers Say',
      testimonials: [
        {
          name: 'Sarah M.',
          title: 'Facility Manager',
          company: 'TechnoSoft Deutschland GmbH',
          quote: 'Mendigo has completely transformed our approach to facility issues. The response times of our entire team have improved drastically.',
          metrics: '65% faster response times'
        },
        {
          name: 'Marcus W.',
          title: 'Operations Manager',
          company: 'Hahn Kunststofftechnik GmbH',
          quote: 'The QR code system is brilliant. Anyone can report problems instantly and the automated workflow ensures nothing is overlooked.',
          metrics: '€20,000 annual savings'
        },
        {
          name: 'Timo R.',
          title: 'Head of Facility Management',
          company: 'Innotech Solutions',
          quote: 'The detailed dashboard provides us with valuable insights and preventive maintenance prevents equipment failures.',
          metrics: '20% less downtime'
        }
      ]
    },
    // QR Demo
    qrDemo: {
      badge: 'QR CODE INNOVATION',
      title: 'Reporting So Simple – Almost Like',
      titleHighlight: 'Magic',
      subtitle: 'Report your issues with a simple scan. No app installation required, no training needed.',
      steps: [
        {
          title: 'Generate & Place QR Codes',
          description: 'Create individual QR codes for your buildings, rooms, facilities, or equipment. Alternatively, reports can also be submitted directly via location detection – completely without a QR code.'
        },
        {
          title: 'Scan & Report Problems',
          description: 'Staff & visitors scan the codes to instantly access assigned forms and report issues. No app required.'
        },
        {
          title: 'Automatic Ticket Creation',
          description: 'Problems are automatically recorded in the system with location data and can be assigned to appropriate teams.'
        }
      ],
      liveDemo: {
        title: 'Watch Live Demo',
        descriptionLine1: 'See how facility teams reduce reporting time from 15 minutes',
        descriptionLine2: 'to 30 seconds with Mendigo.',
        button: 'Book Demo',
        qrDescriptionPart1: 'Scan or ',
        qrDescriptionLink: 'click',
        qrDescriptionPart2: ' for a demo form'
      }
    },
    // Dashboard Preview
    dashboard: {
      badge: 'INTELLIGENT DASHBOARD',
      title: 'But that was before',
      titleHighlight: 'Mendigo',
      subtitle: 'Turn your eyes and ears into your strongest sensors. Mendigo connects visitors, staff, and service providers on an intuitive platform – for seamless and efficient collaboration.',
      viewToggle: {
        analytics: 'Analytics Dashboard',
        board: 'Task Board',
        issues: 'Reports'
      },
      sidebar: {
        menu: 'MENU',
        problems: 'Issues',
        board: 'Board',
        tasks: 'Tasks',
        rooms: 'Rooms',
        assets: 'Assets',
        documents: 'Documents',
        insights: 'Insights',
        qrCodes: 'QR Codes',
        organization: 'Organization',
        helpSupport: 'Help & Support'
      },
      content: {
        insightsTitle: 'Insights',
        stats: {
          toDo: 'To Do',
          inProgress: 'In Progress',
          completed: 'Completed',
          dueToday: 'Due Today',
          overdue: 'Overdue',
          vsLastMonth: '2 vs last month',
          lastWeek: 'Last Week'
        },
        charts: {
          openTasksByPriority: 'Open Tasks by Priority',
          highPriorityTicketsByMember: 'High Priority Tickets by Member',
          activityByUser: 'Activity by User',
          tasksByCategory: 'Tasks by Category',
          tasksByPriority: 'Tasks by Priority'
        },
        tabs: {
          overview: 'Overview',
          spaces: 'Spaces',
          areas: 'Areas',
          assets: 'Assets',
          users: 'Users',
          categories: 'Categories',
          category: 'Category',
          groups: 'Groups'
        },
        insights: {
          export: 'Export',
          allBuildings: 'All buildings',
          overall: 'Overall',
          lastMonth: 'Last month',
          lastWeek: 'Last week',
          search: 'Search...',
          name: 'Name',
          building: 'Building',
          totalTickets: 'Total Tickets',
          lowPriority: 'Low priority',
          mediumPriority: 'Medium priority',
          highPriority: 'High priority',
          noPriority: 'No priority',
          loggedCost: 'Logged cost',
          loggedCosts: 'Logged costs',
          loggedTime: 'Logged time',
          member: 'Member',
          currentlyAssignedTo: 'Currently assigned to',
          group: 'Group',
          category: 'Category',
          user: 'User',
          tasksTotal: 'Tasks (total)',
          taskCountTotal: 'Task count (total)',
          noSpacesFound: 'No spaces found',
          noAssetsFound: 'No assets found',
          noUsersFound: 'No users found',
          noCategoriesFound: 'No categories found',
          noGroupsFound: 'No groups found',
          noHighPriorityTickets: 'No high-priority tickets assigned',
          noUserActivity: 'No user activity data available',
          noCategoryData: 'No category data available',
          exportSuccess: 'Insights exported successfully',
          exportError: 'Failed to export insights',
          high: 'High',
          medium: 'Medium',
          low: 'Low',
        },
        categories: {
          electrical: 'Electrical',
          plumbing: 'Plumbing',
          hvac: 'HVAC',
          security: 'Security',
          maintenance: 'Maintenance'
        },
        board: {
          title: 'Board',
          tabs: {
            allTasks: 'All Tasks',
            myTasks: 'My Tasks',
            highPrio: 'High Priority'
          },
          columns: {
            toDo: 'TO DO',
            inProgress: 'IN PROGRESS',
            done: 'DONE'
          },
          createButton: 'Create',
          searchPlaceholder: 'Search...',
          floor: 'Floor',
          basement: 'Basement',
          lobby: 'Lobby',
          completed: 'Completed'
        },
        issues: {
          title: 'Reported Issues',
          tabs: {
            newIssues: 'New Issues',
            accepted: 'Accepted',
            declined: 'Declined'
          },
          sortBy: 'Sort by',
          accept: 'Accept',
          decline: 'Decline'
        }
      },
      cursors: {
        visitor: 'Visitor Anna',
        technician: 'Technician Max',
        manager: 'Sarah (Manager)'
      }
    },
    // Blog
    blog: {
      badge: 'FROM OUR BLOG',
      title: 'Latest Insights & Updates',
      subtitle: 'Stay informed about the latest trends in facility management, technology insights and best practices from industry experts.',
      posts: [
        {
          category: 'Strategy',
          title: '5 Key Strategies for Modern Facility Management',
          description: 'Discover proven strategies that leading companies in facility management use to optimize their operations, reduce costs and improve tenant satisfaction.',
          readTime: '5 min read'
        },
        {
          category: 'Technology',
          title: 'QR Codes: The Future of Issue Reporting in Facility Management',
          description: 'Learn how QR code technology is revolutionizing maintenance and issue reporting in facility management across the industry.',
          readTime: '3 min read'
        },
        {
          category: 'ROI',
          title: 'Maximizing ROI Through Preventive Maintenance',
          description: 'Understand how preventive maintenance programs can significantly reduce costs and extend asset lifespan.',
          readTime: '7 min read'
        }
      ],
      moreArticles: 'More Articles'
    },
    // FAQ
    faq: {
      badge: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Questions about Mendigo',
      subtitle: '',
      items: [
        {
          question: 'How quickly is Mendigo ready to use?',
          answer: 'Most facilities are productive with Mendigo within 24-48 hours. Our team supports you with onboarding and QR code generation.'
        },
        {
          question: 'Can I import existing data?',
          answer: 'Yes, all rooms and assets in your buildings can be quickly imported via Excel list. This saves you time during setup and you can start working with your existing data right away.'
        },
        {
          question: 'Can external service providers get access?',
          answer: 'Yes, with our role-based user management, access can be granted via email. This allows you to easily give craftsmen, cleaning companies or other external partners access to relevant areas.'
        },
        {
          question: 'Does Mendigo work offline?',
          answer: 'Yes, our smartphone app works offline too. You can capture defects and edit tasks even when there is no internet connection. As soon as you are back online, the app automatically synchronizes all changes.'
        },
        {
          question: 'Is there training for my team?',
          answer: 'We are happy to offer onboarding appointments to support you with setup. Our team will show you all features and answer your questions \u2013 so you can work productively quickly.'
        },
        {
          question: 'Does Mendigo work on mobile devices?',
          answer: 'Absolutely! Mendigo is designed as mobile-first. The entire reporting process is possible without app installation. Simply scan QR codes, report the problem in the web browser, done. Additionally, we offer native apps for iOS and Android in the App Store and on Google Play for all team members (technicians, craftsmen, etc.).'
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes, you can try Mendigo free for 14 days with no obligation. During this time, you have full access to all features and can test the system with your team \u2013 no credit card or hidden costs.'
        },
        {
          question: 'Where is my data stored?',
          answer: 'All data is stored on AWS servers in Germany and is subject to strict German data protection laws and GDPR.'
        },
        {
          question: 'Will there be additional costs?',
          answer: 'No, our prices are completely transparent. There are no hidden costs for onboarding, training, support or updates. The displayed price is the price you pay \u2013 no surprises.'
        },
        {
          question: 'How does Mendigo simplify reporting defects?',
          answer: 'Mendigo is mobile-optimized and accessible via any browser. Employees and visitors simply scan a QR code and can report problems with photos in under 30 seconds \u2013 without any app installation. Digital defect management completely replaces phone calls and emails.'
        },
        {
          question: 'How does Mendigo support caretakers in their daily work?',
          answer: 'As a caretaker app in the App Store and on Google Play, Mendigo offers mobile checklists, photo documentation and real-time notifications. The caretaker app works on any smartphone and helps with prioritizing tasks, time tracking and seamless documentation.'
        },
        {
          question: 'What maintenance tasks can I manage with Mendigo?',
          answer: 'Mendigo is a complete maintenance software for digital maintenance and preventive maintenance management. You can plan recurring maintenance cycles, document maintenance histories and centrally control all maintenance processes with our maintenance management software.'
        },
        {
          question: 'How does Mendigo help with building management?',
          answer: 'Manage multiple buildings, rooms and assets in one platform \u2013 including asset management and document management.'
        },
        {
          question: 'Can Mendigo also manage assets and equipment?',
          answer: 'Yes, Mendigo includes a full-featured asset management software. Our asset management systems enable tracking of all assets with QR code linking, maintenance history and supplier data. As asset management software, Mendigo creates full transparency over your asset inventory.'
        }
      ],
      showMore: 'Show more questions',
      showLess: 'Show less'
    },
    // Pricing
    pricing: {
      title: 'Scales with Your Business',
      subtitle: 'Collaboration is key – that\'s why you don\'t pay per user with us. Choose the right plan and make your facility management seamlessly efficient.',
      billingNote: 'billed annually',
      starter: {
        title: 'Starter',
        price: '€247',
        period: '/Month',
        description: 'For businesses with <strong>one building</strong>',
        features: [
          'Unlimited users',
          'All advanced platform features',
          'Analytics dashboard',
          'Mobile reporting',
          'Mobile app (iOS & Android)',
          'Basic support'
        ]
      },
      professional: {
        title: 'Professional',
        price: '€447',
        period: '/Month',
        description: 'Manage <strong>up to 5 buildings</strong>',
        features: [
          'Unlimited users',
          'All advanced platform features',
          'Analytics dashboard',
          'Mobile reporting',
          'Mobile app (iOS & Android)',
          'Priority support'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        lets : "Let’s talk!",
        subb : "Choose the right plan and make your facility management seamlessly efficient.",
        price: 'On Request',
        period: '',
        description: 'For more than 5 buildings',
        features: [
          'Unlimited users',
          'All advanced platform features',
          'Analytics dashboard',
          'Mobile reporting',
          'Mobile app (iOS & Android)',
          'Priority support'
        ]
      },
      cta: 'Choose Plan',
      trial: 'Start 14-day free trial'
    },
    // Hero Cards
    heroCards: {
      statuses: {
        open: 'Open Issue',
        inProgress: 'In Progress',
        resolved: 'Resolved'
      },
      systems: {
        hvac: 'HVAC System',
        lighting: 'Lighting Issues',
        network: 'Network Fixed',
        printer: 'Printer Serviced'
      },
      descriptions: {
        hvac: 'Temperature control not responding',
        lighting: 'Flickering LED lights',
        network: 'WiFi router replaced',
        printer: 'Paper jam resolved'
      }
    },
    // Contact
    contact: {
      title: 'Ready to Get Started?',
      subtitle: 'Contact us today for a personalized demo',
      demo: 'Book Demo',
      sales: 'Contact Sales'
    },
    // Footer
    footer: {
      description: 'Smart facility management for modern businesses.',
      legal: 'Legal',
      impressum: 'Imprint',
      agb: 'Terms',
      support: 'Support',
      docs: 'Documentation',
      api: 'API',
      status: 'Status',
      rights: 'All rights reserved.'
    },
    printingInstructions: {
      title: 'Printing Instructions for Your QR Codes',
      subtitle: 'Instructions for professional printing of your QR codes.',
      intro: 'You can easily print your QR codes using your printer.',
      disclaimer: 'If you are looking for a more durable and long-lasting solution, we recommend printing on hard foam boards or as stickers. We are not affiliated with the linked printing service providers and do not receive any commission for your order.',
      toPrint: 'To Print',
      a4: {
        title: 'A4 Format',
        description: 'The link opens the order page for A4 hard foam boards. Please select the type depending on how many different QR codes (motifs) your PDF contains.',
        oneMotif: {
          title: 'PDF with exactly 1 QR code (1 motif)',
          instruction: 'Please select the following option in the Type field:',
          option: 'All sheets with the same motif: high-quality direct printing on 2 mm thick white rigid foam sheet'
        },
        multiMotif: {
          title: 'PDF with 2 or more different QR codes',
          instruction: 'Please select the following option in the Type field:',
          option: 'Each panel different motif: high-quality direct panel printing on 2 mm thick white hard foam panel'
        },
        orderInfo: 'You can then adjust the quantity to the number of pages in the PDF and calculate and order the print as normal. You can upload the print file (the generated PDF) directly to your shopping cart.'
      },
      a5: {
        title: 'A5 Format',
        description: 'The link opens the order page for rigid foam boards with custom sizes.',
        typeInstruction: 'Please select the following option in the Type field:',
        typeOption: 'Each board with a different motif: 2 mm thick rigid foam board, white - high-quality direct board printing',
        dimensionsLabel: 'Please enter the following dimensions in the Final format (custom format) field:',
        width: 'Width: 14.8 cm',
        height: 'Height: 21.0 cm',
        orderInfo: 'You can then adjust the quantity to the number of pages in the PDF and calculate and order the print as normal. You can upload the print file (the generated PDF) directly in the shopping cart.'
      },
      stickers: {
        title: 'Stickers – Print Yourself',
        description: 'For smaller QR codes, we recommend stickers from Avery Zweckform, which you can print yourself with a normal printer.',
        sizes: 'Our templates are precisely tailored to these labels. Simply order your desired size (3.5 x 3.5 cm, 4 x 4 cm, or 5 x 5 cm).'
      }
    }
  }
};

export const useTranslation = (language: 'de' | 'en') => {
  return {
    t: translations[language],
    language
  };
};