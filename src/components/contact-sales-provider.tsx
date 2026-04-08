import React, { createContext, useContext, useState } from "react";
import { ContactSalesModal } from "./contact-sales-modal";

interface ContactSalesContextType {
  openContactSales: () => void;
}

const ContactSalesContext = createContext<ContactSalesContextType | undefined>(undefined);

export const useContactSales = () => {
  const context = useContext(ContactSalesContext);
  if (!context) {
    throw new Error("useContactSales must be used within ContactSalesProvider");
  }
  return context;
};

export const ContactSalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <ContactSalesContext.Provider value={{ openContactSales: () => setOpen(true) }}>
      {children}
      <ContactSalesModal open={open} onOpenChange={setOpen} />
    </ContactSalesContext.Provider>
  );
};
