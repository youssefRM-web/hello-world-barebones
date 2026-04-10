import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminPanel/AdminLayout";
import { TicketsList } from "@/components/AdminPanel/TicketsList";
import { TicketDetail } from "@/components/AdminPanel/TicketDetail";
import { useTicketsQuery } from "@/hooks/queries/useTicketsQuery";
import {
  useAdminOpenTicketsQuery,
  useAdminResolvedTicketsQuery,
  useResolveTicketMutation,
} from "@/hooks/queries/useAdminTicketsQuery";
import { Loader2 } from "lucide-react";

export interface AdminTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: "open" | "resolved";
  priority: "high" | "medium" | "low";
  customer: {
    name: string;
    email: string;
    company: string;
    avatar?: string;
    joined?: Date;
    plan: {
      name: string;
      isActive: boolean;
    };
    totalTickets : number;
  };
  assignee?: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  messages: {
    id: string;
    isStaff: boolean;
    content: string;
    timestamp: Date;
    senderName: string;
    avatar?: string;
    attachments?: string[];
    replyTo?:
      | {
          id: string;
          content: string;
          senderName: string;
          isStaff: boolean;
        }
      | string;
  }[];
}

// Helper to map priority number to string
const mapPriority = (priority: number): "high" | "medium" | "low" => {
  if (priority >= 3) return "high";
  if (priority === 2) return "medium";
  return "low";
};

// Helper to map status - display "open" for open/awaiting tickets, "resolved" for closed
const mapStatus = (status: string): "open" | "resolved" => {
  if (status === "closed" || status === "resolved") return "resolved";
  return "open"; // open, awaiting, pending all map to open
};

export default function AdminTickets() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const { data: allTickets, isLoading: isLoadingAll } = useTicketsQuery();
  const { data: openTickets, isLoading: isLoadingOpen } =
    useAdminOpenTicketsQuery();
  const { data: resolvedTickets, isLoading: isLoadingResolved } =
    useAdminResolvedTicketsQuery();
  const resolveTicketMutation = useResolveTicketMutation();

  // Use the appropriate API based on filter
  const apiTickets =
    filter === "open"
      ? openTickets
      : filter === "resolved"
        ? resolvedTickets
        : allTickets;
  const isLoading =
    filter === "open"
      ? isLoadingOpen
      : filter === "resolved"
        ? isLoadingResolved
        : isLoadingAll;

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  // Transform API tickets to the format expected by components
  const tickets: AdminTicket[] = (apiTickets || ([] as any)).map(
    (ticket: any) => ({
      id: ticket._id,
      ticketNumber: ticket._id.slice(-5),
      subject: ticket.subject || "No Subject",
      description:
        ticket.description || ticket.messages?.[0]?.content || "No description",
      status: mapStatus(ticket.status),
      priority: mapPriority(ticket.priority || 2),
      customer: {
        name: ticket.customer
          ? `${ticket.customer.Name || ""} ${
              ticket.customer.Last_Name || ""
            }`.trim() || "Unknown User"
          : "Unknown User",
        email: ticket.customer?.Email || "unknown@example.com",
        joined: ticket.customer?.createdAt,
        avatar: ticket.customer?.profile_picture,
        company: ticket.customer?.Organization_id?.name,
        plan: {
          name: ticket?.customer?.Organization_id?.currentPlan?.name,
          isActive: ticket?.customer?.Organization_id?.currentPlan?.isActive,
        },
        totalTickets : ticket?.customer?.ticketCounter
      },
      assignee: {
        name: "Support Agent", // Dummy data
      },
      createdAt: new Date(ticket.createdAt),
      messages: (ticket.messages || []).map((msg: any, idx: number) => ({
        id: msg._id || `msg-${idx}`,
        isStaff: msg.isStaff || false,
        content: msg.content || "",
        timestamp: msg.createdAt,
        senderName:  msg.sender
            ? `${msg.sender.Name || ""} ${msg.sender.Last_Name || ""}`.trim() ||
              "Customer"
            : "Customer",
        avatar: msg?.profile_picture,
        attachments: msg.attachments || [],
        replyTo: msg.replyTo
          ? typeof msg.replyTo === "object"
            ? {
                id: msg.replyTo._id,
                content: msg.replyTo.content,
                senderName: msg.replyTo.sender
                    ? `${msg.replyTo.sender.Name || ""} ${
                        msg.replyTo.sender.Last_Name || ""
                      }`.trim() || "Customer"
                    : "Customer",
                avatar: msg?.profile_picture,
                isStaff: msg.replyTo.isStaff || false,
              }
            : msg.replyTo
          : undefined,
      })),
    }),
  );

  // Set default selected ticket
  if (!selectedTicketId && tickets.length > 0) {
    setSelectedTicketId(tickets[0].id);
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex h-full">
        <TicketsList
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
        />
        {selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            onResolve={(id) => resolveTicketMutation.mutate(id)}
            isResolving={resolveTicketMutation.isPending}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {tickets.length === 0
              ? "No tickets found"
              : "Select a ticket to view details"}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
