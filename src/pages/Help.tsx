import React, { useState, useEffect } from "react";
import { MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupportTicketList from "@/components/SupportGroup/SupportTicketList";
import CreateTicketModal from "@/components/SupportGroup/CreateTicketModal";
import TicketChatModal from "@/components/SupportGroup/TicketChatModal";
import { useNavigate, useParams } from "react-router-dom";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useTicketsQuery,
  useTicketDetailQuery,
  Ticket as TicketType,
} from "@/hooks/queries";

export interface Ticket {
  _id: string;
  id: string;
  subject: string;
  lastUpdate: string;
  status: "closed" | "awaiting" | "open" | "pending";
  hasUnread?: boolean;
}

const Help = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: apiTickets = [], isLoading } = useTicketsQuery();
  const { data: ticketDetail } = useTicketDetailQuery(ticketId || null);
  // Open chat modal when ticketId is in the URL
  useEffect(() => {
    if (ticketId) {
      setIsChatOpen(true);
    }
  }, [ticketId]);

  const tickets: Ticket[] = apiTickets.map((ticket) => {
    const date = new Date(ticket.updatedAt);

    const formattedDate = `${String(date.getDate()).padStart(2, "0")}.${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}.${date.getFullYear()}, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;

    return {
      _id: ticket._id,
      id: `#${ticket._id.slice(-5)}`,
      subject: ticket.subject,
      lastUpdate: formattedDate,
      status: ticket.status,
      hasUnread: ticket.read === false,
      user: ticket?.customer,
      attachment: ticket?.attachments,
    };
  });

  const handleCreateTicket = () => {
    setIsCreateTicketOpen(true);
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/dashboard/help/${ticket._id}`);
  };

  // Show loading skeleton while data is being fetched - moved AFTER all hooks
  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <PageLoadingSkeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          {t("pages.help")}
        </h1>

        <Button onClick={handleCreateTicket} className="text-white" size="lg">
          <Plus className="w-4 h-4" />
          {t("support.newTicket")}
        </Button>
      </div>

      {/* Support Tickets */}

      <SupportTicketList tickets={tickets} onTicketClick={handleTicketClick} />

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
      />

      <TicketChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          navigate("/dashboard/help");
        }}
        ticket={ticketDetail || null}
      />
    </div>
  );
};

export default Help;
