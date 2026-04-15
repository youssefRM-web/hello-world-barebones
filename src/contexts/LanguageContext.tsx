import React, { createContext, useContext, useState, ReactNode } from "react";
import { landingTranslations } from "@/lib/landingTranslations";

type Language = "en" | "de";

interface Translations {
  [key: string]: {
    en: string;
    de: string;
  };
}

const appTranslations: Translations = {
  // Sidebar
  dashboard: { en: "Dashboard", de: "Dashboard" },
  menuCreation: { en: "Menu Creation", de: "Menüerstellung" },
  menuEditing: { en: "Menu Editing", de: "Menübearbeitung" },
  ordersManagement: { en: "Orders Management", de: "Bestellverwaltung" },
  logOut: { en: "Log Out", de: "Abmelden" },
  hello: { en: "Hello", de: "Hallo" },
  user: { en: "User", de: "Benutzer" },
  germany: { en: "Germany", de: "Deutschland" },
  createYourMenu: { en: "Create Your Menu", de: "Erstellen Sie Ihr Menü" },
  chooseBestOption: { en: "Choose the best option for you", de: "Wählen Sie die beste Option für Sie" },
  manualEntry: { en: "Manual Entry", de: "Manuelle Eingabe" },
  manualEntryDesc: { en: "Add dishes one by one with names, prices, and photos", de: "Fügen Sie Gerichte einzeln mit Namen, Preisen und Fotos hinzu" },
  startManualEntry: { en: "Start Manual Entry", de: "Manuelle Eingabe starten" },
  aiMenuScan: { en: "AI Menu Scan", de: "KI-Menüscan" },
  aiMenuScanDesc: { en: "Upload a menu photo or PDF — we'll extract items automatically.", de: "Laden Sie ein Menüfoto oder PDF hoch — wir extrahieren die Artikel automatisch." },
  uploadMenu: { en: "Upload Menu", de: "Menü hochladen" },
  editMenu: { en: "Edit Menu", de: "Menü bearbeiten" },
  manageMenuItems: { en: "Manage your menu items", de: "Verwalten Sie Ihre Menüpunkte" },
  noMenuItems: { en: "No menu items yet", de: "Noch keine Menüpunkte" },
  reviewEditData: { en: "Review & Edit Extracted Data", de: "Extrahierte Daten überprüfen & bearbeiten" },
  reviewEditDataDesc: { en: "Lorem ipsum dolor sit amet, consectetur", de: "Lorem ipsum dolor sit amet, consectetur" },
  orders: { en: "Orders", de: "Bestellungen" },
  manageOrders: { en: "Manage your orders", de: "Verwalten Sie Ihre Bestellungen" },
  noOrders: { en: "No orders yet", de: "Noch keine Bestellungen" },
  orderDetails: { en: "Order Details", de: "Bestelldetails" },
  orderInformation: { en: "Order Information", de: "Bestellinformationen" },
  orderNumber: { en: "Order Number", de: "Bestellnummer" },
  customerName: { en: "Customer Name", de: "Kundenname" },
  orderDateTime: { en: "Order Date & Time", de: "Bestelldatum & Uhrzeit" },
  orderedItems: { en: "Ordered Items", de: "Bestellte Artikel" },
  summary: { en: "Summary", de: "Zusammenfassung" },
  subtotal: { en: "Subtotal", de: "Zwischensumme" },
  serviceFee: { en: "Service Fee", de: "Servicegebühr" },
  totalAmount: { en: "Total Amount", de: "Gesamtbetrag" },
  qty: { en: "Qty", de: "Menge" },
  each: { en: "each", de: "pro Stück" },
  status: { en: "Status", de: "Status" },
  welcomeBack: { en: "Welcome Back!", de: "Willkommen zurück!" },
  menusToday: { en: "Menus Today", de: "Menüs heute" },
  ordersPending: { en: "Orders Pending", de: "Ausstehende Bestellungen" },
  ordersCompleted: { en: "Orders Completed", de: "Abgeschlossene Bestellungen" },
  newCustomers: { en: "New Customers", de: "Neue Kunden" },
  totalOrders: { en: "Total Orders", de: "Gesamtbestellungen" },
  orderUpdated: { en: "Order updated", de: "Bestellung aktualisiert" },
  source: { en: "Source", de: "Quelle" },
  item: { en: "Item", de: "Artikel" },
  category: { en: "Category", de: "Kategorie" },
  helloThere: { en: "Hello, There!", de: "Hallo!" },
  alreadyHaveAccount: { en: "already have an account?", de: "Haben Sie bereits ein Konto?" },
  signIn: { en: "Sign In", de: "Anmelden" },
  signUp: { en: "Sign Up", de: "Registrieren" },
  signInToAccount: { en: "Sign in to your account", de: "Melden Sie sich bei Ihrem Konto an" },
  createRestaurantAccount: { en: "Create your restaurant admin account and start managing your operations effortlessly.", de: "Erstellen Sie Ihr Restaurant-Admin-Konto und verwalten Sie Ihre Abläufe mühelos." },
  createYourAccount: { en: "Create your account", de: "Erstellen Sie Ihr Konto" },
  email: { en: "Email", de: "E-Mail" },
  enterYourEmail: { en: "Enter your email", de: "Geben Sie Ihre E-Mail ein" },
  password: { en: "Password", de: "Passwort" },
  enterYourPassword: { en: "Enter your password", de: "Geben Sie Ihr Passwort ein" },
  forgotPassword: { en: "Forgot Password?", de: "Passwort vergessen?" },
  restaurantName: { en: "Restaurant Name", de: "Restaurantname" },
  address: { en: "Address", de: "Adresse" },
  contactEmail: { en: "Contact Email", de: "Kontakt-E-Mail" },
  phone: { en: "Phone", de: "Telefon" },
  enterPhone: { en: "Enter phone number", de: "Telefonnummer eingeben" },
  foodType: { en: "Food Type", de: "Küchenart" },
  foodTypePlaceholder: { en: "e.g. Italian, Mixed", de: "z.B. Italienisch, Gemischt" },
  latitude: { en: "Latitude", de: "Breitengrad" },
  longitude: { en: "Longitude", de: "Längengrad" },
  dontHaveAccount: { en: "Don't have an account?", de: "Haben Sie noch kein Konto?" },
  loginSuccess: { en: "Login successful", de: "Anmeldung erfolgreich" },
  loginFailed: { en: "Login failed", de: "Anmeldung fehlgeschlagen" },
  signupSuccess: { en: "Account created successfully", de: "Konto erfolgreich erstellt" },
  signupFailed: { en: "Registration failed", de: "Registrierung fehlgeschlagen" },
  error: { en: "Error", de: "Fehler" },
  ordersOverview: { en: "Orders Overview", de: "Bestellungsübersicht" },
  latestOrders: { en: "Latest Orders", de: "Neueste Bestellungen" },
  viewAllOrders: { en: "View All Orders", de: "Alle Bestellungen anzeigen" },
  allOrders: { en: "All Orders", de: "Alle Bestellungen" },
  today: { en: "Today", de: "Heute" },
  pending: { en: "Pending", de: "Ausstehend" },
  completed: { en: "Completed", de: "Abgeschlossen" },
  cancelled: { en: "Cancelled", de: "Storniert" },
  totalRevenue: { en: "Total Revenue", de: "Gesamtumsatz" },
  mostOrdered: { en: "Most Ordered", de: "Am meisten bestellt" },
  dishesOrdered: { en: "dishes ordered", de: "Gerichte bestellt" },
  pizzaMargherita: { en: "Pizza Margherita", de: "Pizza Margherita" },
  spicySeafoodNoodles: { en: "Spicy seafood noodles", de: "Scharfe Meeresfrüchte-Nudeln" },
  pizzaNapolitaine: { en: "Pizza Napolitaine", de: "Pizza Neapolitanisch" },
  spaghettiWithMeatballs: { en: "Spaghetti with meatballs", de: "Spaghetti mit Fleischbällchen" },
  createYourMenuManual: { en: "Create Your Menu", de: "Erstellen Sie Ihr Menü" },
  createMenuWithManualEntry: { en: "Create your menu with Manual Entry", de: "Erstellen Sie Ihr Menü mit manueller Eingabe" },
  addNewItem: { en: "Add New Item", de: "Neues Element hinzufügen" },
  photo: { en: "Photo", de: "Foto" },
  itemName: { en: "Item Name", de: "Artikelname" },
  description: { en: "Description", de: "Beschreibung" },
  price: { en: "Price", de: "Preis" },
  availability: { en: "Availability", de: "Verfügbarkeit" },
  actions: { en: "Actions", de: "Aktionen" },
  uploadPicture: { en: "Upload Picture", de: "Bild hochladen" },
  noPhotoAvailable: { en: "No photo available", de: "Kein Foto verfügbar" },
  goBack: { en: "Go Back", de: "Zurück" },
  addMenu: { en: "Add Menu", de: "Menü hinzufügen" },
  generalMenuInfo: { en: "General Menu Information", de: "Allgemeine Menüinformationen" },
  currency: { en: "Currency", de: "Währung" },
  menuNameLabel: { en: "Menu Name", de: "Menüname" },
  menuNamePlaceholder: { en: "Menu Name", de: "Menüname" },
  menuCategoriesItems: { en: "Menu Categories & Items", de: "Menükategorien & Artikel" },
  itemNamePlaceholder: { en: "eg.Grilled Salmon", de: "z.B. Gegrillter Lachs" },
  descriptionPlaceholder: { en: "Enter description of the item...", de: "Artikelbeschreibung eingeben..." },
  ingredients: { en: "Ingredients", de: "Zutaten" },
  ingredientsPlaceholder: { en: "eg.Salmon,Herbs...", de: "z.B. Lachs, Kräuter..." },
  priceLabel: { en: "Price", de: "Preis" },
  calories: { en: "Calories", de: "Kalorien" },
  caloriesPlaceholder: { en: "eg.Salmon,Herbs...", de: "z.B. Lachs, Kräuter..." },
  portionSize: { en: "Portion Size", de: "Portionsgröße" },
  portionSizePlaceholder: { en: "eg. 200g", de: "z.B. 200g" },
  addItem: { en: "Add Item", de: "Artikel hinzufügen" },
  addCategory: { en: "Add Category", de: "Kategorie hinzufügen" },
  supplements: { en: "Supplements", de: "Beilagen" },
  supplementCategoryName: { en: "Supplement category Name", de: "Beilagen-Kategoriename" },
  supplementCategoryPlaceholder: { en: "eg.Side dishes...", de: "z.B. Beilagen..." },
  supplementItemPlaceholder: { en: "eg.Grilled Salmon", de: "z.B. Gegrillter Lachs" },
  available: { en: "Available", de: "Verfügbar" },
  addSupplementItem: { en: "Add Supplement Item", de: "Beilage hinzufügen" },
  offersPromotions: { en: "Offers & Promotions", de: "Angebote & Aktionen" },
  offerTitle: { en: "Offer Title", de: "Angebotstitel" },
  offerTitlePlaceholder: { en: "eg.Happy Hour", de: "z.B. Happy Hour" },
  offerDescription: { en: "Offer Description", de: "Angebotsbeschreibung" },
  offerDescriptionPlaceholder: { en: "Describe the promotional offer...", de: "Beschreiben Sie das Angebot..." },
  save: { en: "Save", de: "Speichern" },
  cancel: { en: "Cancel", de: "Abbrechen" },
  menuCreationAiUpload: { en: "Menu Creation - AI Upload", de: "Menüerstellung - KI-Upload" },
  upload: { en: "Upload", de: "Hochladen" },
  dragAndDropFiles: { en: "Drag & drop files or", de: "Dateien hierher ziehen oder" },
  browse: { en: "Browse", de: "Durchsuchen" },
  supportedFormats: { en: "Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT", de: "Unterstützte Formate: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT" },
  uploading: { en: "Uploading", de: "Hochladen" },
  files: { en: "files", de: "Dateien" },
  uploaded: { en: "Uploaded", de: "Hochgeladen" },
  uploadFiles: { en: "Upload Files", de: "Dateien hochladen" },
  createdAt: { en: "Created", de: "Erstellt" },
  categoriesCount: { en: "Categories", de: "Kategorien" },
  ordersDescription: { en: "Lorem ipsum dolor sit amet, consectetur", de: "Lorem ipsum dolor sit amet, consectetur" },
  customer: { en: "Customer", de: "Kunde" },
  menu: { en: "Menu", de: "Menü" },
  date: { en: "Date", de: "Datum" },
  accept: { en: "Accept", de: "Akzeptieren" },
  decline: { en: "Decline", de: "Ablehnen" },
  notifications: { en: "Notifications", de: "Benachrichtigungen" },
  noNewNotifications: { en: "No new notifications", de: "Keine neuen Benachrichtigungen" },
  viewAllNotifications: { en: "View all notifications", de: "Alle Benachrichtigungen anzeigen" },
  createNewMenu: { en: "Create New Menu", de: "Neues Menü erstellen" },
  existingMenus: { en: "Your Menus", de: "Ihre Menüs" },
  noMenusYet: { en: "No menus created yet. Create your first menu above!", de: "Noch keine Menüs erstellt. Erstellen Sie oben Ihr erstes Menü!" },
  viewDetails: { en: "View Details", de: "Details anzeigen" },
  items: { en: "items", de: "Artikel" },
  menuCreatedSuccess: { en: "Menu created successfully!", de: "Menü erfolgreich erstellt!" },
  active: { en: "Active", de: "Aktiv" },
  categoryName: { en: "Category Name", de: "Kategoriename" },
  categoryNamePlaceholder: { en: "e.g. Main Dishes", de: "z.B. Hauptgerichte" },
  addSupplementCategory: { en: "Add Supplement Category", de: "Beilagen-Kategorie hinzufügen" },
  noSupplementsAdded: { en: "No supplements added yet", de: "Noch keine Beilagen hinzugefügt" },
  menuUpdatedSuccess: { en: "Menu updated successfully!", de: "Menü erfolgreich aktualisiert!" },
  menuDeletedSuccess: { en: "Menu deleted successfully!", de: "Menü erfolgreich gelöscht!" },
  deleteMenuTitle: { en: "Delete Menu", de: "Menü löschen" },
  deleteMenuConfirm: { en: "Are you sure you want to delete", de: "Möchten Sie wirklich löschen" },
  delete: { en: "Delete", de: "Löschen" },
  readyToUpload: { en: "Ready to upload", de: "Bereit zum Hochladen" },
  uploadSuccess: { en: "Images uploaded successfully! Menu is being processed.", de: "Bilder erfolgreich hochgeladen! Menü wird verarbeitet." },
};

// Merge all translations
const translations: Translations = { ...appTranslations, ...landingTranslations };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
